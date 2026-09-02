import {
  Circle,
  UserPlus,
  RefreshCw,
  ArrowRightLeft,
  Flag,
  Tag,
  MessageSquare,
  Lock,
  Paperclip,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { tiempoRelativo } from '@/features/soporte/lib/soporte.config'
import type { EventoTicket, TicketTipoEvento } from '@/features/soporte/types/soporte.types'

const ICONO: Record<TicketTipoEvento, React.ElementType> = {
  CREADO: Circle,
  ASIGNADO: UserPlus,
  REASIGNADO: RefreshCw,
  CAMBIO_ESTATUS: ArrowRightLeft,
  CAMBIO_PRIORIDAD: Flag,
  CAMBIO_CATEGORIA: Tag,
  COMENTARIO: MessageSquare,
  NOTA_INTERNA: Lock,
  ADJUNTO: Paperclip,
  SLA_INCUMPLIDO: AlertTriangle,
  REABIERTO: RotateCcw,
  CERRADO: CheckCircle2,
  CANCELADO: XCircle,
}

export function TicketTimeline({ eventos }: { eventos: EventoTicket[] }) {
  if (eventos.length === 0) return null

  const lista = [...eventos].reverse()

  return (
    <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[9px] before:top-2 before:w-px before:bg-border/70">
      {lista.map((ev) => {
        const Icon = ICONO[ev.tipo] ?? Circle
        const critico = ev.tipo === 'SLA_INCUMPLIDO'
        return (
          <li key={ev.id} className="relative flex gap-2.5">
            <div
              className={`z-10 mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${
                critico
                  ? 'border-destructive/30 bg-destructive/10 text-destructive'
                  : 'border-border bg-card text-muted-foreground'
              }`}
            >
              <Icon className="size-3" />
            </div>
            <div className="min-w-0 flex-1 pb-0.5">
              <p className={`text-xs leading-snug ${critico ? 'font-medium text-destructive' : 'text-foreground'}`}>
                {ev.descripcion}
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {ev.actor ? `${ev.actor.nombre} ${ev.actor.apellidoPaterno} · ` : 'Sistema · '}
                {tiempoRelativo(ev.creadoEn)}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
