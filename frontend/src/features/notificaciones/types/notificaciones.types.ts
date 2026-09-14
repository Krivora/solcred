import type { NotificacionTipo, NotificacionCanal, EstatusSolicitud } from '@/shared/types/domain.enums'
import type { RespuestaPaginada } from '@/shared/types/api'

export type { NotificacionTipo, NotificacionCanal }

/** `metadata` de una notificación `CAMBIO_ESTATUS`. */
export interface MetadataCambioEstatus {
  estatusAnterior: EstatusSolicitud
  estatusNuevo: EstatusSolicitud
}

/** `metadata` de una notificación `RESPONSABLE_ASIGNADO`. */
export interface MetadataResponsableAsignado {
  rol: 'GESTOR' | 'ANALISTA'
}

/** `metadata` de una notificación de asignación en lote (personal). */
export interface MetadataAsignacionLote {
  solicitudIds: string[]
  folios: string[]
}

/** `metadata` de una notificación `REASIGNACION_REQUERIDA`. */
export interface MetadataReasignacionRequerida {
  rolPersonal: 'GESTOR' | 'ANALISTA'
  solicitudIds: string[]
  folios: string[]
}

/** Una notificación tal como la devuelve el API. Espejo de
 *  `backend/src/modules/notificaciones/notificaciones.contract.ts` (`NotificacionResponse`). */
export interface Notificacion {
  id: string
  tipo: NotificacionTipo
  titulo: string
  cuerpo: string | null
  solicitudId: string | null
  solicitud: { id: string; folio: string } | null
  documentoId: string | null
  agrupadoCount: number
  metadata: unknown
  canal: NotificacionCanal
  leidaEn: string | null
  creadoEn: string
}

export type Notificaciones = RespuestaPaginada<Notificacion>

export interface FiltrosNotificaciones {
  page?: number
  pageSize?: number
  soloNoLeidas?: boolean
}

export interface ContadorNoLeidas {
  count: number
}
