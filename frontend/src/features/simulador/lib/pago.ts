/**
 * Estimación de pago mensual (sistema francés: pago fijo) para el simulador
 * público. Sin meses de gracia — es una estimación de marketing, no la
 * herramienta de análisis interna (ver `features/analisis/lib/amortizacion.ts`,
 * que sí modela gracia/conceptos/ajustes y está atada a ese dominio).
 */
export interface PagoEstimado {
  pagoMensual: number
  totalPagar: number
  totalIntereses: number
}

function redondear(v: number): number {
  return Math.round(v * 100) / 100
}

/** null si los datos no alcanzan para estimar (monto/plazo <= 0). */
export function calcularPagoEstimado(
  monto: number,
  plazoMeses: number,
  tasaAnual: number,
): PagoEstimado | null {
  if (!monto || monto <= 0 || !plazoMeses || plazoMeses <= 0) return null

  const tasaMensual = tasaAnual / 100 / 12
  const pagoMensual = redondear(
    tasaMensual > 0
      ? (monto * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -plazoMeses))
      : monto / plazoMeses,
  )
  const totalPagar = redondear(pagoMensual * plazoMeses)
  const totalIntereses = redondear(totalPagar - monto)

  return { pagoMensual, totalPagar, totalIntereses }
}
