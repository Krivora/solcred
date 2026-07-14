import type { Programa } from '@/features/settings/types/programa.types'
import type {
  TipoPersona,
  Sector,
  TamanoEmpresa,
  DatosPersona,
  DatosCredito,
  DatosGarantia,
  DatosNegocio,
  DatosMercado,
  DatosBancarios,
} from './solicitud-form.types'

export type EstatusSolicitud =
  | 'BORRADOR'
  | 'PENDIENTE'
  | 'EN_REVISION'
  | 'EN_CORRECCION'
  | 'EN_FINANCIAMIENTO'
  | 'EN_APROBACION'
  | 'APROBADO'
  | 'RECHAZADO'
  | 'CANCELADO'

export const ESTATUS_FINALES: EstatusSolicitud[] = ['CANCELADO', 'RECHAZADO', 'APROBADO']

export type EstatusDocumento = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'

export interface GestorAsignado {
  id: string
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
}

export interface UsuarioResumen {
  id: string
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  correo?: string
  rol?: string
}

export interface GrupoResumen {
  id: string
  nombre: string
}

// ── Solicitud (vista general con datos capturados) ─────────────────────────

export interface Solicitud {
  id: string
  folio: string
  programaId: string
  programa: Pick<Programa, 'id' | 'nombre'>
  solicitanteId: string
  estatus: EstatusSolicitud
  tipoPersona?: TipoPersona
  sector?: Sector
  tamanoEmpresa?: TamanoEmpresa
  montoSolicitado?: number
  plazoSolicitado?: number
  datosSolicitante?: DatosPersona & { id: string }
  datosAval?: DatosPersona & { id: string }
  datosCredito?: DatosCredito & { id: string }
  datosGarantia?: DatosGarantia & { id: string }
  datosNegocio?: DatosNegocio & { id: string }
  datosMercado?: DatosMercado & { id: string }
  datosBancarios?: DatosBancarios & { id: string }
  creadoEn: string
  actualizadoEn: string
}

// ── Listado de promoción ────────────────────────────────────────────────────

export interface SolicitudPromocion {
  id: string
  folio: string
  estatus: EstatusSolicitud
  tipoPersona?: TipoPersona
  sector?: Sector
  tamanoEmpresa?: TamanoEmpresa
  montoSolicitado?: number
  plazoSolicitado?: number
  programa: Pick<{ id: string; nombre: string }, 'id' | 'nombre'>
  datosSolicitante?: {
    id: string
    nombre: string
    apellidoPaterno: string
    apellidoMaterno: string
    rfc?: string
    correo?: string
    celular?: string
  }
  metricas?: {
    totalRequeridos: number
    totalAprobados: number
    totalPendientes: number
    totalRechazados: number
    totalNoSubidos: number
    totalSubidos: number
    porcentajeCompletado: number
  }
  comentarioPromotor?: string | null
  gestorAsignado?: {
    gestor: GestorAsignado
    fechaAsignacion: string
  }
  creadoEn: string
  actualizadoEn: string
}

export interface PaginacionMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface SolicitudesPromocionResponse {
  data: SolicitudPromocion[]
  meta: PaginacionMeta
}

export interface StatsPromocion {
  total: number
  borrador: number
  pendiente: number
  enRevision: number
  aprobado: number
  rechazado: number
}

// ── Filtros ──────────────────────────────────────────────────────────────

export interface FiltrosPromocion {
  page: number
  limit: number
  estatus?: EstatusSolicitud | ''
  tipoPersona?: TipoPersona | ''
  sector?: Sector | ''
  tamanoEmpresa?: TamanoEmpresa | ''
  asignacion?: 'todos' | 'asignados' | 'sin_asignar' | ''
  programaId?: string
  fechaDesde?: string
  fechaHasta?: string
  busqueda?: string
}

export interface FiltrosMisCasos {
  page?: number
  limit?: number
  estatus?: string
  tipoPersona?: string
  sector?: string
  tamanoEmpresa?: string
  programaId?: string
  fechaDesde?: string
  fechaHasta?: string
  busqueda?: string
}

export interface FiltrosAprobacion {
  page: number
  limit: number
  tipoPersona?: string
  sector?: string
  tamanoEmpresa?: string
  programaId?: string
  fechaDesde?: string
  fechaHasta?: string
  busqueda?: string
}

// ── Programa / documentos requeridos ────────────────────────────────────────

export interface TipoDocumentoInfo {
  id: string
  nombre: string
  descripcion: string | null
}

export interface DocumentoRequeridoPrograma {
  id: string
  tipoDocumentoId: string
  esObligatorio: boolean
  aplicaA: 'FISICA' | 'MORAL' | 'AMBOS' | null
  tipoDocumento: TipoDocumentoInfo
}

export interface ProgramaDetalle {
  id: string
  nombre: string
  descripcion: string
  montoMinimo: number
  montoMaximo: number
  tasaOrdinaria: number
  tasaMoratoria: number
  tasaAnual: number
  plazoMinimoMeses: number
  plazoMaximoMeses: number
  aval: 'NO_REQUIERE' | 'OPCIONAL' | 'OBLIGATORIO'
  garantia: 'NO_REQUIERE' | 'OPCIONAL' | 'OBLIGATORIO'
  documentosRequeridos: DocumentoRequeridoPrograma[]
}

export interface DocumentoDetalle {
  id: string
  solicitudId: string
  tipoDocumentoId: string
  urlArchivo: string
  nombreArchivo: string
  version: number
  activo: boolean
  estatus: EstatusDocumento
  motivoRechazo: string | null
  fechaValidacion: string | null
  subidoEn: string
  tipoDocumento: TipoDocumentoInfo
  validadoPor: UsuarioResumen | null
}

// ── Asignación ───────────────────────────────────────────────────────────

export interface AsignacionDetalle {
  id: string
  solicitudId: string
  gestorId: string
  grupoId: string
  asignadoPorId: string | null
  activa: boolean
  fechaAsignacion: string
  fechaReasignacion: string | null
  motivoReasignacion: string | null
  gestor: UsuarioResumen
  grupo: GrupoResumen
  asignadoPor: UsuarioResumen | null // null = asignación automática
}

// ── Timeline ─────────────────────────────────────────────────────────────

export interface TimelineCambioEstatus {
  tipo: 'CAMBIO_ESTATUS'
  fecha: string
  estatusAnterior: EstatusSolicitud
  estatusNuevo: EstatusSolicitud
  comentario: string | null
  realizadoPor: UsuarioResumen
}

export interface TimelineAsignacion {
  tipo: 'ASIGNACION'
  fecha: string
  gestor: UsuarioResumen
  grupo: GrupoResumen
  asignadoPor: UsuarioResumen | null
  activa: boolean
}

export interface TimelineReasignacion {
  tipo: 'REASIGNACION'
  fecha: string
  gestorAnterior: UsuarioResumen
  comentario: string | null
}

export type TimelineEvento = TimelineCambioEstatus | TimelineAsignacion | TimelineReasignacion

// ── Vista de detalle ─────────────────────────────────────────────────────

export interface SolicitudDetalle {
  id: string
  folio: string
  programaId: string
  solicitanteId: string
  estatus: EstatusSolicitud
  tipoPersona: TipoPersona | null
  sector: Sector | null
  tamanoEmpresa: TamanoEmpresa | null
  montoSolicitado: number | null
  plazoSolicitado: number | null
  creadoEn: string
  actualizadoEn: string

  programa: ProgramaDetalle
  datosSolicitante: (DatosPersona & { id: string }) | null
  datosAval: (DatosPersona & { id: string }) | null
  documentos: DocumentoDetalle[]

  gestorAsignado: AsignacionDetalle | null
  historialAsignaciones: AsignacionDetalle[]
  timeline: TimelineEvento[]
}