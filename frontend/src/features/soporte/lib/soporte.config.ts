import {
  Sparkles,
  UserCheck,
  Loader2,
  Clock,
  CheckCircle2,
  Archive,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import type { StatusTone } from '@/shared/components/ui/status-chip'
import type {
  TicketEstatus,
  TicketPrioridad,
  TicketCategoria,
  EstadoSla,
} from '@/features/soporte/types/soporte.types'

interface Estilo {
  label: string
  tono: StatusTone
  icon?: LucideIcon
  /** Clase extra encima del tono (p. ej. tachado en cancelado). */
  className?: string
}

// Tono = urgencia/atención, no un color distinto por cada estado (evita el
// "arcoíris" genérico). El ícono distingue estados que comparten tono.
export const ESTATUS_TICKET: Record<TicketEstatus, Estilo> = {
  NUEVO: { label: 'Nuevo', tono: 'info', icon: Sparkles },
  ASIGNADO: { label: 'Asignado', tono: 'neutral', icon: UserCheck },
  EN_PROGRESO: { label: 'En progreso', tono: 'info', icon: Loader2 },
  ESPERANDO_CLIENTE: { label: 'Esperando tu respuesta', tono: 'warn', icon: Clock },
  RESUELTO: { label: 'Resuelto', tono: 'ok', icon: CheckCircle2 },
  CERRADO: { label: 'Cerrado', tono: 'neutral', icon: Archive },
  CANCELADO: { label: 'Cancelado', tono: 'neutral', icon: XCircle, className: 'line-through opacity-75' },
}

export const PRIORIDAD_TICKET: Record<TicketPrioridad, Estilo> = {
  BAJA: { label: 'Baja', tono: 'neutral' },
  MEDIA: { label: 'Media', tono: 'info' },
  ALTA: { label: 'Alta', tono: 'warn' },
  URGENTE: { label: 'Urgente', tono: 'danger' },
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

export const ESTADO_SLA: Record<EstadoSla, { label: string; tono: StatusTone }> = {
  sin_iniciar: { label: 'Sin iniciar', tono: 'neutral' },
  cumplido: { label: 'Cumplido', tono: 'ok' },
  en_curso: { label: 'En tiempo', tono: 'ok' },
  en_riesgo: { label: 'Por vencer', tono: 'warn' },
  vencido: { label: 'Vencido', tono: 'danger' },
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
