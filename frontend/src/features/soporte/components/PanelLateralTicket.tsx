'use client'

import { CalendarClock, CheckCircle2, Clock3, Flag } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Separator } from '@/shared/components/ui/separator'
import { AvatarIniciales } from '@/shared/components/common/AvatarIniciales'
import {
  TICKET_PRIORIDAD_VALUES,
  TICKET_CATEGORIA_VALUES,
} from '@/shared/types/domain.enums'
import {
  PRIORIDAD_TICKET,
  CATEGORIA_TICKET,
} from '@/features/soporte/lib/soporte.config'
import type {
  TicketCategoria,
  TicketDetalle,
  TicketPrioridad,
} from '@/features/soporte/types/soporte.types'
import { SlaChip, PrioridadBadge, CategoriaBadge } from './SoporteBadges'
import { AdjuntoView } from './AdjuntoView'
import { TicketTimeline } from './TicketTimeline'

const fmtFecha = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' }) : '—'

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  )
}

interface Props {
  ticket: TicketDetalle
  esStaff: boolean
  onPrioridad: (p: TicketPrioridad) => void
  onCategoria: (c: TicketCategoria) => void
  mutando: boolean
}

export function PanelLateralTicket({ ticket, esStaff, onPrioridad, onCategoria, mutando }: Props) {
  return (
    <div className="space-y-5 rounded-xl border border-border/60 bg-card p-4 shadow-sm">
      <Campo label="Solicitante">
        <div className="flex items-center gap-2.5">
          <AvatarIniciales
            nombre={`${ticket.solicitante.nombre} ${ticket.solicitante.apellidoPaterno}`}
            tamano="md"
          />
          <div className="min-w-0">
            <p className="truncate font-medium">
              {ticket.solicitante.nombre} {ticket.solicitante.apellidoPaterno}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">{ticket.solicitante.correo}</p>
          </div>
        </div>
      </Campo>

      <Campo label="Agente asignado">
        {ticket.agente ? (
          <div className="flex items-center gap-2.5">
            <AvatarIniciales
              nombre={`${ticket.agente.usuario.nombre} ${ticket.agente.usuario.apellidoPaterno}`}
              tamano="md"
              tono="primary"
            />
            <p className="truncate font-medium">
              {ticket.agente.usuario.nombre} {ticket.agente.usuario.apellidoPaterno}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <span className="flex size-9 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground/60">
              <Flag className="size-4" />
            </span>
            <span className="italic">Sin asignar</span>
          </div>
        )}
      </Campo>

      <Separator />

      <Campo label="Prioridad">
        {esStaff ? (
          <Select value={ticket.prioridad} onValueChange={(v) => onPrioridad(v as TicketPrioridad)} disabled={mutando}>
            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TICKET_PRIORIDAD_VALUES.map((p) => (
                <SelectItem key={p} value={p}>{PRIORIDAD_TICKET[p].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <PrioridadBadge prioridad={ticket.prioridad} />
        )}
      </Campo>

      <Campo label="Categoría">
        {esStaff ? (
          <Select value={ticket.categoria} onValueChange={(v) => onCategoria(v as TicketCategoria)} disabled={mutando}>
            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TICKET_CATEGORIA_VALUES.map((c) => (
                <SelectItem key={c} value={c}>{CATEGORIA_TICKET[c]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <CategoriaBadge categoria={ticket.categoria} />
        )}
      </Campo>

      <Separator />

      <Campo label="SLA">
        <div className="flex flex-col gap-1.5">
          <SlaChip titulo="1ª respuesta" estado={ticket.sla.respuesta} limiteIso={ticket.slaRespuestaLimite} />
          <SlaChip titulo="Resolución" estado={ticket.sla.resolucion} limiteIso={ticket.slaResolucionLimite} />
        </div>
      </Campo>

      <Campo label="Fechas">
        <ul className="space-y-2 text-xs">
          <li className="flex items-center gap-2 text-muted-foreground">
            <CalendarClock className="size-3.5 shrink-0 text-muted-foreground/70" />
            <span className="text-foreground">Creado</span>
            <span className="ml-auto tabular-nums">{fmtFecha(ticket.creadoEn)}</span>
          </li>
          {ticket.primeraRespuestaEn && (
            <li className="flex items-center gap-2 text-muted-foreground">
              <Clock3 className="size-3.5 shrink-0 text-muted-foreground/70" />
              <span className="text-foreground">1ª respuesta</span>
              <span className="ml-auto tabular-nums">{fmtFecha(ticket.primeraRespuestaEn)}</span>
            </li>
          )}
          {ticket.resueltoEn && (
            <li className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="size-3.5 shrink-0 text-ok-ink" />
              <span className="text-foreground">Resuelto</span>
              <span className="ml-auto tabular-nums">{fmtFecha(ticket.resueltoEn)}</span>
            </li>
          )}
          {ticket.cerradoEn && (
            <li className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="size-3.5 shrink-0 text-muted-foreground/70" />
              <span className="text-foreground">Cerrado</span>
              <span className="ml-auto tabular-nums">{fmtFecha(ticket.cerradoEn)}</span>
            </li>
          )}
        </ul>
      </Campo>

      {ticket.adjuntos.length > 0 && (
        <>
          <Separator />
          <Campo label={`Adjuntos (${ticket.adjuntos.length})`}>
            <div className="flex flex-wrap gap-2">
              {ticket.adjuntos.map((a) => (
                <AdjuntoView key={a.id} ticketId={ticket.id} adjunto={a} />
              ))}
            </div>
          </Campo>
        </>
      )}

      {ticket.eventos.length > 0 && (
        <>
          <Separator />
          <Campo label="Historial">
            <div className="pt-1">
              <TicketTimeline eventos={ticket.eventos} />
            </div>
          </Campo>
        </>
      )}
    </div>
  )
}
