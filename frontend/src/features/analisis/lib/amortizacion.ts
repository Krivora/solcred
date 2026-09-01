/**
 * Tabla de amortización (sistema francés: pago fijo, saldos insolutos) sobre
 * los Ajustes del Crédito — no vuelve a pedir ningún dato, solo proyecta lo que
 * ya se capturó ahí: monto (suma de conceptos), plazo, meses de gracia y tasa
 * anual. Durante la gracia solo se cobra interés; el capital se reparte en los
 * meses restantes. El último pago siempre liquida el saldo exacto (evita
 * arrastre de centavos por redondeo).
 */
import type { AjustesCreditoData } from '@/features/analisis/types/analisis.types'

function redondear(v: number): number {
  return Math.round(v * 100) / 100
}

export interface FilaAmortizacion {
  numero: number
  enGracia: boolean
  saldoInicial: number
  interes: number
  capital: number
  pago: number
  saldoFinal: number
}

export interface ResumenAmortizacion {
  montoFinanciado: number
  plazoMeses: number
  mesesGracia: number
  tasaAnual: number
  /** Pago fijo de los meses fuera de gracia (sistema francés). */
  pagoOrdinario: number
  totalIntereses: number
  totalPagado: number
}

export interface TablaAmortizacion {
  resumen: ResumenAmortizacion
  filas: FilaAmortizacion[]
}

/** null si no hay monto o plazo con los que armar una tabla. */
export function calcularAmortizacion(ajustes: AjustesCreditoData): TablaAmortizacion | null {
  const monto = ajustes.conceptos.reduce((acc, c) => acc + (c.monto || 0), 0)
  const { plazoMeses, mesesGracia, tasaAnual } = ajustes.condiciones

  if (monto <= 0 || plazoMeses <= 0) return null

  const tasaMensual = tasaAnual / 100 / 12
  const plazoAmortizable = Math.max(plazoMeses - mesesGracia, 1)

  const pagoOrdinario = redondear(
    tasaMensual > 0
      ? (monto * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -plazoAmortizable))
      : monto / plazoAmortizable,
  )

  const filas: FilaAmortizacion[] = []
  let saldo = monto
  let totalIntereses = 0
  let totalPagado = 0

  for (let numero = 1; numero <= plazoMeses; numero++) {
    const esUltimo = numero === plazoMeses
    const enGracia = numero <= mesesGracia && !esUltimo
    const interes = redondear(saldo * tasaMensual)

    const capital = esUltimo
      ? saldo
      : enGracia
        ? 0
        : Math.min(redondear(pagoOrdinario - interes), saldo)

    const pago = redondear(capital + interes)
    const saldoFinal = redondear(Math.max(saldo - capital, 0))

    filas.push({ numero, enGracia, saldoInicial: saldo, interes, capital, pago, saldoFinal })
    totalIntereses += interes
    totalPagado += pago
    saldo = saldoFinal
  }

  return {
    resumen: {
      montoFinanciado: monto,
      plazoMeses,
      mesesGracia,
      tasaAnual,
      pagoOrdinario,
      totalIntereses: redondear(totalIntereses),
      totalPagado: redondear(totalPagado),
    },
    filas,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Calendario de pagos (opcional: solo si hay fecha de dispersión)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fecha del pago `numeroMes` (1 = el primero, un mes después de la dispersión).
 * Conserva el día del mes; si el mes destino no lo tiene (ej. 31 en febrero),
 * usa su último día. Todo en UTC para no arrastrar corrimientos de huso horario.
 */
export function fechaPago(fechaDispersion: string, numeroMes: number): string {
  const [anio, mes, dia] = fechaDispersion.split('-').map(Number)
  const objetivo = new Date(Date.UTC(anio, mes - 1 + numeroMes, 1))
  const ultimoDiaMes = new Date(Date.UTC(objetivo.getUTCFullYear(), objetivo.getUTCMonth() + 1, 0)).getUTCDate()
  objetivo.setUTCDate(Math.min(dia, ultimoDiaMes))
  return objetivo.toISOString().slice(0, 10)
}

export function formatFechaPago(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
