import { describe, it, expect } from 'vitest'
import { calcularAjustes, seedAjustes, normalizarAjustes, garantiaVacia } from './ajustes-credito'
import type {
  AjustesCreditoData,
  AjustesCreditoOrigen,
} from '@/features/analisis/types/analisis.types'

const origen: AjustesCreditoOrigen = {
  condiciones: { plazoMeses: 24, mesesGracia: 3, tasaAnual: 18 },
  programa: {
    montoMinimo: 100_000,
    montoMaximo: 1_000_000,
    plazoMinimoMeses: 6,
    plazoMaximoMeses: 36,
    tasaOrdinaria: 18,
    tasaMoratoria: 36,
    tasaAnual: 18,
  },
  conceptos: [{ categoria: 'CAPITAL', concepto: 'Insumos', monto: 300_000 }],
  garantias: [],
}

const data = (over: Partial<AjustesCreditoData> = {}): AjustesCreditoData => ({
  ...seedAjustes(origen),
  ...over,
})

describe('calcularAjustes — totales y cobertura', () => {
  it('suma conceptos y calcula el delta contra lo solicitado', () => {
    const r = calcularAjustes(
      data({ conceptos: [{ categoria: 'CAPITAL', concepto: 'x', monto: 250_000 }] }),
      origen,
    )
    expect(r.montoSolicitado).toBe(300_000)
    expect(r.montoAjustado).toBe(250_000)
    expect(r.deltaMonto).toBe(-50_000)
  })

  it('subtotal por categoría', () => {
    const r = calcularAjustes(
      data({
        conceptos: [
          { categoria: 'CAPITAL', concepto: 'a', monto: 100_000 },
          { categoria: 'CAPITAL', concepto: 'b', monto: 50_000 },
          { categoria: 'MAQUINARIA_EQUIPO', concepto: 'c', monto: 200_000 },
        ],
      }),
      origen,
    )
    expect(r.subtotalPorCategoria.CAPITAL).toBe(150_000)
    expect(r.subtotalPorCategoria.MAQUINARIA_EQUIPO).toBe(200_000)
    expect(r.subtotalPorCategoria.REMODELACION).toBe(0)
  })

  it('cobertura = valor garantías / monto ajustado; null si monto 0', () => {
    const r = calcularAjustes(
      data({
        conceptos: [{ categoria: 'CAPITAL', concepto: 'x', monto: 200_000 }],
        garantias: [{ ...garantiaVacia('PRENDARIA'), nombrePropietario: 'Juan', valor: 300_000 }],
      }),
      origen,
    )
    expect(r.valorGarantias).toBe(300_000)
    expect(r.cobertura).toBeCloseTo(1.5)

    const sinMonto = calcularAjustes(data({ conceptos: [] }), origen)
    expect(sinMonto.cobertura).toBeNull()
  })
})

describe('calcularAjustes — validación de rango del programa', () => {
  it('sin errores dentro de rango', () => {
    const r = calcularAjustes(data(), origen)
    expect(r.errores).toEqual([])
    expect(r.bloqueado).toBe(false)
  })

  it('bloquea si el monto ajustado sale del rango', () => {
    const r = calcularAjustes(
      data({ conceptos: [{ categoria: 'CAPITAL', concepto: 'x', monto: 50_000 }] }),
      origen,
    )
    expect(r.bloqueado).toBe(true)
    expect(r.errores.join(' ')).toMatch(/monto ajustado/i)
  })

  it('bloquea si el plazo sale del rango o la gracia supera el plazo', () => {
    expect(calcularAjustes(data({ condiciones: { plazoMeses: 48, mesesGracia: 3, tasaAnual: 18 } }), origen).bloqueado).toBe(true)
    expect(calcularAjustes(data({ condiciones: { plazoMeses: 12, mesesGracia: 18, tasaAnual: 18 } }), origen).errores.join(' ')).toMatch(/gracia/i)
  })

  it('avisa (sin bloquear) por conceptos incompletos', () => {
    const r = calcularAjustes(
      data({ conceptos: [{ categoria: 'CAPITAL', concepto: '  ', monto: 300_000 }] }),
      origen,
    )
    expect(r.bloqueado).toBe(false)
    expect(r.avisos.join(' ')).toMatch(/sin descripción|monto en cero/i)
  })
})

describe('normalizarAjustes', () => {
  it('sin nada guardado devuelve la semilla del origen', () => {
    expect(normalizarAjustes(null, origen)).toEqual(seedAjustes(origen))
  })
  it('fusiona condiciones guardadas sobre la semilla', () => {
    const merged = normalizarAjustes(
      { condiciones: { plazoMeses: 12 } as never, conceptos: [], garantias: [], observaciones: 'nota' },
      origen,
    )
    expect(merged.condiciones.plazoMeses).toBe(12)
    expect(merged.condiciones.tasaAnual).toBe(18) // viene de la semilla
    expect(merged.observaciones).toBe('nota')
  })
})
