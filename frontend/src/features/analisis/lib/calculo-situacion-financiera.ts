/**
 * Cálculo puro (sin React) de todos los totales del Balance General y el
 * Estado de Resultados, por periodo. Espejo de `calc()` de la herramienta de
 * referencia. Las deducciones ("(-)") se restan; el resto se suma.
 */
import { PERIODOS, type PeriodoKey, type SituacionFinancieraData } from '@/features/analisis/types/analisis.types'
import type { TotalBalanceKey, TotalResultadosKey } from '@/features/analisis/lib/cuentas'

export interface CalculoPeriodo {
  balance: Record<TotalBalanceKey, number>
  resultados: Record<TotalResultadosKey, number>
  utilEjercicio: number
  /** Suma del Activo − Suma Pasivo+Capital. 0 = balance cuadrado. */
  cuadre: number
  /** Divisor para las columnas de promedio mensual del Estado de Resultados. */
  divisor: number
}

export type CalculoSituacion = Record<PeriodoKey, CalculoPeriodo>

export function calcularSituacion(data: SituacionFinancieraData): CalculoSituacion {
  const out = {} as CalculoSituacion

  for (const c of PERIODOS) {
    const b = (k: string) => data.balance?.[k]?.[c] ?? 0
    const r = (k: string) => data.resultados?.[k]?.[c] ?? 0

    // ── Estado de Resultados ──────────────────────────────────────────────
    const totIngresos = r('ventas') - r('descDevoluciones') + r('otrosIngOper')
    const totCostos =
      r('costoVentas') + r('compras') + r('fletesCompras') + r('manoObra') + r('otrosCostos')
    const utilBruta = totIngresos - totCostos

    const totGastosAdm =
      r('sueldosAdm') + r('rentaOficina') + r('servPublicos') + r('mantenimiento') +
      r('depreciaciones') + r('honorarios') + r('segurosLic') + r('papeleria') + r('otrosAdm')
    const totGastosVta =
      r('comisiones') + r('publicidad') + r('fletesEnvios') + r('sueldosVta') +
      r('empaques') + r('viaticos') + r('otrosVta')
    const ebit = utilBruta - totGastosAdm - totGastosVta

    const totRif =
      r('interesesGanados') - r('interesesPagados') - r('comisionesBanc') +
      r('utilCambiaria') - r('perdCambiaria') + r('prodFinancieros') - r('gastosFinancieros')

    const utilAntesImp =
      ebit + totRif +
      r('utilVentaActivos') - r('perdVentaActivos') +
      r('subsidios') + r('otrosIngNoOper') - r('otrosGastosNoOper')

    const totImpuestos = r('isrCorriente') + r('isrDiferido') + r('otrosImpuestos')
    const utilNeta = utilAntesImp - totImpuestos

    // ── Balance General ──────────────────────────────────────────────────
    const totActCirc =
      b('caja') + b('bancos') + b('invTemp') + b('clientes') - b('estIncobrables') +
      b('docCobrar') + b('deudores') + b('ivaAcred') + b('impFavor') + b('inventarios') +
      b('antProv') + b('pagAnt') + b('otrosActCirc')

    const totActNoCirc =
      b('terrenos') + b('edificios') - b('depEdificios') +
      b('maquinaria') - b('depMaquinaria') +
      b('transporte') - b('depTransporte') +
      b('mobiliario') - b('depMobiliario') +
      b('computo') - b('depComputo') +
      b('intangibles') - b('amortIntangibles') +
      b('depGarantia') + b('otrosActNoCirc')

    const sumaActivo = totActCirc + totActNoCirc

    const totPasCirc =
      b('proveedores') + b('docPagar') + b('acreedores') + b('prestBancarios') +
      b('antClientes') + b('impPagar') + b('nominaPagar') + b('divPagar') + b('otrosPasCirc')
    const totPasNoCirc =
      b('prestLP') + b('hipotecas') + b('arrendamientos') + b('impDiferidos') + b('otrosPasNoCirc')
    const sumaPasivo = totPasCirc + totPasNoCirc

    const capContrib = b('capSocial') + b('primaVenta') + b('aportacionesFut') + b('otrosContrib')
    const capGanado =
      b('utilRetenidas') - b('perdAcumuladas') + utilNeta + b('reservaLegal') + b('otrosGanado')
    const totCapital = capContrib + capGanado
    const sumaPasivoCapital = sumaPasivo + totCapital

    const meses = data.periodos?.c3?.meses ?? 1
    const divisor = c === 'c3' ? Math.max(1, meses) : 12

    out[c] = {
      resultados: {
        totIngresos, totCostos, utilBruta,
        totGastosAdm, totGastosVta, ebit,
        totRif, utilAntesImp, totImpuestos, utilNeta,
      },
      balance: {
        totActCirc, totActNoCirc, sumaActivo,
        totPasCirc, totPasNoCirc, sumaPasivo,
        totCapital, sumaPasivoCapital,
      },
      utilEjercicio: utilNeta,
      cuadre: sumaActivo - sumaPasivoCapital,
      divisor,
    }
  }

  return out
}
