'use client'

import { useState } from 'react'
import { Search, AlertTriangle, Inbox, Layers } from 'lucide-react'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { cn } from '@/shared/lib/cn'
import {
  TICKET_ESTATUS_VALUES,
  TICKET_PRIORIDAD_VALUES,
} from '@/shared/types/domain.enums'
import { ESTATUS_TICKET, PRIORIDAD_TICKET } from '@/features/soporte/lib/soporte.config'
import { useTicketsListado, useSoporteStats, useAgentesSoporte } from '@/features/soporte/hooks/useSoporteQueries'
import type {
  FiltrosTickets,
  TicketEstatus,
  TicketPrioridad,
} from '@/features/soporte/types/soporte.types'
import { TicketsTable } from './TicketsTable'

function TileMetrica({
  label,
  valor,
  icon,
  tono,
}: {
  label: string
  valor: number
  icon: React.ReactNode
  tono: 'muted' | 'warn' | 'crit'
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3.5 rounded-lg border px-4 py-3.5 transition-colors',
        tono === 'crit' && 'border-danger/20 bg-danger-surface',
        tono === 'warn' && 'border-warn/20 bg-warn-surface',
        tono === 'muted' && 'border-hairline bg-card',
      )}
    >
      <div
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-lg',
          tono === 'crit' && 'bg-danger/10 text-danger-ink',
          tono === 'warn' && 'bg-warn/10 text-warn-ink',
          tono === 'muted' && 'bg-surface-sunken text-ink-muted',
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-title leading-none tabular-nums text-ink">{valor}</p>
        <p className="mt-1.5 text-label uppercase tracking-wide text-ink-subtle">{label}</p>
      </div>
    </div>
  )
}

export function TicketsListPage() {
  const [filtros, setFiltros] = useState<FiltrosTickets>({ page: 1 })
  const [busqueda, setBusqueda] = useState('')

  const { data, isLoading, isFetching } = useTicketsListado(filtros)
  const { data: stats } = useSoporteStats()
  const { data: agentes } = useAgentesSoporte()

  const set = (parcial: Partial<FiltrosTickets>) =>
    setFiltros((f) => ({ ...f, ...parcial, page: 1 }))

  return (
    <div className="space-y-5">
      <PageHeader
        title="Tickets"
        description="Todos los tickets de soporte del sistema."
      />

      {stats && (
        <div className="grid gap-3 sm:grid-cols-3">
          <TileMetrica label="Sin asignar" valor={stats.sinAsignar} icon={<Inbox className="size-4" />} tono="muted" />
          <TileMetrica label="SLA por vencer" valor={stats.slaEnRiesgo} icon={<AlertTriangle className="size-4" />} tono="warn" />
          <TileMetrica label="SLA vencido" valor={stats.slaVencido} icon={<AlertTriangle className="size-4" />} tono="crit" />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <form
          onSubmit={(e) => { e.preventDefault(); set({ q: busqueda.trim() || undefined }) }}
          className="relative min-w-[220px] flex-1"
        >
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Folio, título o correo del solicitante…"
            className="pl-9"
          />
        </form>

        <Select value={filtros.estatus ?? 'TODOS'} onValueChange={(v) => set({ estatus: v === 'TODOS' ? undefined : (v as TicketEstatus) })}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Estatus" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todo estatus</SelectItem>
            {TICKET_ESTATUS_VALUES.map((e) => (
              <SelectItem key={e} value={e}>{ESTATUS_TICKET[e].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filtros.prioridad ?? 'TODAS'} onValueChange={(v) => set({ prioridad: v === 'TODAS' ? undefined : (v as TicketPrioridad) })}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Prioridad" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="TODAS">Toda prioridad</SelectItem>
            {TICKET_PRIORIDAD_VALUES.map((p) => (
              <SelectItem key={p} value={p}>{PRIORIDAD_TICKET[p].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filtros.sinAsignar ? 'SIN' : (filtros.agenteId ?? 'TODOS')}
          onValueChange={(v) =>
            set(v === 'SIN' ? { sinAsignar: true, agenteId: undefined } : { sinAsignar: undefined, agenteId: v === 'TODOS' ? undefined : v })
          }
        >
          <SelectTrigger className="w-44"><SelectValue placeholder="Agente" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todo agente</SelectItem>
            <SelectItem value="SIN">Sin asignar</SelectItem>
            {(agentes ?? []).map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filtros.sla ?? 'TODOS'} onValueChange={(v) => set({ sla: v === 'TODOS' ? undefined : (v as FiltrosTickets['sla']) })}>
          <SelectTrigger className="w-36"><SelectValue placeholder="SLA" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todo SLA</SelectItem>
            <SelectItem value="en_riesgo">Por vencer</SelectItem>
            <SelectItem value="vencido">Vencido</SelectItem>
            <SelectItem value="ok">En tiempo</SelectItem>
          </SelectContent>
        </Select>

        {(filtros.estatus || filtros.prioridad || filtros.agenteId || filtros.sinAsignar || filtros.sla || filtros.q) && (
          <button
            type="button"
            onClick={() => { setBusqueda(''); setFiltros({ page: 1 }) }}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Layers className="size-3" /> Limpiar
          </button>
        )}
      </div>

      <TicketsTable
        tickets={data?.data ?? []}
        meta={data?.pagination}
        onPaginar={(page) => setFiltros((f) => ({ ...f, page }))}
        cargando={isLoading || (isFetching && !data)}
        modo="staff"
        vacio={{ titulo: 'Sin tickets', descripcion: 'Ningún ticket coincide con estos filtros.' }}
      />
    </div>
  )
}
