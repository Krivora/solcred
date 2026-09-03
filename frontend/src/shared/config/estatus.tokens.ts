/**
 * Fuente única de estilo para estatus de solicitud y de documento.
 *
 * Antes había cuatro mapas de color divergentes (`ESTATUS_CONFIG` en
 * `features/solicitudes`, `ESTATUS_STYLES` en `shared/config`, y los objetos
 * `config` / `ESTATUS_META` dentro de `features/expediente`). Este módulo los
 * reemplaza: cada estatus se resuelve a un **tono** semántico y cada tono
 * expone un paquete de clases theme-aware.
 *
 * Desde Fase 1 del rediseño, todos los paquetes se apoyan en el trío de tokens
 * de cada estado (`--ok` / `--ok-ink` / `--ok-surface`, etc.), que ya se
 * invierten en `.dark`. Sin colores Tailwind hardcodeados: una sola receta.
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
    solid: 'bg-ink-subtle',
    text: 'text-ink-muted',
    chip: 'bg-surface-sunken text-ink-muted ring-hairline',
    badge: 'bg-surface-sunken text-ink-muted border-hairline',
    rowTint: '',
  },
  warning: {
    solid: 'bg-warn',
    text: 'text-warn-ink',
    chip: 'bg-warn-surface text-warn-ink ring-warn/20',
    badge: 'bg-warn-surface text-warn-ink border-warn/25',
    rowTint: '',
  },
  info: {
    solid: 'bg-info',
    text: 'text-info-ink',
    chip: 'bg-info-surface text-info-ink ring-info/20',
    badge: 'bg-info-surface text-info-ink border-info/25',
    rowTint: '',
  },
  success: {
    solid: 'bg-ok',
    text: 'text-ok-ink',
    chip: 'bg-ok-surface text-ok-ink ring-ok/20',
    badge: 'bg-ok-surface text-ok-ink border-ok/25',
    rowTint: '',
  },
  danger: {
    solid: 'bg-danger',
    text: 'text-danger-ink',
    chip: 'bg-danger-surface text-danger-ink ring-danger/20',
    badge: 'bg-danger-surface text-danger-ink border-danger/25',
    rowTint: 'bg-danger/[0.04]',
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
