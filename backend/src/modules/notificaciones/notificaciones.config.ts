/**
 * Constantes del módulo de notificaciones.
 */
import type { EstatusSolicitud } from "../../../generated/prisma/enums";

/** Tope de ids/folios que se guardan en `metadata` de una notificación
 *  agrupada — más allá de esto solo se confía en `agrupadoCount`. */
export const MAX_IDS_EN_METADATA = 50;

/**
 * Qué transiciones de estatus son lo bastante relevantes para el
 * SOLICITANTE como para generar una notificación. Curado a mano (no en BD):
 * varios estatus son trámite interno (colas, validaciones) sin acción ni
 * información nueva para el cliente, o ya están cubiertos por
 * `RESPONSABLE_ASIGNADO`.
 */
export const NOTIFICA_CAMBIO_ESTATUS_CLIENTE: Record<EstatusSolicitud, boolean> = {
  BORRADOR: false,
  PENDIENTE: false,
  EN_REVISION: false, // incluye el regreso desde EN_APROBACION (regresarAlPromotor): bounce interno
  EN_CORRECCION: true,
  EN_FINANCIAMIENTO: true,
  EN_APROBACION: true,
  EN_ASIGNACION: false,
  EN_ANALISIS: false, // cubierto por RESPONSABLE_ASIGNADO al asignar analista
  EN_VALIDACION: false,
  EN_COMITE: true,
  APROBADO: true,
  RECHAZADO: true,
  CANCELADO: true,
};
