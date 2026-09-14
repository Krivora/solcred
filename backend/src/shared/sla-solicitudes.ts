/**
 * Umbrales de estancamiento de una Solicitud (fuente única). Antes vivían
 * solo dentro de `admin/dashboard/dashboard.service.ts` (alertas agregadas del
 * panorama ejecutivo); se extraen aquí para que el mismo criterio alimente
 * también el indicador por-fila en "Mis Casos"/Asignación y las notificaciones
 * al gestor/analista responsable — una sola definición de "estancada".
 *
 * Detección perezosa (mismo criterio que `soporte.sla.ts`): no hay un job en
 * segundo plano, el estado se calcula al leer, con `actualizadoEn` como reloj
 * (se mueve solo cuando cambia el estatus).
 */
import { EstatusSolicitud } from "../../generated/prisma/client";

export const MS_DIA = 86_400_000;

export const SLA_RESOLUCION_DIAS = 25;
export const DIAS_ESTANCADA = 7;
export const DIAS_ANALISIS_LARGO = 10;
export const DIAS_DOC_PENDIENTE = 5;

/** "En riesgo" = queda menos del 25% del tiempo objetivo. Igual criterio que `soporte.sla.ts`. */
const FRACCION_RIESGO = 0.25;

export type EstadoEstancamiento = "en_curso" | "en_riesgo" | "vencido";

/** Umbral de días aplicable según el estatus actual (EN_ANALISIS tiene uno propio, más laxo). */
export const diasUmbral = (estatus: EstatusSolicitud): number =>
  estatus === "EN_ANALISIS" ? DIAS_ANALISIS_LARGO : DIAS_ESTANCADA;

export const diasSinAvance = (actualizadoEn: Date, ahora: Date = new Date()): number =>
  Math.floor((ahora.getTime() - actualizadoEn.getTime()) / MS_DIA);

/**
 * Estado de estancamiento de una solicitud dada su fecha de último cambio de
 * estatus. No distingue si el estatus es "activo" o final — quien llama debe
 * filtrar a solicitudes activas antes (ej. `ACTIVOS` en `dashboard.service.ts`).
 */
export function estadoEstancamiento(
  estatus: EstatusSolicitud,
  actualizadoEn: Date,
  ahora: Date = new Date()
): EstadoEstancamiento {
  const umbralMs = diasUmbral(estatus) * MS_DIA;
  const transcurridoMs = ahora.getTime() - actualizadoEn.getTime();
  if (transcurridoMs >= umbralMs) return "vencido";
  if (transcurridoMs >= umbralMs * (1 - FRACCION_RIESGO)) return "en_riesgo";
  return "en_curso";
}
