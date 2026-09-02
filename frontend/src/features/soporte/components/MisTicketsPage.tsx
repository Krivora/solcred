'use client'

import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { TICKET_ESTATUS_VALUES } from '@/shared/types/domain.enums'
import { ESTATUS_TICKET } from '@/features/soporte/lib/soporte.config'
import { useMisTickets } from '@/features/soporte/hooks/useSoporteQueries'
import type { FiltrosMisTickets, TicketEstatus } from '@/features/soporte/types/soporte.types'
import { TicketsTable } from './TicketsTable'
import { NuevoTicketDialog } from './NuevoTicketDialog'

export function MisTicketsPage() {
  const [filtros, setFiltros] = useState<FiltrosMisTickets>({ page: 1 })
  const [busqueda, setBusqueda] = useState('')
  const [dialogAbierto, setDialogAbierto] = useState(false)

  const { data, isLoading, isFetching } = useMisTickets(filtros)

  const aplicarBusqueda = (e: React.FormEvent) => {
    e.preventDefault()
    setFiltros((f) => ({ ...f, q: busqueda.trim() || undefined, page: 1 }))
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Mis Tickets"
        description="Tus solicitudes de soporte y su seguimiento."
        action={{
          label: 'Nuevo ticket',
          onClick: () => setDialogAbierto(true),
          icon: <Plus className="size-4" />,
        }}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <form onSubmit={aplicarBusqueda} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por folio o título…"
            className="pl-9"
          />
        </form>
        <Select
          value={filtros.estatus ?? 'TODOS'}
          onValueChange={(v) =>
            setFiltros((f) => ({ ...f, estatus: v === 'TODOS' ? undefined : (v as TicketEstatus), page: 1 }))
          }
        >
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Estatus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos los estatus</SelectItem>
            {TICKET_ESTATUS_VALUES.map((e) => (
              <SelectItem key={e} value={e}>
                {ESTATUS_TICKET[e].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <TicketsTable
        tickets={data?.data ?? []}
        meta={data?.pagination}
        onPaginar={(page) => setFiltros((f) => ({ ...f, page }))}
        cargando={isLoading || (isFetching && !data)}
        modo="mios"
        vacio={{
          titulo: 'Aún no tienes tickets',
          descripcion: 'Crea uno cuando necesites ayuda del equipo de soporte.',
        }}
      />

      <NuevoTicketDialog open={dialogAbierto} onOpenChange={setDialogAbierto} />
    </div>
  )
}
