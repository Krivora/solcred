/**
 * Contrato de RESPUESTA del módulo `crm`.
 *
 * `SELECT_COMUNICACION` reutilizable + tipos de respuesta. El shape que expone
 * el service (`ComunicacionResponse`) está aplanado respecto a Prisma
 * (`registradoPor.usuario.*` → `registradoPor.*`) y por eso se declara con una
 * interfaz explícita, verificada contra el frontend en
 * `scripts/check-contract.ts`.
 *
 * Sin dependencias de runtime (`import type` de Prisma).
 */
import type { Prisma } from "../../../generated/prisma/client";
import type {
  ComunicacionTipo,
  ComunicacionMotivo,
  ComunicacionResultado,
} from "../../../generated/prisma/enums";

// ─────────────────────────────────────────────────────────────────────────────
// select
// ─────────────────────────────────────────────────────────────────────────────

export const SELECT_COMUNICACION = {
  id: true,
  solicitudId: true,
  clienteId: true,
  fechaContacto: true,
  tipo: true,
  motivo: true,
  resultado: true,
  observaciones: true,
  creadoEn: true,
  editadoEn: true,
  solicitud: { select: { id: true, folio: true } },
  registradoPor: {
    select: {
      id: true,
      usuario: {
        select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true },
      },
    },
  },
} satisfies Prisma.ComunicacionSelect;

/** Fila cruda de Prisma con `SELECT_COMUNICACION`. */
export type ComunicacionRow = Prisma.ComunicacionGetPayload<{
  select: typeof SELECT_COMUNICACION;
}>;

// ─────────────────────────────────────────────────────────────────────────────
// tipos de respuesta — transformados
// ─────────────────────────────────────────────────────────────────────────────

export interface PersonaMini {
  id: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
}

/** Una comunicación tal como la devuelve el API (registradoPor aplanado). */
export interface ComunicacionResponse {
  id: string;
  solicitudId: string;
  clienteId: string;
  solicitud: { id: string; folio: string };
  fechaContacto: Date;
  tipo: ComunicacionTipo;
  motivo: ComunicacionMotivo;
  resultado: ComunicacionResultado;
  observaciones: string | null;
  creadoEn: Date;
  editadoEn: Date | null;
  registradoPor: PersonaMini;
}

export interface ResumenComunicaciones {
  total: number;
  ultima: ComunicacionResponse | null;
  seguimientoReciente: boolean;
}
