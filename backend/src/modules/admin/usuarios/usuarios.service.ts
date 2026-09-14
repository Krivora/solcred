import prisma from "@config/db";
import { AppError } from "@middlewares/error.middleware";
import { ActualizarUsuarioDto, CambiarRolDto } from "./usuarios.schema";
import { Prisma, Rol } from "../../../../generated/prisma/client";
import { notificarReasignacionRequerida } from "@modules/notificaciones/notificaciones.service";

type Tx = Prisma.TransactionClient;

const seleccionSegura = {
  id: true,
  correo: true,
  nombre: true,
  apellidoPaterno: true,
  apellidoMaterno: true,
  tipoUsuario: true,
  tipoPersona: true,
  curp: true,
  rfc: true,
  activo: true,
  creadoEn: true,
  actualizadoEn: true,
  intentosFallidos: true,
  bloqueadoHasta: true,
  // El rol y el resto del perfil de staff se anidan vía Personal.
  personal: {
    select: {
      id: true,
      rol: true,
      departamento: true,
      extension: true,
      activo: true,
      fechaIngreso: true,
    },
  },
};

export const listarUsuarios = async () => {
  return prisma.usuario.findMany({
    where: { activo: true },
    select: seleccionSegura,
    orderBy: { creadoEn: "desc" },
  });
};

export const obtenerUsuarioPorId = async (id: string) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    select: seleccionSegura,
  });

  if (!usuario) throw new AppError("Usuario no encontrado", 404);

  return usuario;
};

export const actualizarUsuario = async (
  id: string,
  dto: ActualizarUsuarioDto,
  solicitanteId: string,
  solicitanteRol: string
) => {
  const usuario = await prisma.usuario.findUnique({ where: { id } });

  if (!usuario) throw new AppError("Usuario no encontrado", 404);
  if (!usuario.activo) throw new AppError("El usuario está desactivado", 400);

  // Solo el mismo usuario o un admin puede actualizar
  if (id !== solicitanteId && solicitanteRol !== "ADMIN") {
    throw new AppError("No tienes permisos para modificar este usuario", 403);
  }

  return prisma.usuario.update({
    where: { id },
    data: dto, // dto NO debe incluir "rol" — ver nota sobre el schema Zod abajo
    select: seleccionSegura,
  });
};

/**
 * Asigna o cambia el rol de staff de un usuario.
 * - Si el usuario aún no tiene Personal, lo crea y pasa tipoUsuario a PERSONAL.
 * - Si ya tiene Personal (activo o inactivo), actualiza su rol y lo reactiva.
 */
export const cambiarRol = async (id: string, dto: CambiarRolDto) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    include: { personal: true },
  });

  if (!usuario) throw new AppError("Usuario no encontrado", 404);
  if (!usuario.activo) throw new AppError("El usuario está desactivado", 400);

  return prisma.$transaction(async (tx) => {
    if (usuario.personal) {
      await tx.personal.update({
        where: { id: usuario.personal.id },
        data: { rol: dto.rol as Rol, activo: true },
      });
    } else {
      await tx.personal.create({
        data: {
          userId: usuario.id,
          rol: dto.rol as Rol,
        },
      });
    }

    return tx.usuario.update({
      where: { id },
      data: { tipoUsuario: "PERSONAL" },
      select: seleccionSegura,
    });
  });
};

/**
 * Si el `Personal` que se está dando de baja es GESTOR/ANALISTA y tiene
 * solicitudes con asignación activa, las libera (`activa: false`, con motivo)
 * — quedan visibles de inmediato en la cola de "sin asignar" de Asignación,
 * en vez de aparecer como "ya atendidas" por alguien que ya no puede actuar.
 * Notifica el lote a quien deba reasignar: el supervisor directo
 * (`Personal.supervisorId`) o, si no tiene, cualquier encargado activo del
 * área correspondiente. Best-effort: un fallo notificando no debe impedir la baja.
 */
const liberarAsignacionesDePersonal = async (
  tx: Tx,
  personal: { id: string; rol: Rol; supervisorId: string | null },
  nombreCompleto: string
): Promise<void> => {
  if (personal.rol !== "GESTOR" && personal.rol !== "ANALISTA") return;

  const solicitudes =
    personal.rol === "GESTOR"
      ? await tx.asignacionSolicitud.findMany({
          where: { gestorId: personal.id, activa: true },
          select: { id: true, solicitudId: true, solicitud: { select: { folio: true } } },
        })
      : await tx.asignacionFinanciamiento.findMany({
          where: { analistaId: personal.id, activa: true },
          select: { id: true, solicitudId: true, solicitud: { select: { folio: true } } },
        });

  if (solicitudes.length === 0) return;

  const motivoReasignacion = `Reasignación requerida: ${personal.rol === "GESTOR" ? "gestor" : "analista"} dado de baja`;
  if (personal.rol === "GESTOR") {
    await tx.asignacionSolicitud.updateMany({
      where: { id: { in: solicitudes.map((a) => a.id) } },
      data: { activa: false, fechaReasignacion: new Date(), motivoReasignacion },
    });
  } else {
    await tx.asignacionFinanciamiento.updateMany({
      where: { id: { in: solicitudes.map((a) => a.id) } },
      data: { activa: false, fechaReasignacion: new Date(), motivoReasignacion },
    });
  }

  let destinatarioUserId: string | null = null;
  if (personal.supervisorId) {
    const supervisor = await tx.personal.findUnique({
      where: { id: personal.supervisorId },
      select: { userId: true },
    });
    destinatarioUserId = supervisor?.userId ?? null;
  }
  if (!destinatarioUserId) {
    const rolEncargado = personal.rol === "GESTOR" ? "ENCARGADO_PROMOCION" : "ENCARGADO_FINANCIAMIENTO";
    const encargado = await tx.personal.findFirst({
      where: { rol: rolEncargado, activo: true },
      select: { userId: true },
    });
    destinatarioUserId = encargado?.userId ?? null;
  }

  if (destinatarioUserId) {
    try {
      await notificarReasignacionRequerida(
        tx,
        destinatarioUserId,
        { nombre: nombreCompleto, rol: personal.rol },
        solicitudes.map((a) => ({ id: a.solicitudId, folio: a.solicitud.folio }))
      );
    } catch {
      // Best-effort: ver comentario de la función.
    }
  }
};

/**
 * Revoca el acceso de staff de un usuario: desactiva su Personal
 * (no lo borra, para conservar el historial de asignaciones/auditoría)
 * y regresa el usuario a tipoUsuario CLIENTE.
 */
export const revocarAccesoPersonal = async (id: string) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    include: { personal: true },
  });

  if (!usuario) throw new AppError("Usuario no encontrado", 404);
  if (!usuario.personal) {
    throw new AppError("Este usuario no tiene un perfil de Personal", 400);
  }

  return prisma.$transaction(async (tx) => {
    await tx.personal.update({
      where: { id: usuario.personal!.id },
      data: { activo: false },
    });

    await liberarAsignacionesDePersonal(
      tx,
      usuario.personal!,
      `${usuario.nombre} ${usuario.apellidoPaterno}`
    );

    return tx.usuario.update({
      where: { id },
      data: { tipoUsuario: "CLIENTE" },
      select: seleccionSegura,
    });
  });
};

/**
 * Desbloquea manualmente una cuenta que quedó bloqueada por intentos fallidos
 * de login (ver `intentosFallidos`/`bloqueadoHasta` en el modelo Usuario).
 * No falla si la cuenta no estaba bloqueada: es un no-op seguro.
 */
export const desbloquearUsuario = async (id: string) => {
  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario) throw new AppError("Usuario no encontrado", 404);

  return prisma.usuario.update({
    where: { id },
    data: { intentosFallidos: 0, bloqueadoHasta: null },
    select: seleccionSegura,
  });
};

export const desactivarUsuario = async (id: string, solicitanteId: string) => {
  if (id === solicitanteId) {
    throw new AppError("No puedes desactivar tu propia cuenta", 400);
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id },
    include: { personal: true },
  });

  if (!usuario) throw new AppError("Usuario no encontrado", 404);
  if (!usuario.activo) throw new AppError("El usuario ya está desactivado", 400);

  return prisma.$transaction(async (tx) => {
    if (usuario.personal?.activo) {
      await liberarAsignacionesDePersonal(
        tx,
        usuario.personal,
        `${usuario.nombre} ${usuario.apellidoPaterno}`
      );
    }

    return tx.usuario.update({
      where: { id },
      data: { activo: false },
      select: seleccionSegura,
    });
  });
};