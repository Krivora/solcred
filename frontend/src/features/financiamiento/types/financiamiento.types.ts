import type {
  SolicitudPromocion,
  SolicitudDetalle,
  PersonalResumen,
} from '@/features/promocion/types/solicitud.types'

/**
 * Item de listado de financiamiento. El backend (`admin/financiamiento`) devuelve
 * el mismo shape que Promoción (para reusar `SolicitudesTable`), más el analista
 * asignado del área de financiamiento.
 */
export interface SolicitudFinanciamiento extends SolicitudPromocion {
  analistaAsignado?: {
    fechaAsignacion: string
    analista: PersonalResumen
  } | null
}

/** Detalle: mismo `SolicitudDetalle` de promoción (ya incluye `analistaAsignado`). */
export type SolicitudFinanciamientoDetalle = SolicitudDetalle

/** Filtros comunes a todos los listados de financiamiento. */
export interface FiltrosFinanciamiento {
  page: number
  pageSize: number
  tipoPersona?: string
  sector?: string
  tamanoEmpresa?: string
  programaId?: string
  fechaDesde?: string
  fechaHasta?: string
  busqueda?: string
}

export interface FinanciamientoStats {
  mesaControl: number
  asignacion: number
  analisis: number
  validacion: number
  comite: number
  aprobados: number
  rechazados: number
}

export interface AnalistaConCarga {
  id: string
  usuario: {
    nombre: string
    apellidoPaterno: string
    apellidoMaterno: string
  }
  carga: number
}
