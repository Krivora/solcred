import { z } from "zod";

export const ANALISIS_TABS = [
  "situacionFinanciera",
  "ajustesCredito",
  "criteriosEvaluacion",
  "amortizacion",
  "comentario",
] as const;

export type AnalisisTab = (typeof ANALISIS_TABS)[number];

/**
 * Guardado de una pestaña. `data` es un objeto para las pestañas de grid y un
 * string para `comentario`. No se valida la forma interna del JSON — el
 * frontend es la fuente de verdad del esquema financiero.
 */
export const guardarTabSchema = z
  .object({
    tab: z.enum(ANALISIS_TABS),
    data: z.union([z.record(z.string(), z.unknown()), z.string()]),
  })
  .refine((v) => (v.tab === "comentario" ? typeof v.data === "string" : typeof v.data === "object"), {
    message: "`data` debe ser string para 'comentario' y objeto para el resto",
    path: ["data"],
  });

export type GuardarTabDto = z.infer<typeof guardarTabSchema>;
