'use client'

import { useState } from 'react'
import { UserPlus, Ban } from 'lucide-react'
import { DropdownMenuItem, DropdownMenuSeparator } from '@/shared/components/ui/dropdown-menu'
import { SolicitudesTable } from '@/features/promocion/components/common/SolicitudesTable'
import type { SolicitudPromocion, PaginacionData } from '@/features/promocion/types/solicitud.types'
import { AsignarAnalistaDialog } from '@/features/financiamiento/components/AsignarAnalistaDialog'
import {
  AccionFinanciamientoDialog,
} from '@/features/financiamiento/components/AccionFinanciamientoDialog'
import { useAccionesFinanciamiento } from '@/features/financiamiento/hooks/useAccionesFinanciamiento'
import { useAnalistas } from '@/features/financiamiento/hooks/useFinanciamientoListados'

interface Props {
  solicitudes: SolicitudPromocion[]
  meta: PaginacionData
  cargando: boolean
  onPaginar: (page: number) => void
  onRefresh: () => void
}

export function AsignacionFinanciamientoTable({ solicitudes, meta, cargando, onPaginar, onRefresh }: Props) {
  const { analistas } = useAnalistas()
  const fin = useAccionesFinanciamiento({ onSuccess: () => { cerrarTodo(); onRefresh() } })

  const [asignarOpen, setAsignarOpen] = useState(false)
  const [cancelarOpen, setCancelarOpen] = useState(false)
  const [activa, setActiva] = useState<string | null>(null)

  const cerrarTodo = () => { setAsignarOpen(false); setCancelarOpen(false) }

  return (
    <>
      <AsignarAnalistaDialog
        open={asignarOpen}
        analistas={analistas}
        loading={fin.loading}
        onConfirmar={(analistaId) => activa && fin.asignar(activa, analistaId)}
        onCerrar={() => setAsignarOpen(false)}
      />

      <AccionFinanciamientoDialog
        open={cancelarOpen}
        accion={cancelarOpen ? 'cancelar' : null}
        loading={fin.loading}
        onConfirmar={(motivo) => activa && fin.cancelar(activa, motivo)}
        onCerrar={() => setCancelarOpen(false)}
      />

      <SolicitudesTable
        solicitudes={solicitudes}
        meta={meta}
        cargando={cargando}
        onPaginar={onPaginar}
        config={{
          getDetalleUrl: (id) => `/dashboard/financiamiento/solicitud/${id}`,
          getExpedienteUrl: (id) => `/dashboard/admin/promocion/expediente/${id}`,
          mostrarColumnaGestor: false,
          mostrarColumnaEstatus: false,
          mostrarColumnaComentario: true,
          mostrarColumnaPdf: false,
          labelFecha: 'Recibida',
          vacioCopy: {
            icon: <UserPlus className="h-7 w-7" />,
            titulo: 'Sin solicitudes por asignar',
            descripcion: 'La Mesa de Control aún no ha pasado solicitudes a esta cola',
          },
          renderAcciones: (id) => (
            <>
              <DropdownMenuItem
                className="gap-3 cursor-pointer rounded-md px-2.5 py-2 focus:bg-accent group/item"
                onClick={() => { setActiva(id); setAsignarOpen(true) }}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary group-hover/item:bg-primary/15">
                  <UserPlus className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col gap-0">
                  <span className="text-xs font-medium text-foreground leading-tight">Asignar analista</span>
                  <span className="text-[11px] text-muted-foreground leading-tight">Pasar a análisis financiero</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 bg-border/60" />

              <DropdownMenuItem
                className="gap-3 cursor-pointer rounded-md px-2.5 py-2 focus:bg-destructive/10 group/item"
                onClick={() => { setActiva(id); setCancelarOpen(true) }}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive group-hover/item:bg-destructive/15">
                  <Ban className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col gap-0">
                  <span className="text-xs font-medium text-destructive leading-tight">Cancelar Solicitud</span>
                  <span className="text-[11px] text-muted-foreground leading-tight">Cancelar definitivamente</span>
                </div>
              </DropdownMenuItem>
            </>
          ),
        }}
      />
    </>
  )
}
