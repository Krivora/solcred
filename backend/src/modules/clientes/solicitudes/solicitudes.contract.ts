/**
 * Contrato de RESPUESTA del módulo `clientes/solicitudes`.
 *
 * Fuente única de los `include`/`select` que usa el servicio y de los tipos de
 * respuesta derivados de ellos con `Prisma.*GetPayload`. Un cambio en el shape
 * de una consulta se propaga a `tsc` (backend) y, vía `scripts/check-contract.ts`,
 * al frontend.
 *
 * Este archivo NO tiene dependencias de runtime (`import type` de Prisma): puede
 * importarse desde el script de chequeo sin arrastrar el cliente de Prisma.
 */
import type { Prisma } from "../../../../generated/prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// includes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Detalle de una solicitud para el portal del cliente. Lo devuelven `GET /:id`,
 * `POST /`, `PUT /:id/generales` y `PATCH /:id/enviar`.
 *
 * `programa` va acotado a lo que consume el formulario (nombre + secciones); no
 * incluye `documentos` (eso vive en el expediente) ni asignaciones (el gestor
 * interno solo se expone en `admin/promocion`).
 */
export const INCLUDE_SOLICITUD_DETALLE = {
  programa: {
    select: {
      id: true,
      nombre: true,
      secciones: { select: { seccion: true, requerimiento: true } },
    },
  },
  datosSolicitante: true,
  datosAval: true,
  datosCredito: { include: { conceptos: true } },
  datosGarantia: { include: { garantias: true } },
  datosNegocio: true,
  datosMercado: true,
  datosBancarios: true,
} satisfies Prisma.SolicitudInclude;

/** Fila del listado paginado `GET /`. */
export const INCLUDE_SOLICITUD_LISTA = {
  programa: { select: { id: true, nombre: true } },
  datosSolicitante: {
    select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true },
  },
  datosCredito: { include: { conceptos: true } },
} satisfies Prisma.SolicitudInclude;

/** Detalle + `documentos`: solo para armar el PDF de la solicitud. */
export const INCLUDE_SOLICITUD_PDF = {
  ...INCLUDE_SOLICITUD_DETALLE,
  documentos: { include: { tipoDocumento: true } },
} satisfies Prisma.SolicitudInclude;

// ─────────────────────────────────────────────────────────────────────────────
// tipos de respuesta
// ─────────────────────────────────────────────────────────────────────────────

export type SolicitudDetalle = Prisma.SolicitudGetPayload<{
  include: typeof INCLUDE_SOLICITUD_DETALLE;
}>;

export type SolicitudListaItem = Prisma.SolicitudGetPayload<{
  include: typeof INCLUDE_SOLICITUD_LISTA;
}>;

export type SolicitudParaPDF = Prisma.SolicitudGetPayload<{
  include: typeof INCLUDE_SOLICITUD_PDF;
}>;

// Sub-formularios planos (upsert 1-a-1 con Solicitud).
export type DatosSolicitanteResp = Prisma.DatosSolicitanteGetPayload<{}>;
export type DatosAvalResp = Prisma.DatosAvalGetPayload<{}>;
export type DatosNegocioResp = Prisma.DatosNegocioGetPayload<{}>;
export type DatosMercadoResp = Prisma.DatosMercadoGetPayload<{}>;
export type DatosBancariosResp = Prisma.DatosBancariosGetPayload<{}>;

// Sub-formularios con arreglo anidado (se reemplazan en transacción).
export type DatosCreditoResp = Prisma.DatosCreditoGetPayload<{
  include: { conceptos: true };
}>;
export type DatosGarantiaResp = Prisma.DatosGarantiaGetPayload<{
  include: { garantias: true };
}>;
