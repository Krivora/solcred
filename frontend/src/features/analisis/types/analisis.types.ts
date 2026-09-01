import type { CategoriaCredito, TipoGarantia } from '@/shared/types/domain.enums'

export type PeriodoKey = 'c1' | 'c2' | 'c3' | 'c4'

export const PERIODOS: readonly PeriodoKey[] = ['c1', 'c2', 'c3', 'c4'] as const

export interface PeriodoMeta {
  /** Ej. "Año 2", "Año 1", "Parcial", "Proyección" (editable). */
  etiqueta: string
  /** Fecha de corte ISO (yyyy-mm-dd) o null. */
  corte: string | null
  /** Solo el parcial (c3): meses transcurridos para anualizar (1–12). */
  meses?: number
}

export type ValoresCuenta = Partial<Record<PeriodoKey, number>>

export interface SituacionFinancieraData {
  periodos: Record<PeriodoKey, PeriodoMeta>
  balance: Record<string, ValoresCuenta>
  resultados: Record<string, ValoresCuenta>
}

export type AnalisisTab =
  | 'situacionFinanciera'
  | 'ajustesCredito'
  | 'criteriosEvaluacion'
  | 'amortizacion'
  | 'comentario'

// ─────────────────────────────────────────────────────────────────────────────
// Ajustes del Crédito
// ─────────────────────────────────────────────────────────────────────────────

export interface CondicionesCredito {
  plazoMeses: number
  mesesGracia: number
  /** Tasa anual en porcentaje (0–100). */
  tasaAnual: number
}

export interface ConceptoAjuste {
  categoria: CategoriaCredito
  concepto: string
  monto: number
}

export interface GarantiaAjuste {
  tipo: TipoGarantia
  nombrePropietario: string
  valor: number
  descripcion: string | null
  // PRENDARIA (bien mueble)
  marca: string | null
  modelo: string | null
  anio: number | null
  numeroSerie: string | null
  // HIPOTECARIA (inmueble)
  calle: string | null
  numeroExterior: string | null
  numeroInterior: string | null
  colonia: string | null
  ciudad: string | null
  estado: string | null
  codigoPostal: string | null
  numeroEscritura: string | null
  folioReal: string | null
}

/** Lo que el analista guarda: su versión ajustada de la solicitud de crédito. */
export interface AjustesCreditoData {
  condiciones: CondicionesCredito
  conceptos: ConceptoAjuste[]
  garantias: GarantiaAjuste[]
  observaciones?: string
}

/** Rangos y tasas del programa — referencia para validar los ajustes. */
export interface ProgramaReferencia {
  montoMinimo: number
  montoMaximo: number
  plazoMinimoMeses: number
  plazoMaximoMeses: number
  tasaOrdinaria: number
  tasaMoratoria: number
  tasaAnual: number
}

/** Datos "de origen" que manda el backend para precargar la pestaña. */
export interface AjustesCreditoOrigen {
  condiciones: CondicionesCredito
  programa: ProgramaReferencia
  conceptos: ConceptoAjuste[]
  garantias: GarantiaAjuste[]
}

export interface AnalisisOrigen {
  ajustesCredito: AjustesCreditoOrigen
}

// ─────────────────────────────────────────────────────────────────────────────
// Criterios de Evaluación
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Todo lo demás en esta pestaña (razones de liquidez, endeudamiento,
 * rentabilidad, cobertura) se recalcula en vivo desde `situacionFinanciera` —
 * ver `lib/criterios-evaluacion.ts`. Lo único que persiste es la lectura del
 * analista, para que nunca quede una cifra guardada desincronizada del balance.
 */
export interface CriteriosEvaluacionData {
  observaciones?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Amortización
// ─────────────────────────────────────────────────────────────────────────────

/**
 * La tabla en sí se recalcula en vivo desde `ajustesCredito` (o, si el analista
 * aún no ha guardado ajustes, desde `origen.ajustesCredito`) — ver
 * `lib/amortizacion.ts`. Lo único que persiste aquí es lo que no se puede
 * derivar de otra pestaña: la fecha de dispersión (ancla el calendario de
 * pagos) y la observación del analista.
 */
export interface AmortizacionData {
  /** Fecha ISO (yyyy-mm-dd) estimada de dispersión. Sin ella, las filas solo muestran "Mes N". */
  fechaDispersion?: string | null
  observaciones?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Comentario
// ─────────────────────────────────────────────────────────────────────────────

/** Las 5 secciones del comentario del analista — cada una autoguardada por separado. */
export interface ComentarioData {
  antecedentes?: string
  buroCredito?: string
  situacionFinanciera?: string
  visita?: string
  opinionAnalista?: string
}

export interface AnalisisContexto {
  folio: string
  estatus: string
  tipoPersona: string | null
  programa: string
  razonSocial: string | null
  montoSolicitado: number | null
  plazoSolicitado: number | null
}

export interface Analisis {
  solicitudId: string
  situacionFinanciera: SituacionFinancieraData | null
  ajustesCredito: AjustesCreditoData | null
  criteriosEvaluacion: CriteriosEvaluacionData | null
  amortizacion: AmortizacionData | null
  comentario: ComentarioData | null
}

export interface AnalisisResponse {
  analisis: Analisis
  editable: boolean
  contexto: AnalisisContexto
  origen: AnalisisOrigen
}
