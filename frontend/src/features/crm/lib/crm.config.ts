import { Mail, MessageSquare, MoreHorizontal, Phone, Users } from 'lucide-react'
import type { StatusTone } from '@/shared/components/ui/status-chip'
import type { TagTone } from '@/shared/components/ui/tag'
import type {
  ComunicacionTipo,
  ComunicacionMotivo,
  ComunicacionResultado,
} from '@/features/crm/types/crm.types'

interface Opcion<T extends string> {
  value: T
  label: string
  /** Forma breve para mostrar en el historial (el `label` es para el <Select>). */
  short?: string
}

export const TIPOS_COMUNICACION: Opcion<ComunicacionTipo>[] = [
  { value: 'LLAMADA', label: 'Llamada telefónica', short: 'Llamada' },
  { value: 'CORREO', label: 'Correo electrónico', short: 'Correo' },
  { value: 'MENSAJE', label: 'Mensaje', short: 'Mensaje' },
  { value: 'PRESENCIAL', label: 'Comunicación presencial', short: 'Presencial' },
  { value: 'OTRO', label: 'Otro', short: 'Otro' },
]

export const MOTIVOS_COMUNICACION: Opcion<ComunicacionMotivo>[] = [
  { value: 'ACTUALIZACION_DOCUMENTACION', label: 'Solicitud de actualización de documentación', short: 'Actualización de documentación' },
  { value: 'DOCUMENTACION_FALTANTE', label: 'Solicitud de documentación faltante', short: 'Documentación faltante' },
  { value: 'CONFIRMACION_INFORMACION', label: 'Confirmación de información proporcionada', short: 'Confirmación de información' },
  { value: 'SEGUIMIENTO_SOLICITUD', label: 'Seguimiento de una solicitud', short: 'Seguimiento de solicitud' },
  { value: 'CONFIRMACION_INTERES', label: 'Confirmación de interés en continuar', short: 'Confirmación de interés' },
  { value: 'NOTIFICACION_AVANCE', label: 'Notificación sobre el avance de la solicitud', short: 'Avance de la solicitud' },
  { value: 'ACLARACION_INFORMACION', label: 'Aclaración de información', short: 'Aclaración de información' },
  { value: 'NOTIFICACION_INCIDENCIA', label: 'Notificación de incidencia o inconsistencia', short: 'Incidencia o inconsistencia' },
  { value: 'RECORDATORIO_PENDIENTE', label: 'Recordatorio de documentación o trámite pendiente', short: 'Recordatorio de pendiente' },
  { value: 'OTRO', label: 'Otro motivo', short: 'Otro motivo' },
]

export const RESULTADOS_COMUNICACION: Opcion<ComunicacionResultado>[] = [
  { value: 'CONTACTADO', label: 'Contactado exitosamente', short: 'Contactado' },
  { value: 'NO_CONTACTADO', label: 'No se logró contactar', short: 'No contactado' },
  { value: 'SOLICITA_RECONTACTO', label: 'Cliente solicita volver a ser contactado', short: 'Pide recontacto' },
  { value: 'CONFIRMA_CONTINUIDAD', label: 'Cliente confirma que continuará', short: 'Confirma interés' },
  { value: 'DESISTE', label: 'Cliente ya no desea continuar', short: 'Desiste' },
  { value: 'DOCUMENTACION_PENDIENTE', label: 'Documentación pendiente', short: 'Doc. pendiente' },
  { value: 'DOCUMENTACION_ENVIADA', label: 'Documentación enviada', short: 'Doc. enviada' },
  { value: 'INFORMACION_ACLARADA', label: 'Información aclarada', short: 'Aclarado' },
  { value: 'SIN_RESPUESTA', label: 'Sin respuesta', short: 'Sin respuesta' },
  { value: 'OTRO', label: 'Otro', short: 'Otro' },
]

/** Icono por tipo de comunicación (dialog + historial). */
export const ICONO_TIPO: Record<ComunicacionTipo, React.ElementType> = {
  LLAMADA: Phone,
  CORREO: Mail,
  MENSAJE: MessageSquare,
  PRESENCIAL: Users,
  OTRO: MoreHorizontal,
}

const mapa = <T extends string>(
  opts: Opcion<T>[],
  campo: 'label' | 'short' = 'label',
): Record<T, string> =>
  opts.reduce(
    (acc, o) => ({ ...acc, [o.value]: o[campo] ?? o.label }),
    {} as Record<T, string>,
  )

export const LABEL_TIPO = mapa(TIPOS_COMUNICACION, 'short')
export const LABEL_MOTIVO = mapa(MOTIVOS_COMUNICACION)
export const LABEL_MOTIVO_CORTO = mapa(MOTIVOS_COMUNICACION, 'short')
export const LABEL_RESULTADO = mapa(RESULTADOS_COMUNICACION)
export const LABEL_RESULTADO_CORTO = mapa(RESULTADOS_COMUNICACION, 'short')

/** Estado semántico del resultado → <StatusChip tone>. */
export const RESULTADO_TONE: Record<ComunicacionResultado, StatusTone> = {
  CONTACTADO: 'ok',
  CONFIRMA_CONTINUIDAD: 'ok',
  DOCUMENTACION_ENVIADA: 'ok',
  INFORMACION_ACLARADA: 'ok',
  SOLICITA_RECONTACTO: 'warn',
  DOCUMENTACION_PENDIENTE: 'warn',
  NO_CONTACTADO: 'warn',
  SIN_RESPUESTA: 'warn',
  DESISTE: 'danger',
  OTRO: 'neutral',
}

/** Tipo de comunicación → color categórico del <Tag>. */
export const TIPO_TONE: Record<ComunicacionTipo, TagTone> = {
  LLAMADA: 2,
  CORREO: 1,
  MENSAJE: 3,
  PRESENCIAL: 4,
  OTRO: 'neutral',
}

const FMT_FECHA = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export const formatearFechaContacto = (iso: string): string => FMT_FECHA.format(new Date(iso))

const FMT_FECHA_CORTA = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

/** "2 sept 2026, 14:30" — para la línea del historial. */
export const formatearFechaCorta = (iso: string): string =>
  FMT_FECHA_CORTA.format(new Date(iso)).replace('.', '')

const RTF = new Intl.RelativeTimeFormat('es-MX', { numeric: 'auto' })
export function tiempoRelativo(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now()
  const min = Math.round(diff / 60000)
  if (Math.abs(min) < 60) return RTF.format(min, 'minute')
  const hr = Math.round(min / 60)
  if (Math.abs(hr) < 24) return RTF.format(hr, 'hour')
  return RTF.format(Math.round(hr / 24), 'day')
}
