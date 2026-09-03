'use client'

import { Lock, MessageSquareText } from 'lucide-react'
import { AvatarIniciales } from '@/shared/components/common/AvatarIniciales'
import { cn } from '@/shared/lib/cn'
import { tiempoRelativo } from '@/features/soporte/lib/soporte.config'
import type { ComentarioTicket, TicketDetalle } from '@/features/soporte/types/soporte.types'
import { AdjuntoView } from './AdjuntoView'

const fmtFechaLarga = (iso: string) =>
  new Date(iso).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })

function Burbuja({
  ticketId,
  autorNombre,
  fecha,
  cuerpo,
  esAgente,
  esNotaInterna,
  editado,
  adjuntos,
  destacado,
}: {
  ticketId: string
  autorNombre: string
  fecha: string
  cuerpo: string
  esAgente: boolean
  esNotaInterna?: boolean
  editado?: boolean
  adjuntos?: ComentarioTicket['adjuntos']
  destacado?: boolean
}) {
  return (
    <div className={cn('flex gap-3', esAgente && 'flex-row-reverse')}>
      <AvatarIniciales
        nombre={autorNombre}
        tamano="sm"
        tono={esAgente ? 'primary' : 'auto'}
        className="mt-0.5"
      />
      <div className={cn('flex min-w-0 max-w-[82%] flex-col gap-1', esAgente && 'items-end')}>
        <div className={cn('flex items-center gap-1.5 text-caption text-ink-subtle', esAgente && 'flex-row-reverse')}>
          <span className="font-medium text-ink">{autorNombre}</span>
          <span aria-hidden>·</span>
          <span title={fmtFechaLarga(fecha)}>{tiempoRelativo(fecha)}</span>
          {editado && <span className="italic">· editado</span>}
        </div>
        <div
          className={cn(
            'whitespace-pre-wrap break-words rounded-2xl border px-3.5 py-2.5 text-sm leading-relaxed',
            esAgente ? 'rounded-tr-sm' : 'rounded-tl-sm',
            esNotaInterna
              ? 'border-warn/25 bg-warn-surface text-ink'
              : destacado
                ? 'border-brand/20 bg-brand-surface text-ink'
                : esAgente
                  ? 'border-brand/20 bg-brand-surface text-ink'
                  : 'border-hairline bg-surface-sunken text-ink',
          )}
        >
          {esNotaInterna && (
            <span className="mb-1.5 flex items-center gap-1 text-caption font-medium uppercase tracking-wide text-warn-ink">
              <Lock className="size-3" /> Nota interna · solo el equipo
            </span>
          )}
          {destacado && !esNotaInterna && (
            <span className="mb-1.5 flex items-center gap-1 text-caption font-medium uppercase tracking-wide text-brand-ink">
              <MessageSquareText className="size-3" /> Solicitud original
            </span>
          )}
          {cuerpo}
        </div>
        {adjuntos && adjuntos.length > 0 && (
          <div className={cn('flex flex-wrap gap-2 pt-1', esAgente && 'justify-end')}>
            {adjuntos.map((a) => (
              <AdjuntoView key={a.id} ticketId={ticketId} adjunto={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function ConversacionHilo({ ticket }: { ticket: TicketDetalle }) {
  const nombreSolicitante = `${ticket.solicitante.nombre} ${ticket.solicitante.apellidoPaterno}`
  const total = ticket.comentarios.length + 1

  return (
    <div className="rounded-xl border border-border/60 bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
        <MessageSquareText className="size-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">Conversación</h2>
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
          {total}
        </span>
      </div>

      <div className="space-y-6 p-4 sm:p-5">
        <Burbuja
          ticketId={ticket.id}
          autorNombre={nombreSolicitante}
          fecha={ticket.creadoEn}
          cuerpo={ticket.descripcion}
          esAgente={false}
          adjuntos={ticket.adjuntos}
          destacado
        />

        {ticket.comentarios.length > 0 && (
          <div className="relative flex items-center gap-3 py-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
            <span className="h-px flex-1 bg-border/60" />
            Respuestas
            <span className="h-px flex-1 bg-border/60" />
          </div>
        )}

        {ticket.comentarios.map((c) => (
          <Burbuja
            key={c.id}
            ticketId={ticket.id}
            autorNombre={`${c.autor.nombre} ${c.autor.apellidoPaterno}`}
            fecha={c.creadoEn}
            cuerpo={c.cuerpo}
            esAgente={c.autorTipo === 'AGENTE'}
            esNotaInterna={c.esNotaInterna}
            editado={!!c.editadoEn}
            adjuntos={c.adjuntos}
          />
        ))}
      </div>
    </div>
  )
}
