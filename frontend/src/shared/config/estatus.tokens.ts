/**
 * Fuente única de estilo para estatus de solicitud y de documento.
 *
 * Antes había cuatro mapas de color divergentes (`ESTATUS_CONFIG` en
 * `features/solicitudes`, `ESTATUS_STYLES` en `shared/config`, y los objetos
 * `config` / `ESTATUS_META` dentro de `features/expediente`). Este módulo los
 * reemplaza: cada estatus se resuelve a un **tono** semántico y cada tono
 * expone un paquete de clases theme-aware.
 *
 * Los tonos `solid` / `text` se apoyan en los tokens `--success`, `--warning`,
 * `--info`, `--destructive` (que ya se invierten en `.dark`). Los paquetes
 * `badge` / `chip` usan la escala Tailwind afinada por par claro/oscuro para
 * garantizar contraste de texto sobre fondo translúcido.
 */
import {
  FileEdit,
  Clock,
  Search,
  Gavel,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Upload,
  Banknote,
  UserCog,
  Calculator,
  ClipboardCheck,
  Users,
} from 'lucide-react'
import type { EstatusSolicitud } from '@/shared/types/solicitudes.types'

export type Tone = 'neutral' | 'warning' | 'info' | 'success' | 'danger'

export interface ToneClasses {
  /** Relleno saturado: barras de progreso y de composición, puntos de estatus. */
  solid: string
  /** Color del tono para íconos sueltos o cifras (ej. el % del anillo). */
  text: string
  /** Chip cuadrado con ícono: fondo translúcido + texto + `ring-1`. */
  chip: string
  /** Pill de badge: fondo translúcido + texto + borde. */
  badge: string
  /** Tinte de fila en tablas. Solo `danger` lo aplica. */
  rowTint: string
}

export const TONE: Record<Tone, ToneClasses> = {
  neutral: {
    solid: 'bg-muted-foreground/30',
    text: 'text-muted-foreground',
    chip: 'bg-muted text-muted-foreground/70 ring-border',
    badge:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700',
    rowTint: '',
  },
  warning: {
    solid: 'bg-warning',
    text: 'text-warning',
    chip: 'bg-amber-500/10 text-amber-600 ring-amber-500/25 dark:text-amber-400',
    badge:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
    rowTint: '',
  },
  info: {
    solid: 'bg-info',
    text: 'text-info',
    chip: 'bg-blue-500/10 text-blue-600 ring-blue-500/25 dark:text-blue-400',
    badge:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    rowTint: '',
  },
  success: {
    solid: 'bg-success',
    text: 'text-success',
    chip: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/25 dark:text-emerald-400',
    badge:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
    rowTint: '',
  },
  danger: {
    solid: 'bg-destructive',
    text: 'text-destructive',
    chip: 'bg-red-500/10 text-red-600 ring-red-500/25 dark:text-red-400',
    badge:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    rowTint: 'bg-destructive/[0.035]',
  },
}

/* ─── Estatus de solicitud ──────────────────────────────────────── */

export interface EstatusSolicitudToken {
  label: string
  tone: Tone
  icon: React.ElementType
}

export const ESTATUS_SOLICITUD: Record<EstatusSolicitud, EstatusSolicitudToken> = {
  BORRADOR: { label: 'Borrador', tone: 'neutral', icon: FileEdit },
  PENDIENTE: { label: 'Pendiente', tone: 'warning', icon: Clock },
  EN_REVISION: { label: 'En revisión', tone: 'info', icon: Search },
  EN_CORRECCION: { label: 'En corrección', tone: 'danger', icon: AlertTriangle },
  EN_APROBACION: { label: 'En aprobación', tone: 'info', icon: Gavel },
  EN_FINANCIAMIENTO: { label: 'En mesa de control', tone: 'info', icon: Banknote },
  EN_ASIGNACION: { label: 'Por asignar analista', tone: 'warning', icon: UserCog },
  EN_ANALISIS: { label: 'En análisis', tone: 'info', icon: Calculator },
  EN_VALIDACION: { label: 'En validación', tone: 'info', icon: ClipboardCheck },
  EN_COMITE: { label: 'En comité de crédito', tone: 'info', icon: Users },
  APROBADO: { label: 'Aprobado', tone: 'success', icon: CheckCircle2 },
  RECHAZADO: { label: 'Rechazado', tone: 'danger', icon: XCircle },
  CANCELADO: { label: 'Cancelado', tone: 'neutral', icon: XCircle },
}

export const estatusSolicitud = (estatus: string): EstatusSolicitudToken =>
  ESTATUS_SOLICITUD[estatus as EstatusSolicitud] ?? ESTATUS_SOLICITUD.BORRADOR

/* ─── Estatus de documento ──────────────────────────────────────── */

/** El dominio solo tiene PENDIENTE/APROBADO/RECHAZADO; la UI añade el
 *  estado sintético `NO_SUBIDO` para los tipos requeridos sin archivo. */
export type EstatusDocumentoUI = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'NO_SUBIDO'

export interface EstatusDocumentoToken {
  label: string
  tone: Tone
  icon: React.ElementType
}

export const ESTATUS_DOCUMENTO: Record<EstatusDocumentoUI, EstatusDocumentoToken> = {
  APROBADO: { label: 'Aprobado', tone: 'success', icon: CheckCircle2 },
  PENDIENTE: { label: 'En revisión', tone: 'warning', icon: Clock },
  RECHAZADO: { label: 'Rechazado', tone: 'danger', icon: XCircle },
  NO_SUBIDO: { label: 'Sin subir', tone: 'neutral', icon: Upload },
}

export const estatusDocumento = (estatus: string): EstatusDocumentoToken =>
  ESTATUS_DOCUMENTO[estatus as EstatusDocumentoUI] ?? ESTATUS_DOCUMENTO.NO_SUBIDO
