import type { EstatusSolicitud } from '@/shared/types/domain.enums'

/** Espejo de `backend/src/modules/admin/dashboard/dashboard.service.ts`. */

export type RangoDashboard = '7d' | '30d' | '90d' | '12m'

export type DeltaTipo = 'positivo' | 'negativo' | 'neutro'

export interface KpiValor {
  /** `null` cuando no hay datos suficientes en el periodo. */
  valor: number | null
  /** Porcentaje o puntos, según el KPI. `null` si no aplica / sin base. */
  delta: number | null
  /** Qué dirección del delta se considera buena. */
  deltaTipo: DeltaTipo
}

export interface PanoramaKpis {
  activas: KpiValor
  recibidas: KpiValor
  tasaAprobacion: KpiValor
  tiempoResolucion: KpiValor
  montoPipeline: KpiValor
  montoAprobado: KpiValor
}

export interface EmbudoEtapa {
  estatus: string
  label: string
  valor: number
}

export interface PanoramaEmbudo {
  promocion: EmbudoEtapa[]
  financiamiento: EmbudoEtapa[]
  aprobadasPeriodo: number
}

export interface PasoFormularioEtapa {
  paso: string
  label: string
  valor: number
}

/** Embudo de conversión del formulario: dónde abandonan los clientes su BORRADOR. */
export interface PanoramaEmbudoFormulario {
  totalIniciaron: number
  totalEnviaron: number
  tasaConversion: number | null
  pasos: PasoFormularioEtapa[]
}

export interface PanoramaResolucion {
  aprobadas: number
  rechazadas: number
  canceladas: number
  total: number
  tasaAprobacion: number | null
}

export interface TendenciaPunto {
  label: string
  recibidas: number
  resueltas: number
}

export interface PanoramaTendencia {
  modo: 'semanal' | 'mensual'
  puntos: TendenciaPunto[]
  sparklines: {
    recibidas: number[]
    tasaAprobacion: (number | null)[]
    tiempoResolucion: (number | null)[]
  }
}

export interface SerieTendenciaAprobacion {
  /** Nombre del programa, o el sector (ej. "TECNOLOGIA"). */
  clave: string
  /** Tasa de aprobación % por periodo, mismo orden/longitud que `periodos`. `null` = sin dictámenes ese periodo. */
  porBucket: (number | null)[]
}

export interface TendenciaAprobacion {
  /** Labels del eje X — mismo criterio que `PanoramaTendencia` (semanas "S1".."S12" o meses). */
  periodos: string[]
  porPrograma: SerieTendenciaAprobacion[]
  porSector: SerieTendenciaAprobacion[]
}

export interface TiempoEtapa {
  estatus: string
  label: string
  dias: number
  muestras: number
}

export interface PanoramaTiempoPorEtapa {
  etapas: TiempoEtapa[]
  slaDias: number
  peorEtapa: string | null
}

export interface CarteraPrograma {
  programa: string
  solicitado: number
  aprobado: number
  /** Solicitudes distintas del programa en el periodo (no conceptos de crédito). */
  solicitudes: number
  /** `null` si el programa no tiene dictamen (aprobado/rechazado) todavía. */
  tasaAprobacion: number | null
}

export interface ComposicionItem {
  clave: string
  valor: number
}

export interface PanoramaComposicion {
  sector: ComposicionItem[]
  tamano: ComposicionItem[]
  persona: ComposicionItem[]
}

export interface PersonaCarga {
  nombre: string
  carga: number
  capacidad: number
}

export interface PanoramaEquipo {
  gestores: PersonaCarga[]
  analistas: PersonaCarga[]
}

export interface DesempenoGestor {
  nombre: string
  /** Solicitudes que su gestión movió a Mesa de Control (EN_FINANCIAMIENTO) en el periodo. */
  avances: number
}

export interface DesempenoAnalista {
  nombre: string
  /** Casos dictaminados (aprobado + rechazado) en el periodo. */
  resueltas: number
  tasaAprobacion: number | null
  tiempoPromedioDias: number | null
}

/** Desempeño real del equipo en el periodo — complementa `PanoramaEquipo` (carga actual). */
export interface PanoramaDesempeno {
  gestores: DesempenoGestor[]
  analistas: DesempenoAnalista[]
}

export interface PanoramaAlerta {
  id: string
  nivel: 'warning' | 'critico'
  total: number
  titulo: string
  detalle: string
}

export interface PanoramaActividad {
  solicitudId: string
  folio: string
  estatusAnterior: EstatusSolicitud
  estatusNuevo: EstatusSolicitud
  motivo: string | null
  usuario: string
  fecha: string
}

export interface Panorama {
  rango: RangoDashboard
  generadoEn: string
  kpis: PanoramaKpis
  embudo: PanoramaEmbudo
  embudoFormulario: PanoramaEmbudoFormulario
  resolucion: PanoramaResolucion
  tendencia: PanoramaTendencia
  tendenciaAprobacion: TendenciaAprobacion
  tiempoPorEtapa: PanoramaTiempoPorEtapa
  cartera: CarteraPrograma[]
  composicion: PanoramaComposicion
  equipo: PanoramaEquipo
  desempeno: PanoramaDesempeno
  alertas: PanoramaAlerta[]
  actividad: PanoramaActividad[]
}
