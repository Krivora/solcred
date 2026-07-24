import prisma from "@config/db";
import { AppError } from "@middlewares/error.middleware";
import { ActualizarUsuarioDto, CambiarRolDto } from "./usuarios.schema";
import { Rol } from "../../../../generated/prisma/client";

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
  // ── FIX: rol ya no vive en Usuario, se anida vía Personal ──────────────
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

    return tx.usuario.update({
      where: { id },
      data: { tipoUsuario: "CLIENTE" },
      select: seleccionSegura,
    });
  });
};

export const desactivarUsuario = async (id: string, solicitanteId: string) => {
  if (id === solicitanteId) {
    throw new AppError("No puedes desactivar tu propia cuenta", 400);
  }

  const usuario = await prisma.usuario.findUnique({ where: { id } });

  if (!usuario) throw new AppError("Usuario no encontrado", 404);
  if (!usuario.activo) throw new AppError("El usuario ya está desactivado", 400);

  return prisma.usuario.update({
    where: { id },
    data: { activo: false },
    select: seleccionSegura,
  });
};