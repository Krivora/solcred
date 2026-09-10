/**
 * Constantes del módulo CRM (comunicaciones con el cliente).
 */

/** Una solicitud se considera "con seguimiento reciente" si su última
 *  comunicación ocurrió dentro de esta ventana. Editable a futuro. */
export const SEGUIMIENTO_RECIENTE_DIAS = 7;

export const SEGUIMIENTO_RECIENTE_MS =
  SEGUIMIENTO_RECIENTE_DIAS * 24 * 60 * 60 * 1000;
