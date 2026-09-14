import prisma from "@config/db";
import { AppError } from "@middlewares/error.middleware";
import { paginado } from "@utils/pagination";
import { Prisma } from "../../../generated/prisma/client";
import type { EstatusSolicitud } from "../../../generated/prisma/enums";
import { MAX_IDS_EN_METADATA, NOTIFICA_CAMBIO_ESTATUS_CLIENTE } from "./notificaciones.config";
import { listarNotificacionesQuerySchema } from "./notificaciones.schema";
import { SELECT_NOTIFICACION, type NotificacionRow, type NotificacionResponse } from "./notificaciones.contract";

export type Tx = Prisma.TransactionClient;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS INTERNOS
// ─────────────────────────────────────────────────────────────────────────────

const truncar = (texto: string, max = 90): string =>
  texto.length > max ? `${texto.slice(0, max - 1)}…` : texto;

const aResponse = (row: NotificacionRow): NotificacionResponse => ({
  id: row.id,
  tipo: row.tipo,
  titulo: row.titulo,
  cuerpo: row.cuerpo,
  solicitudId: row.solicitudId,
  solicitud: row.solicitud,
  documentoId: row.documentoId,
  agrupadoCount: row.agrupadoCount,
  metadata: row.metadata,
  canal: row.canal,
  leidaEn: row.leidaEn,
  creadoEn: row.creadoEn,
});

interface SolicitudMini {
  id: string;
  folio: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CREACIÓN — llamadas por otros módulos, dentro de su propia transacción
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Notifica a un GESTOR o ANALISTA que se le asignó(ron) solicitud(es) nueva(s).
 * Con una sola solicitud, la notificación queda ligada a ella (clic → detalle).
 * Con varias, es UNA fila agrupada (clic → lista de "mis casos"), siguiendo el
 * pedido de "se te asignaron X solicitudes nuevas" en vez de X notificaciones.
 */
const notificarAsignacion = async (
  tx: Tx,
  tipo: "ASIGNACION_GESTOR" | "ASIGNACION_ANALISTA",
  usuarioDestinoId: string,
  solicitudes: SolicitudMini[]
): Promise<void> => {
  if (solicitudes.length === 0) return;

  if (solicitudes.length === 1) {
    await tx.notificacion.create({
      data: {
        usuarioId: usuarioDestinoId,
        tipo,
        titulo: `Se te asignó la solicitud ${solicitudes[0].folio}.`,
        solicitudId: solicitudes[0].id,
        agrupadoCount: 1,
      },
    });
    return;
  }

  const truncadas = solicitudes.slice(0, MAX_IDS_EN_METADATA);
  await tx.notificacion.create({
    data: {
      usuarioId: usuarioDestinoId,
      tipo,
      titulo: `Se te asignaron ${solicitudes.length} solicitudes nuevas.`,
      solicitudId: null,
      agrupadoCount: solicitudes.length,
      metadata: {
        solicitudIds: truncadas.map((s) => s.id),
        folios: truncadas.map((s) => s.folio),
      },
    },
  });
};

export const notificarAsignacionGestor = (
  tx: Tx,
  gestorUsuarioId: string,
  solicitudes: SolicitudMini[]
) => notificarAsignacion(tx, "ASIGNACION_GESTOR", gestorUsuarioId, solicitudes);

export const notificarAsignacionAnalista = (
  tx: Tx,
  analistaUsuarioId: string,
  solicitudes: SolicitudMini[]
) => notificarAsignacion(tx, "ASIGNACION_ANALISTA", analistaUsuarioId, solicitudes);

/** Personal (gestor o analista) al que se le regresa una solicitud que ya tenía. */
export const notificarSolicitudRegresada = async (
  tx: Tx,
  usuarioDestinoId: string,
  solicitud: SolicitudMini,
  motivo?: string | null
): Promise<void> => {
  const sufijo = motivo ? `: ${truncar(motivo)}` : "";
  await tx.notificacion.create({
    data: {
      usuarioId: usuarioDestinoId,
      tipo: "SOLICITUD_REGRESADA",
      titulo: `Se te regresó la solicitud ${solicitud.folio}${sufijo}.`,
      cuerpo: motivo ?? null,
      solicitudId: solicitud.id,
    },
  });
};

/** Personal (gestor o analista) dueño de una solicitud que lleva demasiado tiempo sin avanzar. */
export const notificarSolicitudEstancada = async (
  tx: Tx,
  usuarioDestinoId: string,
  solicitud: SolicitudMini,
  dias: number
): Promise<void> => {
  await tx.notificacion.create({
    data: {
      usuarioId: usuarioDestinoId,
      tipo: "SOLICITUD_ESTANCADA",
      titulo: `Tu solicitud ${solicitud.folio} lleva ${dias} días sin avance.`,
      solicitudId: solicitud.id,
    },
  });
};

/**
 * Cliente: cambio de estatus de su solicitud. No-op si el estatus destino no
 * está marcado como relevante para el cliente (ver `notificaciones.config.ts`).
 *
 * El label legible del estatus vive únicamente en el frontend
 * (`estatus.tokens.ts`) — aquí se guarda el enum crudo en `metadata` para que
 * el cliente lo resuelva sin duplicar esa tabla en el backend.
 */
export const notificarCambioEstatus = async (
  tx: Tx,
  solicitanteId: string,
  solicitud: SolicitudMini,
  estatusAnterior: EstatusSolicitud,
  estatusNuevo: EstatusSolicitud,
  motivo?: string | null
): Promise<void> => {
  if (!NOTIFICA_CAMBIO_ESTATUS_CLIENTE[estatusNuevo]) return;

  await tx.notificacion.create({
    data: {
      usuarioId: solicitanteId,
      tipo: "CAMBIO_ESTATUS",
      titulo: `Tu solicitud ${solicitud.folio} cambió de estatus a ${estatusNuevo.replace(/_/g, " ").toLowerCase()}.`,
      cuerpo: motivo ?? null,
      solicitudId: solicitud.id,
      metadata: { estatusAnterior, estatusNuevo },
    },
  });
};

/** Cliente: se le asignó gestor o analista a su solicitud. */
export const notificarResponsableAsignado = async (
  tx: Tx,
  solicitanteId: string,
  solicitud: SolicitudMini,
  rol: "GESTOR" | "ANALISTA"
): Promise<void> => {
  const rolTexto = rol === "GESTOR" ? "gestor" : "analista";
  await tx.notificacion.create({
    data: {
      usuarioId: solicitanteId,
      tipo: "RESPONSABLE_ASIGNADO",
      titulo: `Se asignó un ${rolTexto} a tu solicitud ${solicitud.folio}.`,
      solicitudId: solicitud.id,
      metadata: { rol },
    },
  });
};

/**
 * Supervisor/encargado: se dio de baja un gestor o analista que tenía
 * solicitudes activas — quedaron liberadas (`activa: false`) y necesitan
 * reasignación manual. Una notificación agrupada por lote, igual criterio
 * que `notificarAsignacion` (n=1 → liga a esa solicitud; n>1 → agrupada).
 */
export const notificarReasignacionRequerida = async (
  tx: Tx,
  destinatarioUsuarioId: string,
  personalDadoDeBaja: { nombre: string; rol: "GESTOR" | "ANALISTA" },
  solicitudes: SolicitudMini[]
): Promise<void> => {
  if (solicitudes.length === 0) return;

  const rolTexto = personalDadoDeBaja.rol === "GESTOR" ? "gestor" : "analista";
  const truncadas = solicitudes.slice(0, MAX_IDS_EN_METADATA);
  const metadata = {
    rolPersonal: personalDadoDeBaja.rol,
    solicitudIds: truncadas.map((s) => s.id),
    folios: truncadas.map((s) => s.folio),
  };

  if (solicitudes.length === 1) {
    await tx.notificacion.create({
      data: {
        usuarioId: destinatarioUsuarioId,
        tipo: "REASIGNACION_REQUERIDA",
        titulo: `Se dio de baja al ${rolTexto} ${personalDadoDeBaja.nombre}: la solicitud ${solicitudes[0].folio} quedó sin asignar.`,
        solicitudId: solicitudes[0].id,
        metadata,
      },
    });
    return;
  }

  await tx.notificacion.create({
    data: {
      usuarioId: destinatarioUsuarioId,
      tipo: "REASIGNACION_REQUERIDA",
      titulo: `Se dio de baja al ${rolTexto} ${personalDadoDeBaja.nombre}: ${solicitudes.length} solicitudes quedaron sin asignar.`,
      solicitudId: null,
      agrupadoCount: solicitudes.length,
      metadata,
    },
  });
};

/** Cliente: se rechazó un documento de su expediente. */
export const notificarDocumentoRechazado = async (
  tx: Tx,
  solicitanteId: string,
  solicitud: SolicitudMini,
  documento: { id: string; nombreDocumento: string },
  motivo: string
): Promise<void> => {
  await tx.notificacion.create({
    data: {
      usuarioId: solicitanteId,
      tipo: "DOCUMENTO_RECHAZADO",
      titulo: `Tu documento «${documento.nombreDocumento}» fue rechazado: ${truncar(motivo)}.`,
      cuerpo: motivo,
      solicitudId: solicitud.id,
      documentoId: documento.id,
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// LECTURA Y ESTADO — endpoints HTTP, cada usuario sobre su propia bandeja
// ─────────────────────────────────────────────────────────────────────────────

export const listarNotificaciones = async (usuarioId: string, rawQuery: unknown) => {
  const q = listarNotificacionesQuerySchema.parse(rawQuery ?? {});
  const page = q.page ?? 1;
  const pageSize = q.pageSize ?? 20;

  const where: Prisma.NotificacionWhereInput = {
    usuarioId,
    ...(q.soloNoLeidas ? { leidaEn: null } : {}),
  };

  const [filas, total] = await Promise.all([
    prisma.notificacion.findMany({
      where,
      select: SELECT_NOTIFICACION,
      orderBy: { creadoEn: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.notificacion.count({ where }),
  ]);

  return paginado(filas.map(aResponse), page, pageSize, total);
};

export const contarNoLeidas = async (usuarioId: string): Promise<{ count: number }> => {
  const count = await prisma.notificacion.count({
    where: { usuarioId, leidaEn: null },
  });
  return { count };
};

export const marcarLeida = async (
  usuarioId: string,
  id: string
): Promise<NotificacionResponse> => {
  const existente = await prisma.notificacion.findUnique({
    where: { id },
    select: { id: true, usuarioId: true, leidaEn: true },
  });
  if (!existente || existente.usuarioId !== usuarioId) {
    throw new AppError("Notificación no encontrada", 404);
  }

  const actualizada = await prisma.notificacion.update({
    where: { id },
    data: { leidaEn: existente.leidaEn ?? new Date() },
    select: SELECT_NOTIFICACION,
  });

  return aResponse(actualizada);
};

export const marcarTodasLeidas = async (usuarioId: string): Promise<{ actualizadas: number }> => {
  const { count } = await prisma.notificacion.updateMany({
    where: { usuarioId, leidaEn: null },
    data: { leidaEn: new Date() },
  });
  return { actualizadas: count };
};
