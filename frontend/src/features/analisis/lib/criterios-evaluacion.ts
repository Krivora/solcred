/**
 * Criterios de evaluación (liquidez, endeudamiento, rentabilidad, cobertura):
 * cálculo puro sobre lo ya capturado en Situación Financiera. No se vuelve a
 * pedir ningún monto — todo sale de `calcularSituacion()` + un par de cuentas
 * crudas (inventarios, intereses pagados) que no forman parte de sus totales.
 *
 * Los umbrales de semáforo son de referencia general para PyME en México —
 * ayudan a leer el número, no sustituyen el criterio del analista.
 */
import { PERIODOS, type PeriodoKey, type SituacionFinancieraData } from '@/features/analisis/types/analisis.types'
import { calcularSituacion, type CalculoPeriodo } from '@/features/analisis/lib/calculo-situacion-financiera'

export type NivelCriterio = 'bien' | 'atencion' | 'riesgo' | 'na'
export type UnidadCriterio = 'veces' | '%'

export const NIVEL_LABEL: Record<NivelCriterio, string> = {
  bien: 'Bien',
  atencion: 'Atención',
  riesgo: 'Riesgo',
  na: 'N/D',
}

export const NIVEL_ESTILO: Record<NivelCriterio, string> = {
  bien: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  atencion: 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  riesgo: 'border-destructive/25 bg-destructive/10 text-destructive',
  na: 'border-border/50 bg-muted/40 text-muted-foreground',
}

/** true si sube/es bueno tener un valor alto; false si baja/es bueno tenerlo bajo. */
function nivelPorUmbral(
  valor: number | null,
  bien: number,
  atencion: number,
  direccion: 'asc' | 'desc',
): NivelCriterio {
  if (valor === null || !Number.isFinite(valor)) return 'na'
  if (direccion === 'asc') {
    if (valor >= bien) return 'bien'
    if (valor >= atencion) return 'atencion'
    return 'riesgo'
  }
  if (valor <= bien) return 'bien'
  if (valor <= atencion) return 'atencion'
  return 'riesgo'
}

export type CriterioKey =
  | 'razonCirculante'
  | 'pruebaAcido'
  | 'endeudamiento'
  | 'apalancamiento'
  | 'margenBruto'
  | 'margenOperativo'
  | 'margenNeto'
  | 'roa'
  | 'roe'
  | 'coberturaIntereses'

export interface CriterioDef {
  key: CriterioKey
  label: string
  unidad: UnidadCriterio
  formula: string
  ayuda: string
}

export interface GrupoCriterios {
  titulo: string
  criterios: CriterioDef[]
}

export const GRUPOS_CRITERIOS: GrupoCriterios[] = [
  {
    titulo: 'Liquidez',
    criterios: [
      {
        key: 'razonCirculante',
        label: 'Razón circulante',
        unidad: 'veces',
        formula: 'Activo circulante / Pasivo circulante',
        ayuda: 'Cuánto activo de corto plazo hay por cada peso de deuda de corto plazo.',
      },
      {
        key: 'pruebaAcido',
        label: 'Prueba del ácido',
        unidad: 'veces',
        formula: '(Activo circulante − Inventarios) / Pasivo circulante',
        ayuda: 'Como la razón circulante, pero sin contar con vender el inventario.',
      },
    ],
  },
  {
    titulo: 'Endeudamiento',
    criterios: [
      {
        key: 'endeudamiento',
        label: 'Razón de endeudamiento',
        unidad: '%',
        formula: 'Pasivo total / Activo total',
        ayuda: 'Qué porcentaje de los activos del negocio está financiado con deuda.',
      },
      {
        key: 'apalancamiento',
        label: 'Apalancamiento',
        unidad: 'veces',
        formula: 'Pasivo total / Capital contable',
        ayuda: 'Cuánta deuda hay por cada peso de capital propio de los socios.',
      },
    ],
  },
  {
    titulo: 'Rentabilidad',
    criterios: [
      {
        key: 'margenBruto',
        label: 'Margen bruto',
        unidad: '%',
        formula: 'Utilidad bruta / Ventas',
        ayuda: 'Lo que queda de cada peso vendido tras el costo de lo vendido.',
      },
      {
        key: 'margenOperativo',
        label: 'Margen operativo (EBIT)',
        unidad: '%',
        formula: 'EBIT / Ventas',
        ayuda: 'Rentabilidad del negocio antes de intereses e impuestos.',
      },
      {
        key: 'margenNeto',
        label: 'Margen neto',
        unidad: '%',
        formula: 'Utilidad neta / Ventas',
        ayuda: 'Lo que realmente queda de cada peso vendido.',
      },
      {
        key: 'roa',
        label: 'ROA',
        unidad: '%',
        formula: 'Utilidad neta / Activo total',
        ayuda: 'Qué tan bien se usan los activos del negocio para generar utilidad.',
      },
      {
        key: 'roe',
        label: 'ROE',
        unidad: '%',
        formula: 'Utilidad neta / Capital contable',
        ayuda: 'Rendimiento que obtienen los socios sobre su capital invertido.',
      },
    ],
  },
  {
    titulo: 'Cobertura',
    criterios: [
      {
        key: 'coberturaIntereses',
        label: 'Cobertura de intereses',
        unidad: 'veces',
        formula: 'EBIT / Intereses pagados',
        ayuda: 'Cuántas veces alcanza la utilidad operativa para pagar el costo financiero actual.',
      },
    ],
  },
]

export interface ResultadoCriterio {
  valor: number | null
  nivel: NivelCriterio
}

export type CalculoCriterios = Record<PeriodoKey, Record<CriterioKey, ResultadoCriterio>>

function calcularPeriodo(calc: CalculoPeriodo, inventarios: number, interesesPagados: number) {
  const { balance: b, resultados: r } = calc
  const ventas = r.totIngresos

  const div = (num: number, den: number) => (den > 0 ? num / den : null)

  const razonCirculante = div(b.totActCirc, b.totPasCirc)
  const pruebaAcido = div(b.totActCirc - inventarios, b.totPasCirc)
  const endeudamiento = div(b.sumaPasivo, b.sumaActivo)
  const apalancamiento = div(b.sumaPasivo, b.totCapital)
  const margenBruto = div(r.utilBruta, ventas)
  const margenOperativo = div(r.ebit, ventas)
  const margenNeto = div(r.utilNeta, ventas)
  const roa = div(r.utilNeta, b.sumaActivo)
  const roe = div(r.utilNeta, b.totCapital)
  const coberturaIntereses = interesesPagados > 0 ? r.ebit / interesesPagados : null

  const pct = (v: number | null) => (v === null ? null : v * 100)

  const valores: Record<CriterioKey, number | null> = {
    razonCirculante,
    pruebaAcido,
    endeudamiento: pct(endeudamiento),
    apalancamiento,
    margenBruto: pct(margenBruto),
    margenOperativo: pct(margenOperativo),
    margenNeto: pct(margenNeto),
    roa: pct(roa),
    roe: pct(roe),
    coberturaIntereses,
  }

  const niveles: Record<CriterioKey, NivelCriterio> = {
    razonCirculante: nivelPorUmbral(valores.razonCirculante, 1.5, 1.0, 'asc'),
    pruebaAcido: nivelPorUmbral(valores.pruebaAcido, 1.0, 0.7, 'asc'),
    endeudamiento: nivelPorUmbral(valores.endeudamiento, 50, 70, 'desc'),
    apalancamiento: nivelPorUmbral(valores.apalancamiento, 1, 2, 'desc'),
    margenBruto: nivelPorUmbral(valores.margenBruto, 30, 15, 'asc'),
    margenOperativo: nivelPorUmbral(valores.margenOperativo, 15, 5, 'asc'),
    margenNeto: nivelPorUmbral(valores.margenNeto, 10, 0, 'asc'),
    roa: nivelPorUmbral(valores.roa, 8, 0, 'asc'),
    roe: nivelPorUmbral(valores.roe, 15, 0, 'asc'),
    coberturaIntereses: nivelPorUmbral(valores.coberturaIntereses, 3, 1, 'asc'),
  }

  return Object.fromEntries(
    (Object.keys(valores) as CriterioKey[]).map((k) => [k, { valor: valores[k], nivel: niveles[k] }]),
  ) as Record<CriterioKey, ResultadoCriterio>
}

export function calcularCriterios(data: SituacionFinancieraData): CalculoCriterios {
  const calc = calcularSituacion(data)
  const out = {} as CalculoCriterios
  for (const c of PERIODOS) {
    const inventarios = data.balance?.inventarios?.[c] ?? 0
    const interesesPagados = data.resultados?.interesesPagados?.[c] ?? 0
    out[c] = calcularPeriodo(calc[c], inventarios, interesesPagados)
  }
  return out
}

/** true si hay al menos una cifra capturada en Balance o Estado de Resultados. */
export function tieneSituacionFinanciera(data: SituacionFinancieraData | null | undefined): boolean {
  if (!data) return false
  return [data.balance, data.resultados].some((grupo) =>
    Object.values(grupo ?? {}).some((valores) => Object.keys(valores ?? {}).length > 0),
  )
}

export function formatValorCriterio(valor: number | null, unidad: UnidadCriterio): string {
  if (valor === null) return '—'
  return unidad === '%' ? `${valor.toFixed(1)}%` : `${valor.toFixed(2)}×`
}
