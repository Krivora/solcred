'use client'

import Link from 'next/link'
import { MessageSquare, Paperclip, RotateCcw, UserPlus } from 'lucide-react'
import { AvatarIniciales } from '@/shared/components/common/AvatarIniciales'
import { cn } from '@/shared/lib/cn'
import type { TicketFila, TicketPrioridad } from '@/features/soporte/types/soporte.types'
import { tiempoRelativo } from '@/features/soporte/lib/soporte.config'
import { PrioridadBadge, SlaChip } from './SoporteBadges'

const BARRA_PRIORIDAD: Record<TicketPrioridad, string> = {
  BAJA: 'bg-hairline',
  MEDIA: 'bg-info',
  ALTA: 'bg-warn',
  URGENTE: 'bg-danger',
}

interface Props {
  ticket: TicketFila
  arrastrable: boolean
  mostrarAsignar: boolean
  arrastrando: boolean
  onDragStart: () => void
  onDragEnd: () => void
  onAsignarClick: () => void
}

export function TicketKanbanCard({
  ticket: t,
  arrastrable,
  mostrarAsignar,
  arrastrando,
  onDragStart,
  onDragEnd,
  onAsignarClick,
}: Props) {
  const agente = t.agente ? `${t.agente.usuario.nombre} ${t.agente.usuario.apellidoPaterno}` : null

  return (
    <div
      draggable={arrastrable}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', t.id)
        e.dataTransfer.effectAllowed = 'move'
        onDragStart()
      }}
      onDragEnd={onDragEnd}
      className={cn(
        'group relative overflow-hidden rounded-lg border border-hairline bg-card shadow-sm transition-opacity',
        arrastrable && 'cursor-grab active:cursor-grabbing',
        arrastrando && 'opacity-40',
      )}
    >
      <span className={cn('absolute inset-y-0 left-0 w-1', BARRA_PRIORIDAD[t.prioridad])} aria-hidden />
      <Link href={`/dashboard/soporte/tickets/${t.id}`} className="block p-3 pl-4">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded bg-brand-surface px-1.5 py-0.5 font-mono text-caption font-medium text-brand-ink">
            {t.folio}
          </span>
          {t.reabierto && <RotateCcw className="size-3 shrink-0 text-warn-ink" />}
        </div>
        <p className="mt-1.5 line-clamp-2 text-sm font-medium text-ink group-hover:text-brand-ink">
          {t.titulo}
        </p>
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <PrioridadBadge prioridad={t.prioridad} />
          <SlaChip titulo="Resolución" estado={t.sla.resolucion} limiteIso={t.slaResolucionLimite} compacto />
        </div>
      </Link>
      <div className="flex items-center justify-between gap-2 border-t border-hairline px-3 py-2">
        {agente ? (
          <span className="flex min-w-0 items-center gap-1.5 text-caption text-ink-muted">
            <AvatarIniciales nombre={agente} tamano="xs" tono="muted" />
            <span className="truncate">{agente}</span>
          </span>
        ) : mostrarAsignar ? (
          <button
            type="button"
            onClick={onAsignarClick}
            className="inline-flex items-center gap-1 text-caption text-ink-subtle transition-colors hover:text-brand-ink"
          >
            <UserPlus className="size-3" /> Asignar
          </button>
        ) : (
          <span className="text-caption italic text-ink-subtle">Sin asignar</span>
        )}
        <div className="flex shrink-0 items-center gap-2 text-caption text-ink-subtle">
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="size-3" />
            {t._count.comentarios}
          </span>
          {t._count.adjuntos > 0 && (
            <span className="inline-flex items-center gap-1">
              <Paperclip className="size-3" />
              {t._count.adjuntos}
            </span>
          )}
          <span className="tabular-nums">{tiempoRelativo(t.actualizadoEn)}</span>
        </div>
      </div>
      {mostrarAsignar && agente && (
        <button
          type="button"
          onClick={onAsignarClick}
          className="absolute right-2 top-2 hidden rounded-md bg-surface p-1 text-ink-subtle opacity-0 shadow-sm transition-opacity group-hover:opacity-100 sm:block"
          title="Reasignar"
        >
          <UserPlus className="size-3.5" />
        </button>
      )}
    </div>
  )
}
