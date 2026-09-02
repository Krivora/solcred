import { AlertTriangle, Clock } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/shared/lib/cn'
import {
  ESTATUS_TICKET,
  PRIORIDAD_TICKET,
  CATEGORIA_TICKET,
  ESTADO_SLA,
  TONO_CLASS,
  formatearCuentaRegresiva,
} from '@/features/soporte/lib/soporte.config'
import type {
  EstadoSla,
  TicketCategoria,
  TicketEstatus,
  TicketPrioridad,
} from '@/features/soporte/types/soporte.types'

export function EstatusBadge({ estatus }: { estatus: TicketEstatus }) {
  const s = ESTATUS_TICKET[estatus]
  return (
    <Badge variant="outline" className={cn('font-medium', s.className)}>
      {s.label}
    </Badge>
  )
}

export function PrioridadBadge({ prioridad }: { prioridad: TicketPrioridad }) {
  const s = PRIORIDAD_TICKET[prioridad]
  return (
    <Badge variant="outline" className={cn('gap-1 font-medium', s.className)}>
      {prioridad === 'URGENTE' && <AlertTriangle className="size-3" />}
      {s.label}
    </Badge>
  )
}

export function CategoriaBadge({ categoria }: { categoria: TicketCategoria }) {
  return (
    <Badge
      variant="outline"
      className="border-transparent bg-accent font-medium text-accent-foreground"
    >
      {CATEGORIA_TICKET[categoria]}
    </Badge>
  )
}

interface SlaChipProps {
  titulo: string
  estado: EstadoSla
  limiteIso?: string | null
  compacto?: boolean
}

/** Chip de SLA: estado (verde/ámbar/rojo) + cuenta regresiva opcional. */
export function SlaChip({ titulo, estado, limiteIso, compacto }: SlaChipProps) {
  const info = ESTADO_SLA[estado]
  if (estado === 'sin_iniciar' && compacto) return null

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap',
        TONO_CLASS[info.tono],
      )}
      title={`${titulo}: ${info.label}`}
    >
      <Clock className="size-3 shrink-0" />
      {!compacto && <span className="opacity-70">{titulo}</span>}
      {estado === 'en_curso' || estado === 'en_riesgo'
        ? formatearCuentaRegresiva(limiteIso ?? null)
        : info.label}
    </span>
  )
}
