import { TicketEstatus } from "../../../generated/prisma/client";

/**
 * Máquina de estados del ticket. Un solo lugar de verdad — el controller nunca
 * cambia `estatus` a mano. La Fase 1 solo cablea las transiciones del
 * solicitante y del sistema; las de staff (asignar, empezar, resolver…) se
 * añaden en la Fase 2 pero el mapa ya las contempla.
 */

export const ESTATUS_ABIERTOS: TicketEstatus[] = [
  "NUEVO",
  "ASIGNADO",
  "EN_PROGRESO",
  "ESPERANDO_CLIENTE",
  "RESUELTO",
];

export const ESTATUS_FINALES: TicketEstatus[] = ["CERRADO", "CANCELADO"];

/** Días tras `resueltoEn` en los que el solicitante aún puede reabrir. */
export const DIAS_REAPERTURA = 7;

/** Días en ESPERANDO_CLIENTE sin respuesta tras los que el sistema auto-resuelve. */
export const DIAS_AUTOCIERRE = 5;

export const esFinal = (e: TicketEstatus): boolean => ESTATUS_FINALES.includes(e);
export const esAbierto = (e: TicketEstatus): boolean => ESTATUS_ABIERTOS.includes(e);

/**
 * Transiciones que puede disparar un agente (ADMIN) vía `PATCH /:id/estatus`.
 * Asignar (NUEVO→ASIGNADO), cerrar y reabrir tienen su propia ruta y no pasan
 * por aquí.
 */
export const TRANSICIONES_AGENTE: Record<TicketEstatus, TicketEstatus[]> = {
  NUEVO: [],
  ASIGNADO: ["EN_PROGRESO"],
  EN_PROGRESO: ["ESPERANDO_CLIENTE", "RESUELTO"],
  ESPERANDO_CLIENTE: ["EN_PROGRESO", "RESUELTO"],
  RESUELTO: [],
  CERRADO: [],
  CANCELADO: [],
};

/** ¿El solicitante puede reabrir un ticket resuelto ahora mismo? */
export const dentroVentanaReapertura = (resueltoEn: Date | null): boolean => {
  if (!resueltoEn) return false;
  const limite = resueltoEn.getTime() + DIAS_REAPERTURA * 24 * 60 * 60 * 1000;
  return Date.now() <= limite;
};
