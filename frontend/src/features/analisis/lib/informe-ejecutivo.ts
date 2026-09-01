/**
 * Arma el payload del Informe Ejecutivo con los mismos cálculos que alimentan
 * las pestañas del análisis (amortización y situación financiera mensualizada).
 * El backend recibe estos números ya resueltos y solo los maqueta; así no se
 * duplica ninguna fórmula financiera.
 */
import type {
  AjustesCreditoData,
  AjustesCreditoOrigen,
  Analisis,
  PeriodoKey,
  SituacionFinancieraData,
} from '@/features/analisis/types/analisis.types'
import { normalizarAjustes } from '@/features/analisis/lib/ajustes-credito'
import { calcularAmortizacion } from '@/features/analisis/lib/amortizacion'
import { calcularSituacion, type CalculoSituacion } from '@/features/analisis/lib/calculo-situacion-financiera'
import { tieneSituacionFinanciera } from '@/features/analisis/lib/criterios-evaluacion'

export interface PeriodoResumenInforme {
  etiqueta: string
  ventas: number
  costos: number
  utilBruta: number
  gastosOperativos: number
  ebit: number
  utilNeta: number
  /** EBIT mensual ÷ pago mensual de la amortización. */
  capacidadPago: number | null
}

export interface InformeEjecutivoPayload {
  amortizacion: {
    montoFinanciado: number
    plazoMeses: number
    mesesGracia: number
    tasaAnual: number
    pagoOrdinario: number
    totalIntereses: number
    totalPagado: number
  } | null
  situacion: {
    ejecutivo: PeriodoResumenInforme | null
    proyectado: PeriodoResumenInforme | null
  }
}

function periodoTieneData(data: SituacionFinancieraData, c: PeriodoKey): boolean {
  const enGrupo = (g: Record<string, Partial<Record<PeriodoKey, number>>> | undefined) =>
    Object.values(g ?? {}).some((v) => v?.[c] !== undefined && v[c] !== 0)
  return enGrupo(data.balance) || enGrupo(data.resultados)
}

function resumenPeriodo(
  data: SituacionFinancieraData,
  c: PeriodoKey,
  calc: CalculoSituacion,
  pagoMensual: number | null,
): PeriodoResumenInforme {
  const p = calc[c]
  const div = p.divisor || 1
  const m = (n: number) => n / div
  const ebitMensual = m(p.resultados.ebit)
  return {
    etiqueta: data.periodos[c]?.etiqueta ?? c,
    ventas: m(p.resultados.totIngresos),
    costos: m(p.resultados.totCostos),
    utilBruta: m(p.resultados.utilBruta),
    gastosOperativos: m(p.resultados.totGastosAdm + p.resultados.totGastosVta),
    ebit: ebitMensual,
    utilNeta: m(p.resultados.utilNeta),
    capacidadPago: pagoMensual && pagoMensual > 0 ? ebitMensual / pagoMensual : null,
  }
}

export function construirPayloadInforme(
  analisis: Analisis,
  origen: AjustesCreditoOrigen,
): InformeEjecutivoPayload {
  const ajustes: AjustesCreditoData = normalizarAjustes(analisis.ajustesCredito, origen)
  const amort = calcularAmortizacion(ajustes)

  const amortizacion = amort
    ? {
        montoFinanciado: amort.resumen.montoFinanciado,
        plazoMeses: amort.resumen.plazoMeses,
        mesesGracia: amort.resumen.mesesGracia,
        tasaAnual: amort.resumen.tasaAnual,
        pagoOrdinario: amort.resumen.pagoOrdinario,
        totalIntereses: amort.resumen.totalIntereses,
        totalPagado: amort.resumen.totalPagado,
      }
    : null

  const pagoMensual = amort?.resumen.pagoOrdinario ?? null

  let situacion: InformeEjecutivoPayload['situacion'] = { ejecutivo: null, proyectado: null }

  const sf = analisis.situacionFinanciera
  if (sf && tieneSituacionFinanciera(sf)) {
    const calc = calcularSituacion(sf)
    // "Ejecutivo" = el periodo real más reciente con datos; "Proyectado" = c4.
    const ejecutivoKey = (['c3', 'c2', 'c1'] as PeriodoKey[]).find((c) => periodoTieneData(sf, c)) ?? null
    const proyectadoKey = periodoTieneData(sf, 'c4') ? ('c4' as PeriodoKey) : null

    situacion = {
      ejecutivo: ejecutivoKey ? resumenPeriodo(sf, ejecutivoKey, calc, pagoMensual) : null,
      proyectado: proyectadoKey ? resumenPeriodo(sf, proyectadoKey, calc, pagoMensual) : null,
    }
  }

  return { amortizacion, situacion }
}
