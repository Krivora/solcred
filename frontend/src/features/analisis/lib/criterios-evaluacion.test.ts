import { describe, it, expect } from 'vitest'
import {
  calcularCriterios,
  tieneSituacionFinanciera,
  formatValorCriterio,
} from './criterios-evaluacion'
import type { SituacionFinancieraData, PeriodoKey } from '@/features/analisis/types/analisis.types'

const periodos = Object.fromEntries(
  (['c1', 'c2', 'c3', 'c4'] as PeriodoKey[]).map((k) => [k, { etiqueta: k, corte: null }]),
) as SituacionFinancieraData['periodos']

/** Escenario base en c1: liquidez sana, poco apalancamiento, buen margen. */
const data: SituacionFinancieraData = {
  periodos,
  balance: {
    caja: { c1: 200 },
    inventarios: { c1: 300 },
    terrenos: { c1: 500 },
    proveedores: { c1: 250 },
  },
  resultados: {
    ventas: { c1: 1000 },
    costoVentas: { c1: 600 },
    interesesPagados: { c1: 100 },
  },
}

describe('calcularCriterios', () => {
  const c1 = calcularCriterios(data).c1

  it('razón circulante = AC / PC', () => {
    expect(c1.razonCirculante.valor).toBeCloseTo(2.0)
    expect(c1.razonCirculante.nivel).toBe('bien')
  })

  it('prueba del ácido descuenta inventarios', () => {
    expect(c1.pruebaAcido.valor).toBeCloseTo(0.8) // (500 - 300) / 250
    expect(c1.pruebaAcido.nivel).toBe('atencion')
  })

  it('endeudamiento en % = Pasivo / Activo', () => {
    expect(c1.endeudamiento.valor).toBeCloseTo(25) // 250 / 1000
    expect(c1.endeudamiento.nivel).toBe('bien')
  })

  it('margen bruto en % = utilidad bruta / ventas', () => {
    expect(c1.margenBruto.valor).toBeCloseTo(40) // (1000 - 600) / 1000
    expect(c1.margenBruto.nivel).toBe('bien')
  })

  it('cobertura de intereses = EBIT / intereses pagados', () => {
    expect(c1.coberturaIntereses.valor).toBeCloseTo(4) // 400 / 100
    expect(c1.coberturaIntereses.nivel).toBe('bien')
  })

  it('divisor cero => valor null y nivel N/D', () => {
    const vacio = calcularCriterios({ periodos, balance: {}, resultados: {} }).c1
    expect(vacio.razonCirculante.valor).toBeNull()
    expect(vacio.razonCirculante.nivel).toBe('na')
    expect(vacio.coberturaIntereses.valor).toBeNull()
  })
})

describe('tieneSituacionFinanciera', () => {
  it('false para null o data sin cifras', () => {
    expect(tieneSituacionFinanciera(null)).toBe(false)
    expect(tieneSituacionFinanciera({ periodos, balance: {}, resultados: {} })).toBe(false)
  })
  it('true en cuanto hay una cifra', () => {
    expect(tieneSituacionFinanciera(data)).toBe(true)
  })
})

describe('formatValorCriterio', () => {
  it('formatea veces y porcentaje, y — para null', () => {
    expect(formatValorCriterio(null, 'veces')).toBe('—')
    expect(formatValorCriterio(2.345, 'veces')).toBe('2.35×')
    expect(formatValorCriterio(41.27, '%')).toBe('41.3%')
  })
})
