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

export interface PanoramaAlerta {
  id: string
  nivel: 'warning' | 'critico'
  total: number
  titulo: string
  detalle: string
}

export interface PanoramaActividad {
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
  tiempoPorEtapa: PanoramaTiempoPorEtapa
  cartera: CarteraPrograma[]
  composicion: PanoramaComposicion
  equipo: PanoramaEquipo
  alertas: PanoramaAlerta[]
  actividad: PanoramaActividad[]
}
