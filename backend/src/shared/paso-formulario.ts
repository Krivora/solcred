/**
 * Orden canónico y etiquetas de los pasos del formulario multipaso del
 * cliente. Fuente única compartida por:
 *  - `clientes/solicitudes.service.ts` (guard de "solo avanza" al registrar
 *    el paso visto)
 *  - `admin/dashboard.service.ts` (embudo de conversión del formulario)
 *
 * El orden es un superconjunto fijo: un programa puede no requerir alguno de
 * estos pasos (son dinámicos según `ProgramaSeccion`), pero eso no afecta el
 * cálculo — el índice solo se usa para saber "qué tan lejos" llegó el cliente.
 */
import { PasoFormulario } from "../../generated/prisma/client";

export const ORDEN_PASOS_FORMULARIO: PasoFormulario[] = [
  "PROGRAMA",
  "GENERAL",
  "SOLICITANTE",
  "AVAL",
  "CREDITO",
  "GARANTIA",
  "NEGOCIO",
  "MERCADO",
  "BANCARIOS",
  "RESUMEN",
];

export const LABEL_PASO_FORMULARIO: Record<PasoFormulario, string> = {
  PROGRAMA: "Programa",
  GENERAL: "Datos generales",
  SOLICITANTE: "Solicitante",
  AVAL: "Aval",
  CREDITO: "Crédito",
  GARANTIA: "Garantía",
  NEGOCIO: "Negocio",
  MERCADO: "Mercado",
  BANCARIOS: "Bancarios",
  RESUMEN: "Resumen",
};
