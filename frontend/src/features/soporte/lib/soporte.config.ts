import type {
  TicketEstatus,
  TicketPrioridad,
  TicketCategoria,
  EstadoSla,
} from '@/features/soporte/types/soporte.types'

interface Estilo {
  label: string
  className: string
}

// Tokens del sistema (globals.css): trío por estado + categóricos + marca.
export const ESTATUS_TICKET: Record<TicketEstatus, Estilo> = {
  NUEVO: { label: 'Nuevo', className: 'bg-info-surface text-info-ink border-info/25' },
  ASIGNADO: { label: 'Asignado', className: 'bg-cat-1-surface text-cat-1 border-cat-1/25' },
  EN_PROGRESO: { label: 'En progreso', className: 'bg-brand-surface text-brand-ink border-brand/25' },
  ESPERANDO_CLIENTE: { label: 'Esperando tu respuesta', className: 'bg-warn-surface text-warn-ink border-warn/25' },
  RESUELTO: { label: 'Resuelto', className: 'bg-ok-surface text-ok-ink border-ok/25' },
  CERRADO: { label: 'Cerrado', className: 'bg-surface-sunken text-ink-muted border-hairline' },
  CANCELADO: { label: 'Cancelado', className: 'bg-surface-sunken text-ink-subtle border-hairline line-through' },
}

export const PRIORIDAD_TICKET: Record<TicketPrioridad, Estilo> = {
  BAJA: { label: 'Baja', className: 'bg-surface-sunken text-ink-muted border-hairline' },
  MEDIA: { label: 'Media', className: 'bg-info-surface text-info-ink border-info/25' },
  ALTA: { label: 'Alta', className: 'bg-warn-surface text-warn-ink border-warn/25' },
  URGENTE: { label: 'Urgente', className: 'bg-danger-surface text-danger-ink border-danger/30' },
}

export const CATEGORIA_TICKET: Record<TicketCategoria, string> = {
  SOPORTE_TECNICO: 'Soporte técnico',
  INCIDENTE: 'Incidente',
  DUDA_USO: 'Duda de uso',
  ACCESO_PERMISOS: 'Accesos y permisos',
  PRESTAMO_EQUIPO: 'Préstamo de equipo',
  SOLICITUD_INFORMACION: 'Solicitud de información',
  OTRO: 'Otro',
}

/** Categorías que un solicitante puede elegir al crear (todas). */
export const CATEGORIAS_CREACION: { value: TicketCategoria; label: string; ayuda: string }[] = [
  { value: 'SOPORTE_TECNICO', label: 'Soporte técnico', ayuda: 'Algo del sistema no funciona bien' },
  { value: 'INCIDENTE', label: 'Incidente', ayuda: 'Algo grave y urgente: caído, datos mal, no puedo entrar' },
  { value: 'DUDA_USO', label: 'Duda de uso', ayuda: '¿Cómo hago X? Necesito ayuda para usar el sistema' },
  { value: 'ACCESO_PERMISOS', label: 'Accesos y permisos', ayuda: 'Alta/baja de usuario, cambio de rol, permisos que faltan' },
  { value: 'PRESTAMO_EQUIPO', label: 'Préstamo de equipo', ayuda: 'Laptop, proyector, sala, cargador' },
  { value: 'SOLICITUD_INFORMACION', label: 'Solicitud de información', ayuda: 'Pedir un dato o reporte' },
  { value: 'OTRO', label: 'Otro', ayuda: 'No encaja en lo anterior' },
]

export const PRIORIDADES_SUGERIBLES: { value: 'BAJA' | 'MEDIA' | 'ALTA'; label: string }[] = [
  { value: 'BAJA', label: 'Baja — puede esperar' },
  { value: 'MEDIA', label: 'Media — normal' },
  { value: 'ALTA', label: 'Alta — me está bloqueando' },
]

export const ESTADO_SLA: Record<EstadoSla, { label: string; tono: 'ok' | 'warn' | 'crit' | 'muted' }> = {
  sin_iniciar: { label: 'Sin iniciar', tono: 'muted' },
  cumplido: { label: 'Cumplido', tono: 'ok' },
  en_curso: { label: 'En tiempo', tono: 'ok' },
  en_riesgo: { label: 'Por vencer', tono: 'warn' },
  vencido: { label: 'Vencido', tono: 'crit' },
}

export const TONO_CLASS: Record<'ok' | 'warn' | 'crit' | 'muted', string> = {
  ok: 'bg-ok-surface text-ok-ink border-ok/25',
  warn: 'bg-warn-surface text-warn-ink border-warn/25',
  crit: 'bg-danger-surface text-danger-ink border-danger/30',
  muted: 'bg-surface-sunken text-ink-muted border-hairline',
}

/** "en 3 h 12 m" / "vencido hace 20 m" a partir de una fecha límite ISO. */
export function formatearCuentaRegresiva(limiteIso: string | null): string {
  if (!limiteIso) return '—'
  const diffMs = new Date(limiteIso).getTime() - Date.now()
  const venc = diffMs < 0
  let s = Math.abs(Math.floor(diffMs / 1000))
  const d = Math.floor(s / 86400); s -= d * 86400
  const h = Math.floor(s / 3600); s -= h * 3600
  const m = Math.floor(s / 60)
  const partes = [d && `${d} d`, h && `${h} h`, (!d && m) ? `${m} m` : null].filter(Boolean).join(' ') || '0 m'
  return venc ? `vencido hace ${partes}` : `en ${partes}`
}

const RTF = new Intl.RelativeTimeFormat('es-MX', { numeric: 'auto' })
export function tiempoRelativo(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now()
  const min = Math.round(diff / 60000)
  if (Math.abs(min) < 60) return RTF.format(min, 'minute')
  const hr = Math.round(min / 60)
  if (Math.abs(hr) < 24) return RTF.format(hr, 'hour')
  return RTF.format(Math.round(hr / 24), 'day')
}

export function formatearBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}
