import { describe, it, expect } from 'vitest'
import { calcularAmortizacion, fechaPago } from './amortizacion'
import type { AjustesCreditoData } from '@/features/analisis/types/analisis.types'

const ajustes = (over: Partial<AjustesCreditoData['condiciones']>, monto = 120_000): AjustesCreditoData => ({
  condiciones: { plazoMeses: 12, mesesGracia: 0, tasaAnual: 0, ...over },
  conceptos: [{ categoria: 'CAPITAL', concepto: 'x', monto }],
  garantias: [],
})

const sum = (ns: number[]) => Math.round(ns.reduce((a, b) => a + b, 0) * 100) / 100

describe('calcularAmortizacion', () => {
  it('null si no hay monto o no hay plazo', () => {
    expect(calcularAmortizacion(ajustes({}, 0))).toBeNull()
    expect(calcularAmortizacion(ajustes({ plazoMeses: 0 }))).toBeNull()
  })

  it('sin interés: capital repartido parejo y salda exacto', () => {
    const t = calcularAmortizacion(ajustes({ plazoMeses: 12, tasaAnual: 0 }))!
    expect(t.filas).toHaveLength(12)
    expect(t.resumen.totalIntereses).toBe(0)
    expect(t.resumen.pagoOrdinario).toBe(10_000)
    expect(t.filas.at(-1)!.saldoFinal).toBe(0)
    expect(sum(t.filas.map((f) => f.capital))).toBe(120_000)
    expect(t.resumen.totalPagado).toBe(120_000)
  })

  it('con interés (sistema francés): pago fijo salvo el último, salda en 0', () => {
    const t = calcularAmortizacion(ajustes({ plazoMeses: 12, tasaAnual: 24 }))!
    const ordinarios = t.filas.slice(0, -1).map((f) => f.pago)
    // todos los pagos no-finales iguales al pago ordinario (± centavo por redondeo)
    for (const p of ordinarios) expect(Math.abs(p - t.resumen.pagoOrdinario)).toBeLessThanOrEqual(0.02)
    expect(t.filas.at(-1)!.saldoFinal).toBe(0)
    expect(t.resumen.totalIntereses).toBeGreaterThan(0)
    // total pagado = capital (monto) + intereses
    expect(t.resumen.totalPagado).toBeCloseTo(120_000 + t.resumen.totalIntereses, 1)
  })

  it('con periodo de gracia: en gracia solo interés, capital 0', () => {
    const t = calcularAmortizacion(ajustes({ plazoMeses: 12, mesesGracia: 3, tasaAnual: 12 }))!
    const enGracia = t.filas.filter((f) => f.enGracia)
    expect(enGracia).toHaveLength(3)
    for (const f of enGracia) {
      expect(f.capital).toBe(0)
      expect(f.interes).toBeGreaterThan(0)
      expect(f.saldoFinal).toBe(f.saldoInicial)
    }
    // el capital se amortiza en los 9 meses restantes
    expect(sum(t.filas.map((f) => f.capital))).toBe(120_000)
    expect(t.filas.at(-1)!.saldoFinal).toBe(0)
  })

  it('totales del resumen concuerdan con la suma de las filas', () => {
    const t = calcularAmortizacion(ajustes({ plazoMeses: 18, mesesGracia: 2, tasaAnual: 18 }))!
    expect(t.resumen.totalIntereses).toBeCloseTo(sum(t.filas.map((f) => f.interes)), 1)
    expect(t.resumen.totalPagado).toBeCloseTo(sum(t.filas.map((f) => f.pago)), 1)
    expect(t.resumen.montoFinanciado).toBe(120_000)
  })
})

describe('fechaPago', () => {
  it('suma meses conservando el día', () => {
    expect(fechaPago('2026-01-15', 1)).toBe('2026-02-15')
    expect(fechaPago('2026-01-15', 12)).toBe('2027-01-15')
  })

  it('si el mes destino no tiene ese día, usa el último', () => {
    expect(fechaPago('2026-01-31', 1)).toBe('2026-02-28') // 2026 no bisiesto
    expect(fechaPago('2024-01-31', 1)).toBe('2024-02-29') // 2024 bisiesto
  })
})
