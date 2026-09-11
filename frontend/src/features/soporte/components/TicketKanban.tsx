'use client'

import { useMemo, useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { ESTATUS_TICKET } from '@/features/soporte/lib/soporte.config'
import { useMoverTicketEstatus, useAsignarTicketKanban } from '@/features/soporte/hooks/useAccionesTicket'
import type { TicketEstatus, TicketFila } from '@/features/soporte/types/soporte.types'
import { TicketKanbanCard } from './TicketKanbanCard'
import { AsignarAgenteSheet } from './AsignarAgenteSheet'
import { Skeleton } from '@/shared/components/ui/skeleton'

/** Columnas activas del tablero — cerrados/cancelados no participan del flujo de trabajo diario. */
const COLUMNAS: TicketEstatus[] = ['NUEVO', 'ASIGNADO', 'EN_PROGRESO', 'ESPERANDO_CLIENTE', 'RESUELTO']

/**
 * Transiciones que el arrastre resuelve con un PATCH directo de estatus — espejo de
 * `TRANSICIONES_AGENTE` en el backend. NUEVO→ASIGNADO no está aquí: requiere elegir
 * agente, así que se resuelve abriendo el sheet de asignación en vez de un PATCH ciego.
 */
const TRANSICIONES_DIRECTAS: Partial<Record<TicketEstatus, TicketEstatus[]>> = {
  ASIGNADO: ['EN_PROGRESO'],
  EN_PROGRESO: ['ESPERANDO_CLIENTE', 'RESUELTO'],
  ESPERANDO_CLIENTE: ['EN_PROGRESO', 'RESUELTO'],
}

interface Props {
  tickets: TicketFila[]
  cargando: boolean
  soloLectura: boolean
}

export function TicketKanban({ tickets, cargando, soloLectura }: Props) {
  const [arrastrando, setArrastrando] = useState<{ id: string; estatus: TicketEstatus } | null>(null)
  const [columnaHover, setColumnaHover] = useState<TicketEstatus | null>(null)
  const [ticketParaAsignar, setTicketParaAsignar] = useState<TicketFila | null>(null)

  const moverEstatus = useMoverTicketEstatus()
  const asignar = useAsignarTicketKanban()

  const columnas = useMemo(() => {
    const map = new Map<TicketEstatus, TicketFila[]>(COLUMNAS.map((e) => [e, []]))
    for (const t of tickets) map.get(t.estatus)?.push(t)
    return map
  }, [tickets])

  const esDestinoValido = (destino: TicketEstatus): boolean => {
    if (!arrastrando || soloLectura) return false
    if (arrastrando.estatus === destino) return false
    if (arrastrando.estatus === 'NUEVO') return destino === 'ASIGNADO'
    return TRANSICIONES_DIRECTAS[arrastrando.estatus]?.includes(destino) ?? false
  }

  const soltar = (destino: TicketEstatus) => {
    if (!arrastrando || !esDestinoValido(destino)) return
    const ticket = tickets.find((t) => t.id === arrastrando.id)
    if (!ticket) return
    if (arrastrando.estatus === 'NUEVO' && destino === 'ASIGNADO') {
      setTicketParaAsignar(ticket)
    } else {
      moverEstatus.mutate({ id: ticket.id, estatus: destino })
    }
  }

  if (cargando) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {COLUMNAS.map((e) => (
          <Skeleton key={e} className="h-72 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 overflow-x-auto sm:grid-cols-2 lg:grid-cols-5">
        {COLUMNAS.map((estatus) => {
          const lista = columnas.get(estatus) ?? []
          const cfg = ESTATUS_TICKET[estatus]
          const esHover = columnaHover === estatus && esDestinoValido(estatus)

          return (
            <div
              key={estatus}
              onDragOver={(e) => {
                if (esDestinoValido(estatus)) e.preventDefault()
              }}
              onDragEnter={() => setColumnaHover(estatus)}
              onDragLeave={() => setColumnaHover((c) => (c === estatus ? null : c))}
              onDrop={(e) => {
                e.preventDefault()
                setColumnaHover(null)
                soltar(estatus)
              }}
              className={cn(
                'flex min-h-40 flex-col rounded-xl border bg-surface-sunken/40 transition-colors',
                esHover ? 'border-brand/40 bg-brand-surface/40' : 'border-hairline',
              )}
            >
              <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                <span className="flex items-center gap-1.5 text-label font-medium uppercase tracking-wide text-ink-muted">
                  {cfg.icon && <cfg.icon className="size-3.5" />}
                  {cfg.label}
                </span>
                <span className="rounded-full bg-surface px-1.5 py-0.5 text-caption font-medium tabular-nums text-ink-subtle">
                  {lista.length}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2 px-2 pb-2">
                {lista.length === 0 ? (
                  <p className="px-2 py-6 text-center text-caption text-ink-subtle">Sin tickets</p>
                ) : (
                  lista.map((t) => (
                    <TicketKanbanCard
                      key={t.id}
                      ticket={t}
                      arrastrable={!soloLectura && (estatus === 'NUEVO' || estatus === 'ASIGNADO' || estatus === 'EN_PROGRESO' || estatus === 'ESPERANDO_CLIENTE')}
                      mostrarAsignar={!soloLectura && (estatus === 'NUEVO' || estatus === 'ASIGNADO')}
                      arrastrando={arrastrando?.id === t.id}
                      onDragStart={() => setArrastrando({ id: t.id, estatus: t.estatus })}
                      onDragEnd={() => setArrastrando(null)}
                      onAsignarClick={() => setTicketParaAsignar(t)}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {ticketParaAsignar && (
        <AsignarAgenteSheet
          open
          onOpenChange={(v) => !v && setTicketParaAsignar(null)}
          prioridadActual={ticketParaAsignar.prioridad}
          agenteActualId={ticketParaAsignar.agenteId ?? undefined}
          yaAsignado={!!ticketParaAsignar.agente}
          asignando={asignar.isPending}
          onConfirmar={(agenteId, prioridad) => {
            asignar.mutate(
              { id: ticketParaAsignar.id, agenteId, prioridad },
              { onSuccess: () => setTicketParaAsignar(null) },
            )
          }}
        />
      )}
    </>
  )
}
