'use client'

import Link from 'next/link'
import { MessageSquare, Paperclip, RotateCcw, Inbox, ChevronRight } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { AvatarIniciales } from '@/shared/components/common/AvatarIniciales'
import { Paginacion } from '@/shared/components/common/Paginacion'
import { cn } from '@/shared/lib/cn'
import type { PaginacionData } from '@/shared/types/api'
import type { TicketFila, TicketPrioridad } from '@/features/soporte/types/soporte.types'
import { tiempoRelativo } from '@/features/soporte/lib/soporte.config'
import { EstatusBadge, PrioridadBadge, CategoriaBadge, SlaChip } from './SoporteBadges'

interface Props {
  tickets: TicketFila[]
  meta?: PaginacionData
  onPaginar: (page: number) => void
  cargando: boolean
  modo: 'mios' | 'staff'
  vacio: { titulo: string; descripcion: string }
}

/** Franja de color a la izquierda de la fila según prioridad. */
const BARRA_PRIORIDAD: Record<TicketPrioridad, string> = {
  BAJA: 'bg-border',
  MEDIA: 'bg-sky-500/60',
  ALTA: 'bg-amber-500/70',
  URGENTE: 'bg-destructive',
}

const TH = 'text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70'

export function TicketsTable({ tickets, meta, onPaginar, cargando, modo, vacio }: Props) {
  const staff = modo === 'staff'
  const cols = staff ? 7 : 6

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-border/60 bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className={cn(TH, 'pl-5')}>Ticket</TableHead>
              {staff && <TableHead className={TH}>Solicitante</TableHead>}
              <TableHead className={TH}>Categoría</TableHead>
              <TableHead className={TH}>Prioridad</TableHead>
              <TableHead className={TH}>Estatus</TableHead>
              <TableHead className={TH}>{staff ? 'SLA / Agente' : 'SLA'}</TableHead>
              <TableHead className={cn(TH, 'text-right pr-5')}>Actividad</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cargando ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: cols }).map((__, j) => (
                    <TableCell key={j} className="py-3.5">
                      <Skeleton className="h-4 w-full max-w-[140px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={cols} className="py-16 text-center">
                  <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full bg-muted">
                    <Inbox className="size-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">{vacio.titulo}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{vacio.descripcion}</p>
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((t) => {
                const solicitante = t.solicitante
                  ? `${t.solicitante.nombre} ${t.solicitante.apellidoPaterno}`
                  : null
                const agente = t.agente
                  ? `${t.agente.usuario.nombre} ${t.agente.usuario.apellidoPaterno}`
                  : null
                return (
                  <TableRow
                    key={t.id}
                    className="group relative border-b border-border/40 transition-colors hover:bg-accent/40"
                  >
                    <TableCell className="relative py-3.5 pl-5">
                      <span
                        className={cn(
                          'absolute inset-y-0 left-0 w-1 rounded-r',
                          BARRA_PRIORIDAD[t.prioridad],
                        )}
                        aria-hidden
                      />
                      <Link href={`/dashboard/soporte/tickets/${t.id}`} className="block">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary">
                            {t.folio}
                          </span>
                          {t.reabierto && (
                            <span className="inline-flex items-center gap-0.5 rounded bg-amber-500/10 px-1 py-0.5 text-[9px] font-medium text-amber-600 dark:text-amber-400">
                              <RotateCcw className="size-2.5" /> Reabierto
                            </span>
                          )}
                        </div>
                        <p className="mt-1 line-clamp-1 max-w-[280px] text-sm font-medium text-foreground group-hover:text-primary">
                          {t.titulo}
                        </p>
                      </Link>
                    </TableCell>
                    {staff && (
                      <TableCell className="py-3.5">
                        {solicitante ? (
                          <div className="flex items-center gap-2">
                            <AvatarIniciales nombre={solicitante} tamano="xs" />
                            <span className="truncate text-xs text-foreground">{solicitante}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell className="py-3.5">
                      <CategoriaBadge categoria={t.categoria} />
                    </TableCell>
                    <TableCell className="py-3.5">
                      <PrioridadBadge prioridad={t.prioridad} />
                    </TableCell>
                    <TableCell className="py-3.5">
                      <EstatusBadge estatus={t.estatus} />
                    </TableCell>
                    <TableCell className="py-3.5">
                      <div className="flex flex-col items-start gap-1.5">
                        <SlaChip
                          titulo="Resolución"
                          estado={t.sla.resolucion}
                          limiteIso={t.slaResolucionLimite}
                          compacto
                        />
                        {staff &&
                          (agente ? (
                            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                              <AvatarIniciales nombre={agente} tamano="xs" tono="muted" />
                              {agente}
                            </span>
                          ) : (
                            <span className="text-[11px] italic text-muted-foreground/70">Sin asignar</span>
                          ))}
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-2.5 text-[11px] text-muted-foreground">
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
                        <ChevronRight className="size-3.5 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
      {meta && meta.totalPages > 1 && <Paginacion meta={meta} onPaginar={onPaginar} />}
    </div>
  )
}
