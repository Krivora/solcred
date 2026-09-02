import type {
  ComunicacionTipo,
  ComunicacionMotivo,
  ComunicacionResultado,
} from '@/features/crm/types/crm.types'

interface Opcion<T extends string> {
  value: T
  label: string
}

export const TIPOS_COMUNICACION: Opcion<ComunicacionTipo>[] = [
  { value: 'LLAMADA', label: 'Llamada telefónica' },
  { value: 'CORREO', label: 'Correo electrónico' },
  { value: 'MENSAJE', label: 'Mensaje' },
  { value: 'PRESENCIAL', label: 'Comunicación presencial' },
  { value: 'OTRO', label: 'Otro' },
]

export const MOTIVOS_COMUNICACION: Opcion<ComunicacionMotivo>[] = [
  { value: 'ACTUALIZACION_DOCUMENTACION', label: 'Solicitud de actualización de documentación' },
  { value: 'DOCUMENTACION_FALTANTE', label: 'Solicitud de documentación faltante' },
  { value: 'CONFIRMACION_INFORMACION', label: 'Confirmación de información proporcionada' },
  { value: 'SEGUIMIENTO_SOLICITUD', label: 'Seguimiento de una solicitud' },
  { value: 'CONFIRMACION_INTERES', label: 'Confirmación de interés en continuar' },
  { value: 'NOTIFICACION_AVANCE', label: 'Notificación sobre el avance de la solicitud' },
  { value: 'ACLARACION_INFORMACION', label: 'Aclaración de información' },
  { value: 'NOTIFICACION_INCIDENCIA', label: 'Notificación de incidencia o inconsistencia' },
  { value: 'RECORDATORIO_PENDIENTE', label: 'Recordatorio de documentación o trámite pendiente' },
  { value: 'OTRO', label: 'Otro motivo' },
]

export const RESULTADOS_COMUNICACION: Opcion<ComunicacionResultado>[] = [
  { value: 'CONTACTADO', label: 'Contactado exitosamente' },
  { value: 'NO_CONTACTADO', label: 'No se logró contactar' },
  { value: 'SOLICITA_RECONTACTO', label: 'Cliente solicita volver a ser contactado' },
  { value: 'CONFIRMA_CONTINUIDAD', label: 'Cliente confirma que continuará' },
  { value: 'DESISTE', label: 'Cliente ya no desea continuar' },
  { value: 'DOCUMENTACION_PENDIENTE', label: 'Documentación pendiente' },
  { value: 'DOCUMENTACION_ENVIADA', label: 'Documentación enviada' },
  { value: 'INFORMACION_ACLARADA', label: 'Información aclarada' },
  { value: 'SIN_RESPUESTA', label: 'Sin respuesta' },
  { value: 'OTRO', label: 'Otro' },
]

const mapa = <T extends string>(opts: Opcion<T>[]): Record<T, string> =>
  opts.reduce((acc, o) => ({ ...acc, [o.value]: o.label }), {} as Record<T, string>)

export const LABEL_TIPO = mapa(TIPOS_COMUNICACION)
export const LABEL_MOTIVO = mapa(MOTIVOS_COMUNICACION)
export const LABEL_RESULTADO = mapa(RESULTADOS_COMUNICACION)

/** Tono visual del chip de resultado. */
export const TONO_RESULTADO: Record<ComunicacionResultado, 'ok' | 'warn' | 'crit' | 'muted'> = {
  CONTACTADO: 'ok',
  CONFIRMA_CONTINUIDAD: 'ok',
  DOCUMENTACION_ENVIADA: 'ok',
  INFORMACION_ACLARADA: 'ok',
  SOLICITA_RECONTACTO: 'warn',
  DOCUMENTACION_PENDIENTE: 'warn',
  NO_CONTACTADO: 'warn',
  SIN_RESPUESTA: 'warn',
  DESISTE: 'crit',
  OTRO: 'muted',
}

export const TONO_CLASS: Record<'ok' | 'warn' | 'crit' | 'muted', string> = {
  ok: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40',
  warn: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/45',
  crit: 'bg-destructive/15 text-destructive border-destructive/45',
  muted: 'bg-muted text-muted-foreground border-border',
}

const FMT_FECHA = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export const formatearFechaContacto = (iso: string): string => FMT_FECHA.format(new Date(iso))

const RTF = new Intl.RelativeTimeFormat('es-MX', { numeric: 'auto' })
export function tiempoRelativo(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now()
  const min = Math.round(diff / 60000)
  if (Math.abs(min) < 60) return RTF.format(min, 'minute')
  const hr = Math.round(min / 60)
  if (Math.abs(hr) < 24) return RTF.format(hr, 'hour')
  return RTF.format(Math.round(hr / 24), 'day')
}
