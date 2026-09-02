import prisma from "@config/db";
import { AppError } from "@middlewares/error.middleware";
import { RolAplicacion } from "@utils/jwt";
import { paginado } from "@utils/pagination";
import { Prisma } from "../../../generated/prisma/client";
import { SEGUIMIENTO_RECIENTE_MS } from "./crm.config";
import {
  listarComunicacionesQuerySchema,
  type CrearComunicacionDto,
  type EditarComunicacionDto,
} from "./crm.schema";
import {
  SELECT_COMUNICACION,
  type ComunicacionRow,
  type ComunicacionResponse,
  type ResumenComunicaciones,
} from "./crm.contract";

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXTO Y PERMISOS
// ─────────────────────────────────────────────────────────────────────────────

export interface Actor {
  id: string; // Usuario.id
  rol: RolAplicacion;
  personalId?: string; // Personal.id — presente para staff
}

/** Roles con acceso a cualquier solicitud (SUPERVISOR solo lectura). */
const ROLES_ACCESO_GENERAL: RolAplicacion[] = [
  "ADMIN",
  "SUPERVISOR",
  "ENCARGADO_PROMOCION",
  "ENCARGADO_FINANCIAMIENTO",
  "MESA_CONTROL",
];

const exigirPersonal = (actor: Actor): string => {
  if (!actor.personalId) {
    throw new AppError(
      "Solo el personal puede registrar o editar comunicaciones",
      403
    );
  }
  return actor.personalId;
};

/**
 * ¿Puede el actor ver/registrar comunicaciones de esta solicitud?
 * - ROLES_ACCESO_GENERAL: cualquier solicitud (SUPERVISOR nunca en escritura).
 * - GESTOR: solo si tiene `AsignacionSolicitud` activa.
 * - ANALISTA: solo si tiene `AsignacionFinanciamiento` activa.
 * - CLIENTE / otros: nunca (CRM es interno).
 */
const verificarAccesoSolicitud = async (
  solicitudId: string,
  actor: Actor,
  opts: { escritura: boolean }
) => {
  const solicitud = await prisma.solicitud.findUnique({
    where: { id: solicitudId },
    select: {
      id: true,
      solicitanteId: true,
      asignaciones: { where: { activa: true }, select: { gestorId: true } },
      asignacionesFinanciamiento: {
        where: { activa: true },
        select: { analistaId: true },
      },
    },
  });
  if (!solicitud) throw new AppError("Solicitud no encontrada", 404);

  if (actor.rol === "CLIENTE") {
    throw new AppError("No tienes acceso al CRM", 403);
  }
  if (opts.escritura && actor.rol === "SUPERVISOR") {
    throw new AppError("El rol Supervisor es de solo lectura", 403, "SOLO_LECTURA");
  }
  if (ROLES_ACCESO_GENERAL.includes(actor.rol)) return solicitud;

  if (
    actor.rol === "GESTOR" &&
    solicitud.asignaciones.some((a) => a.gestorId === actor.personalId)
  ) {
    return solicitud;
  }
  if (
    actor.rol === "ANALISTA" &&
    solicitud.asignacionesFinanciamiento.some(
      (a) => a.analistaId === actor.personalId
    )
  ) {
    return solicitud;
  }

  throw new AppError(
    "No tienes acceso a las comunicaciones de esta solicitud",
    403
  );
};

const whereClientePorRol = (
  clienteId: string,
  actor: Actor
): Prisma.ComunicacionWhereInput => {
  if (actor.rol === "CLIENTE") throw new AppError("No tienes acceso al CRM", 403);
  const base: Prisma.ComunicacionWhereInput = { clienteId };
  if (ROLES_ACCESO_GENERAL.includes(actor.rol)) return base;
  if (actor.rol === "GESTOR") {
    return {
      ...base,
      solicitud: {
        asignaciones: { some: { activa: true, gestorId: actor.personalId } },
      },
    };
  }
  if (actor.rol === "ANALISTA") {
    return {
      ...base,
      solicitud: {
        asignacionesFinanciamiento: {
          some: { activa: true, analistaId: actor.personalId },
        },
      },
    };
  }
  throw new AppError("No tienes acceso al CRM", 403);
};

const validarFechaContacto = (iso?: string): Date => {
  const fecha = iso ? new Date(iso) : new Date();
  if (Number.isNaN(fecha.getTime())) {
    throw new AppError("fechaContacto inválida", 422);
  }
  if (fecha.getTime() > Date.now() + 60_000) {
    throw new AppError("La fecha de contacto no puede ser futura", 422);
  }
  return fecha;
};

// ─────────────────────────────────────────────────────────────────────────────
// MAPPER
// ─────────────────────────────────────────────────────────────────────────────

const aResponse = (row: ComunicacionRow): ComunicacionResponse => ({
  id: row.id,
  solicitudId: row.solicitudId,
  clienteId: row.clienteId,
  solicitud: row.solicitud,
  fechaContacto: row.fechaContacto,
  tipo: row.tipo,
  motivo: row.motivo,
  resultado: row.resultado,
  observaciones: row.observaciones,
  creadoEn: row.creadoEn,
  editadoEn: row.editadoEn,
  registradoPor: {
    id: row.registradoPor.id,
    nombre: row.registradoPor.usuario.nombre,
    apellidoPaterno: row.registradoPor.usuario.apellidoPaterno,
    apellidoMaterno: row.registradoPor.usuario.apellidoMaterno,
  },
});

const ORDEN_CRONOLOGICO: Prisma.ComunicacionOrderByWithRelationInput[] = [
  { fechaContacto: "desc" },
  { creadoEn: "desc" },
];

// ─────────────────────────────────────────────────────────────────────────────
// CREAR
// ─────────────────────────────────────────────────────────────────────────────

export const crearComunicacion = async (
  actor: Actor,
  dto: CrearComunicacionDto
): Promise<ComunicacionResponse> => {
  const personalId = exigirPersonal(actor);
  const solicitud = await verificarAccesoSolicitud(dto.solicitudId, actor, {
    escritura: true,
  });
  const fechaContacto = validarFechaContacto(dto.fechaContacto);

  const creada = await prisma.comunicacion.create({
    data: {
      solicitudId: solicitud.id,
      clienteId: solicitud.solicitanteId,
      registradoPorId: personalId,
      fechaContacto,
      tipo: dto.tipo,
      motivo: dto.motivo,
      resultado: dto.resultado,
      observaciones: dto.observaciones ?? null,
    },
    select: SELECT_COMUNICACION,
  });

  return aResponse(creada);
};

// ─────────────────────────────────────────────────────────────────────────────
// LISTAR (historial por solicitud o por cliente)
// ─────────────────────────────────────────────────────────────────────────────

export const listarComunicaciones = async (actor: Actor, rawQuery: unknown) => {
  const q = listarComunicacionesQuerySchema.parse(rawQuery ?? {});
  const page = q.page ?? 1;
  const pageSize = q.pageSize ?? 20;

  let where: Prisma.ComunicacionWhereInput;
  if (q.solicitudId) {
    await verificarAccesoSolicitud(q.solicitudId, actor, { escritura: false });
    where = { solicitudId: q.solicitudId };
  } else {
    where = whereClientePorRol(q.clienteId as string, actor);
  }

  const [filas, total] = await Promise.all([
    prisma.comunicacion.findMany({
      where,
      select: SELECT_COMUNICACION,
      orderBy: ORDEN_CRONOLOGICO,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.comunicacion.count({ where }),
  ]);

  return paginado(filas.map(aResponse), page, pageSize, total);
};

// ─────────────────────────────────────────────────────────────────────────────
// RESUMEN (indicadores de la solicitud)
// ─────────────────────────────────────────────────────────────────────────────

export const obtenerResumen = async (
  actor: Actor,
  solicitudId: string
): Promise<ResumenComunicaciones> => {
  await verificarAccesoSolicitud(solicitudId, actor, { escritura: false });

  const [total, ultima] = await Promise.all([
    prisma.comunicacion.count({ where: { solicitudId } }),
    prisma.comunicacion.findFirst({
      where: { solicitudId },
      orderBy: ORDEN_CRONOLOGICO,
      select: SELECT_COMUNICACION,
    }),
  ]);

  const seguimientoReciente =
    !!ultima &&
    Date.now() - ultima.fechaContacto.getTime() <= SEGUIMIENTO_RECIENTE_MS;

  return {
    total,
    ultima: ultima ? aResponse(ultima) : null,
    seguimientoReciente,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// EDITAR (solo el autor)
// ─────────────────────────────────────────────────────────────────────────────

export const editarComunicacion = async (
  actor: Actor,
  id: string,
  dto: EditarComunicacionDto
): Promise<ComunicacionResponse> => {
  const personalId = exigirPersonal(actor);

  const existente = await prisma.comunicacion.findUnique({
    where: { id },
    select: { id: true, registradoPorId: true },
  });
  if (!existente) throw new AppError("Comunicación no encontrada", 404);
  if (existente.registradoPorId !== personalId) {
    throw new AppError("Solo el autor puede editar esta comunicación", 403);
  }

  const data: Prisma.ComunicacionUpdateInput = { editadoEn: new Date() };
  if (dto.tipo) data.tipo = dto.tipo;
  if (dto.motivo) data.motivo = dto.motivo;
  if (dto.resultado) data.resultado = dto.resultado;
  if (dto.observaciones !== undefined) data.observaciones = dto.observaciones;
  if (dto.fechaContacto !== undefined) {
    data.fechaContacto = validarFechaContacto(dto.fechaContacto);
  }

  const actualizada = await prisma.comunicacion.update({
    where: { id },
    data,
    select: SELECT_COMUNICACION,
  });

  return aResponse(actualizada);
};
