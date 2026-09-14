import { AlertTriangle, Clock, UserCog, UserX, Users, XCircle } from 'lucide-react'
import type { ElementType } from 'react'
import { TONE, estatusSolicitud, type Tone } from '@/shared/config/estatus.tokens'
import type {
  MetadataCambioEstatus,
  MetadataReasignacionRequerida,
  Notificacion,
  NotificacionTipo,
} from '@/features/notificaciones/types/notificaciones.types'

export { TONE }

/** Tono por defecto de cada tipo. `CAMBIO_ESTATUS` lo resuelve dinámico
 *  (`resolverIconoYTono`) a partir del estatus destino — este valor nunca se usa
 *  para ese tipo, pero mantiene el `Record` exhaustivo. */
const TONE_POR_TIPO: Record<NotificacionTipo, Tone> = {
  ASIGNACION_GESTOR: 'info',
  ASIGNACION_ANALISTA: 'info',
  SOLICITUD_REGRESADA: 'danger',
  CAMBIO_ESTATUS: 'info',
  RESPONSABLE_ASIGNADO: 'info',
  DOCUMENTO_RECHAZADO: 'danger',
  REASIGNACION_REQUERIDA: 'warning',
  SOLICITUD_ESTANCADA: 'warning',
}

const ICONO_POR_TIPO: Record<NotificacionTipo, ElementType> = {
  ASIGNACION_GESTOR: UserCog,
  ASIGNACION_ANALISTA: UserCog,
  SOLICITUD_REGRESADA: AlertTriangle,
  CAMBIO_ESTATUS: UserCog, // se sobreescribe siempre para este tipo, ver abajo
  RESPONSABLE_ASIGNADO: UserCog,
  DOCUMENTO_RECHAZADO: XCircle,
  REASIGNACION_REQUERIDA: UserX,
  SOLICITUD_ESTANCADA: Clock,
}

/**
 * Ícono + tono a mostrar en el círculo del ítem. `CAMBIO_ESTATUS` reutiliza el
 * mismo `ESTATUS_SOLICITUD` que pinta el resto de la app (ver
 * `estatus.tokens.ts`) en vez de un tono fijo — el color de la notificación
 * es el color del estatus al que cambió. Las asignaciones en lote usan un
 * ícono distinto al de la individual (`Users` vs `UserCog`).
 */
export function resolverIconoYTono(n: Notificacion): { icon: ElementType; tone: Tone } {
  if (n.tipo === 'CAMBIO_ESTATUS') {
    const meta = n.metadata as Partial<MetadataCambioEstatus> | null
    const token = estatusSolicitud(meta?.estatusNuevo ?? '')
    return { icon: token.icon, tone: token.tone }
  }
  if ((n.tipo === 'ASIGNACION_GESTOR' || n.tipo === 'ASIGNACION_ANALISTA') && n.agrupadoCount > 1) {
    return { icon: Users, tone: TONE_POR_TIPO[n.tipo] }
  }
  return { icon: ICONO_POR_TIPO[n.tipo], tone: TONE_POR_TIPO[n.tipo] }
}

/**
 * A dónde navega el clic en una notificación. Las agrupadas de personal
 * (`solicitudId` nulo) van a la lista de casos, no a un detalle inexistente.
 * Las de personal individuales dependen del rol de quien mira (mismo evento,
 * pantalla distinta para GESTOR vs ANALISTA).
 */
export function destinoNotificacion(n: Notificacion, rol?: string): string | null {
  switch (n.tipo) {
    case 'ASIGNACION_GESTOR':
      return n.solicitudId
        ? `/dashboard/admin/promocion/expediente/${n.solicitudId}`
        : '/dashboard/admin/promocion/mis-casos'
    case 'ASIGNACION_ANALISTA':
      return n.solicitudId
        ? `/dashboard/financiamiento/solicitud/${n.solicitudId}`
        : '/dashboard/financiamiento/mis-casos'
    case 'SOLICITUD_REGRESADA':
      if (!n.solicitudId) return null
      return rol === 'ANALISTA'
        ? `/dashboard/financiamiento/solicitud/${n.solicitudId}`
        : `/dashboard/admin/promocion/expediente/${n.solicitudId}`
    case 'SOLICITUD_ESTANCADA':
      if (!n.solicitudId) return null
      return rol === 'ANALISTA'
        ? `/dashboard/financiamiento/solicitud/${n.solicitudId}`
        : `/dashboard/admin/promocion/expediente/${n.solicitudId}`
    case 'CAMBIO_ESTATUS':
    case 'RESPONSABLE_ASIGNADO':
    case 'DOCUMENTO_RECHAZADO':
      // La vista de detalle del cliente vive en /usuarios/expediente/[id], no
      // /usuarios/solicitudes/[id] (esa ruta solo tiene /nueva y /[id]/editar).
      return n.solicitudId ? `/dashboard/usuarios/expediente/${n.solicitudId}` : null
    case 'REASIGNACION_REQUERIDA': {
      // Va a la cola de "sin asignar" del área correspondiente — ahí es
      // donde las solicitudes liberadas por la baja vuelven a aparecer.
      const meta = n.metadata as Partial<MetadataReasignacionRequerida> | null
      return meta?.rolPersonal === 'ANALISTA'
        ? '/dashboard/financiamiento/asignacion'
        : '/dashboard/admin/promocion/asignacion'
    }
    default:
      return null
  }
}

const RTF = new Intl.RelativeTimeFormat('es-MX', { numeric: 'auto' })

/** "hace 5 min" / "hace 2 h" / "hace 3 d" — mismo criterio que `crm.config.ts`. */
export function tiempoRelativo(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now()
  const min = Math.round(diff / 60000)
  if (Math.abs(min) < 60) return RTF.format(min, 'minute')
  const hr = Math.round(min / 60)
  if (Math.abs(hr) < 24) return RTF.format(hr, 'hour')
  return RTF.format(Math.round(hr / 24), 'day')
}
