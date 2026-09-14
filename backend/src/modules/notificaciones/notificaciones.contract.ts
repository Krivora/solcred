/**
 * Contrato de RESPUESTA del módulo `notificaciones`.
 *
 * `SELECT_NOTIFICACION` reutilizable + tipos de respuesta, verificados contra
 * el frontend en `scripts/check-contract.ts`.
 *
 * Sin dependencias de runtime (`import type` de Prisma).
 */
import type { Prisma } from "../../../generated/prisma/client";
import type { NotificacionTipo, NotificacionCanal } from "../../../generated/prisma/enums";

// ─────────────────────────────────────────────────────────────────────────────
// select
// ─────────────────────────────────────────────────────────────────────────────

export const SELECT_NOTIFICACION = {
  id: true,
  tipo: true,
  titulo: true,
  cuerpo: true,
  solicitudId: true,
  documentoId: true,
  agrupadoCount: true,
  metadata: true,
  canal: true,
  leidaEn: true,
  creadoEn: true,
  solicitud: { select: { id: true, folio: true } },
} satisfies Prisma.NotificacionSelect;

/** Fila cruda de Prisma con `SELECT_NOTIFICACION`. */
export type NotificacionRow = Prisma.NotificacionGetPayload<{
  select: typeof SELECT_NOTIFICACION;
}>;

// ─────────────────────────────────────────────────────────────────────────────
// tipos de respuesta
// ─────────────────────────────────────────────────────────────────────────────

/** Una notificación tal como la devuelve el API. */
export interface NotificacionResponse {
  id: string;
  tipo: NotificacionTipo;
  titulo: string;
  cuerpo: string | null;
  solicitudId: string | null;
  solicitud: { id: string; folio: string } | null;
  documentoId: string | null;
  agrupadoCount: number;
  metadata: unknown;
  canal: NotificacionCanal;
  leidaEn: Date | null;
  creadoEn: Date;
}

export interface ContadorNoLeidas {
  count: number;
}
