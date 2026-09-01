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

// ─────────────────────────────────────────────────────────────────────────────
// Informe Ejecutivo
//
// El frontend calcula los números que hoy solo viven en sus `lib/` (amortización
// y situación financiera mensualizada) y los manda ya resueltos. El backend arma
// el resto del informe con la solicitud + el análisis persistido.
// ─────────────────────────────────────────────────────────────────────────────

const periodoResumenSchema = z.object({
  etiqueta: z.string(),
  ventas: z.number(),
  costos: z.number(),
  utilBruta: z.number(),
  gastosOperativos: z.number(),
  ebit: z.number(),
  utilNeta: z.number(),
  /** EBIT mensual ÷ pago mensual de la amortización. */
  capacidadPago: z.number().nullable(),
});

export const informeEjecutivoSchema = z.object({
  amortizacion: z
    .object({
      montoFinanciado: z.number(),
      plazoMeses: z.number(),
      mesesGracia: z.number(),
      tasaAnual: z.number(),
      pagoOrdinario: z.number(),
      totalIntereses: z.number(),
      totalPagado: z.number(),
    })
    .nullable(),
  situacion: z.object({
    ejecutivo: periodoResumenSchema.nullable(),
    proyectado: periodoResumenSchema.nullable(),
  }),
});

export type InformeEjecutivoInput = z.infer<typeof informeEjecutivoSchema>;
export type PeriodoResumenInput = z.infer<typeof periodoResumenSchema>;
