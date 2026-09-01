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
 * Guardado de una pestaña. `data` siempre es un objeto — no se valida su forma
 * interna, el frontend es la fuente de verdad del esquema de cada pestaña
 * (grids financieros, o las secciones de texto de `comentario`).
 */
export const guardarTabSchema = z.object({
  tab: z.enum(ANALISIS_TABS),
  data: z.record(z.string(), z.unknown()),
});

export type GuardarTabDto = z.infer<typeof guardarTabSchema>;
