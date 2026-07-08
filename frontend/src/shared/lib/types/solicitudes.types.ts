import type { Programa } from '@/features/programas/types/programa.types'

export type TipoPersona = 'FISICA' | 'MORAL'
export type Sector = 'AGROPECUARIO' | 'INDUSTRIAL' | 'COMERCIAL' | 'SERVICIOS' | 'TECNOLOGIA' | 'OTRO'
export type TamanoEmpresa = 'MICRO' | 'PEQUENA' | 'MEDIANA' | 'GRANDE'
export type EstatusSolicitud =
  | 'BORRADOR'
  | 'PENDIENTE'
  | 'EN_REVISION'
  | 'EN_CORRECION'
  | 'EN_FINANCIAMIENTO'
  | 'EN_APROBACION'
  | 'APROBADO'
  | 'RECHAZADO'
  | 'CANCELADO'

export const ESTATUS_FINALES: EstatusSolicitud[] = ['CANCELADO', 'RECHAZADO', 'APROBADO']
export type EstatusDocumento = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'
export type EstadoCivil = 'SOLTERO' | 'CASADO' | 'DIVORCIADO' | 'VIUDO' | 'UNION_LIBRE'
export type NivelEstudio = 'PRIMARIA' | 'SECUNDARIA' | 'PREPARATORIA' | 'TECNICO' | 'LICENCIATURA' | 'MAESTRIA' | 'DOCTORADO'
export type TipoVivienda =| "PROPIA"| "RENTADA"| "PAGANDO"

export interface GestorAsignado {
  id: string
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
}

export interface DatosPersona {
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  curp?: string
  rfc?: string
  telefono?: string
  celular?: string
  correo?: string
  calle?: string
  numeroExterior?: string
  numeroInterior?: string
  colonia?: string
  ciudad?: string
  estado?: string
  codigoPostal?: string
  nivelEstudio?: NivelEstudio
  universidad?: string
  estadoCivil?: EstadoCivil
  nombreConyuge?: string
  numeroINE?: string
  tipoVivienda?: TipoVivienda
  aniosDomicilioActual?: number
  aniosDomicilioAnterior?: number
}

export interface CrearSolicitudDto {
  programaId: string

}

export interface DatosGenerales {
  tipoPersona: TipoPersona
  sector: Sector
  tamanoEmpresa?: TamanoEmpresa
}

// actualizar Solicitud — los campos ahora son opcionales
export interface Solicitud {
  id: string
  folio: string
  programaId: string
  programa: Pick<Programa, 'id' | 'nombre'>
  solicitanteId: string
  estatus: EstatusSolicitud
  tipoPersona?: TipoPersona        // ← opcional
  sector?: Sector                  // ← opcional
  tamanoEmpresa?: TamanoEmpresa
  montoSolicitado?: number         // ← opcional
  plazoSolicitado?: number         // ← opcional
  datosSolicitante?: DatosPersona & { id: string }
  datosAval?: DatosPersona & { id: string }
  creadoEn: string
  actualizadoEn: string
}

// AGREGAR al final de solicitudes.types.ts

export interface SolicitudPromocion {
  id: string
  folio:string
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
  asignacion?: {
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