/**
 * Lógica pura (sin React) de la pestaña Ajustes del Crédito: semilla desde el
 * origen, filas vacías y el cálculo de totales / cobertura / validación de rango.
 */
import type { CategoriaCredito, TipoGarantia } from '@/shared/types/domain.enums'
import type {
  AjustesCreditoData,
  AjustesCreditoOrigen,
  ConceptoAjuste,
  GarantiaAjuste,
} from '@/features/analisis/types/analisis.types'

export const CATEGORIAS_CREDITO: { key: CategoriaCredito; label: string; descripcion: string }[] = [
  { key: 'CAPITAL', label: 'Capital de trabajo', descripcion: 'Insumos, nómina, operación' },
  { key: 'MAQUINARIA_EQUIPO', label: 'Maquinaria y equipo', descripcion: 'Activos productivos' },
  { key: 'REMODELACION', label: 'Remodelación', descripcion: 'Obra y adecuaciones' },
]

export const TIPO_GARANTIA_LABEL: Record<TipoGarantia, string> = {
  PRENDARIA: 'Prendaria (bien mueble)',
  HIPOTECARIA: 'Hipotecaria (inmueble)',
}

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })
export const fmtMoney = (n: number) => money.format(n)

/** Estado inicial cuando el analista aún no ha guardado nada: copia del origen. */
export function seedAjustes(origen: AjustesCreditoOrigen): AjustesCreditoData {
  return {
    condiciones: { ...origen.condiciones },
    conceptos: origen.conceptos.map((c) => ({ ...c })),
    garantias: origen.garantias.map((g) => ({ ...g })),
    observaciones: '',
  }
}

/** Fusiona lo guardado con la semilla (tolera JSON de una versión anterior). */
export function normalizarAjustes(
  guardado: AjustesCreditoData | null,
  origen: AjustesCreditoOrigen,
): AjustesCreditoData {
  const base = seedAjustes(origen)
  if (!guardado) return base
  return {
    condiciones: { ...base.condiciones, ...guardado.condiciones },
    conceptos: Array.isArray(guardado.conceptos) ? guardado.conceptos : base.conceptos,
    garantias: Array.isArray(guardado.garantias) ? guardado.garantias : base.garantias,
    observaciones: guardado.observaciones ?? '',
  }
}

export function conceptoVacio(categoria: CategoriaCredito): ConceptoAjuste {
  return { categoria, concepto: '', monto: 0 }
}

export function garantiaVacia(tipo: TipoGarantia): GarantiaAjuste {
  return {
    tipo,
    nombrePropietario: '',
    valor: 0,
    descripcion: null,
    marca: null,
    modelo: null,
    anio: null,
    numeroSerie: null,
    calle: null,
    numeroExterior: null,
    numeroInterior: null,
    colonia: null,
    ciudad: null,
    estado: null,
    codigoPostal: null,
    numeroEscritura: null,
    folioReal: null,
  }
}

export interface CalculoAjustes {
  montoSolicitado: number
  montoAjustado: number
  deltaMonto: number
  subtotalPorCategoria: Record<CategoriaCredito, number>
  valorGarantias: number
  /** valorGarantias / montoAjustado — null si el monto ajustado es 0. */
  cobertura: number | null
  /** Impiden guardar (fuera del rango del programa). */
  errores: string[]
  /** Se muestran pero no bloquean (datos incompletos). */
  avisos: string[]
  bloqueado: boolean
}

export function calcularAjustes(
  data: AjustesCreditoData,
  origen: AjustesCreditoOrigen,
): CalculoAjustes {
  const p = origen.programa
  const montoSolicitado = origen.conceptos.reduce((a, c) => a + c.monto, 0)
  const montoAjustado = data.conceptos.reduce((a, c) => a + (c.monto || 0), 0)

  const subtotalPorCategoria = CATEGORIAS_CREDITO.reduce(
    (acc, { key }) => {
      acc[key] = data.conceptos
        .filter((c) => c.categoria === key)
        .reduce((a, c) => a + (c.monto || 0), 0)
      return acc
    },
    {} as Record<CategoriaCredito, number>,
  )

  const valorGarantias = data.garantias.reduce((a, g) => a + (g.valor || 0), 0)
  const cobertura = montoAjustado > 0 ? valorGarantias / montoAjustado : null

  const { plazoMeses, mesesGracia } = data.condiciones

  const errores: string[] = []
  if (montoAjustado < p.montoMinimo || montoAjustado > p.montoMaximo) {
    errores.push(
      `El monto ajustado (${fmtMoney(montoAjustado)}) está fuera del rango del programa (${fmtMoney(p.montoMinimo)} – ${fmtMoney(p.montoMaximo)}).`,
    )
  }
  if (plazoMeses < p.plazoMinimoMeses || plazoMeses > p.plazoMaximoMeses) {
    errores.push(
      `El plazo ajustado (${plazoMeses} meses) está fuera del rango del programa (${p.plazoMinimoMeses} – ${p.plazoMaximoMeses} meses).`,
    )
  }
  if (mesesGracia > plazoMeses) {
    errores.push('Los meses de gracia no pueden superar el plazo.')
  }

  const avisos: string[] = []
  if (data.conceptos.length === 0) avisos.push('No hay conceptos capturados.')
  if (data.conceptos.some((c) => !c.concepto.trim() || c.monto <= 0)) {
    avisos.push('Hay conceptos sin descripción o con monto en cero.')
  }
  if (data.garantias.some((g) => !g.nombrePropietario.trim() || g.valor <= 0)) {
    avisos.push('Hay garantías sin propietario o con valor en cero.')
  }

  return {
    montoSolicitado,
    montoAjustado,
    deltaMonto: montoAjustado - montoSolicitado,
    subtotalPorCategoria,
    valorGarantias,
    cobertura,
    errores,
    avisos,
    bloqueado: errores.length > 0,
  }
}
