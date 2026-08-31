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

/** Filtros de la pantalla de Asignación (muestra EN_ASIGNACION + EN_ANALISIS). */
export interface FiltrosAsignacionFinanciamiento extends FiltrosFinanciamiento {
  asignacion?: 'asignados' | 'sin_asignar'
  analistaId?: string
}

/** Resultado por solicitud de una asignación/reasignación en lote. */
export interface ResultadoAsignacion {
  solicitudId: string
  exito: boolean
  mensaje?: string
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

/** Shape aplanado (igual que `GestorConCarga` de Promoción, sin `grupoId`). */
export interface AnalistaConCarga {
  id: string
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  correo: string
  cargaActual: number
}
