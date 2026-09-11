import { Clock } from 'lucide-react'
import { StatusChip } from '@/shared/components/ui/status-chip'
import { Tag } from '@/shared/components/ui/tag'
import { cn } from '@/shared/lib/cn'
import {
  ESTATUS_TICKET,
  PRIORIDAD_TICKET,
  CATEGORIA_TICKET,
  ESTADO_SLA,
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
    <StatusChip tone={s.tono} icon={s.icon} className={s.className}>
      {s.label}
    </StatusChip>
  )
}

export function PrioridadBadge({ prioridad }: { prioridad: TicketPrioridad }) {
  const s = PRIORIDAD_TICKET[prioridad]
  return <StatusChip tone={s.tono}>{s.label}</StatusChip>
}

export function CategoriaBadge({ categoria }: { categoria: TicketCategoria }) {
  return <Tag>{CATEGORIA_TICKET[categoria]}</Tag>
}

interface SlaChipProps {
  titulo: string
  estado: EstadoSla
  limiteIso?: string | null
  compacto?: boolean
}

/** Chip de SLA: estado (ok/ámbar/rojo) + cuenta regresiva opcional. */
export function SlaChip({ titulo, estado, limiteIso, compacto }: SlaChipProps) {
  const info = ESTADO_SLA[estado]
  if (estado === 'sin_iniciar' && compacto) return null

  return (
    <StatusChip
      tone={info.tono}
      icon={Clock}
      className={cn('rounded-md border-0', compacto && 'gap-1')}
      title={`${titulo}: ${info.label}`}
    >
      {!compacto && <span className="opacity-70">{titulo}</span>}
      {estado === 'en_curso' || estado === 'en_riesgo'
        ? formatearCuentaRegresiva(limiteIso ?? null)
        : info.label}
    </StatusChip>
  )
}
