'use client'

import { useState } from 'react'
import { CheckSquare, SendHorizonal, RotateCcw, Ban } from 'lucide-react'
import { DropdownMenuItem, DropdownMenuSeparator } from '@/shared/components/ui/dropdown-menu'
import { SolicitudesTable } from '../SolicitudesTable'
import { AccionSolicitudDialog, type AccionTipo } from '../AccionSolicitudDialog'
import { useAccionesSolicitud } from '../../hooks/useAccionesSolicitud'
import type { SolicitudPromocion, PaginacionMeta } from '@/shared/lib/types/solicitudes.types'

interface Props {
  solicitudes: SolicitudPromocion[]
  meta: PaginacionMeta
  cargando: boolean
  onPaginar: (page: number) => void
  onRefresh: () => void
}

export function AprobacionTable({ solicitudes, meta, cargando, onPaginar, onRefresh }: Props) {
  const [dialogOpen, setDialogOpen]           = useState(false)
  const [accionActiva, setAccionActiva]       = useState<AccionTipo | null>(null)
  const [solicitudActiva, setSolicitudActiva] = useState<string | null>(null)
  const { loading, enviarAFinanciamiento, regresarAlPromotor, cancelar } =
    useAccionesSolicitud({ onSuccess: () => { setDialogOpen(false); onRefresh() } })

  const abrirAccion = (accion: AccionTipo, solicitudId: string) => {
    setAccionActiva(accion)
    setSolicitudActiva(solicitudId)
    setDialogOpen(true)
  }

  const handleConfirmar = async (motivo: string) => {
    if (!solicitudActiva || !accionActiva) return
    if (accionActiva === 'financiamiento')    await enviarAFinanciamiento(solicitudActiva, { motivo })
    if (accionActiva === 'regresar_promotor') await regresarAlPromotor(solicitudActiva, { motivo })
    if (accionActiva === 'cancelar')          await cancelar(solicitudActiva, { motivo })
  }

  return (
    <>
      <AccionSolicitudDialog
        open={dialogOpen}
        accion={accionActiva}
        loading={loading}
        onConfirmar={handleConfirmar}
        onCerrar={() => setDialogOpen(false)}
      />

      <SolicitudesTable
        solicitudes={solicitudes}
        meta={meta}
        cargando={cargando}
        onPaginar={onPaginar}
        config={{
          getDetalleUrl:    (id) => `/dashboard/admin/solicitudes/${id}`,
          getExpedienteUrl: (id) => `/dashboard/admin/solicitudes/${id}/expediente`,
          getPdfUrl:        (id) => `/dashboard/admin/solicitudes/${id}/pdf`,
          mostrarColumnaGestor:  true,
          mostrarColumnaEstatus: false,
          mostrarColumnaComentario: true,
          labelFecha: 'Recibida',
          vacioCopy: {
            icon: <CheckSquare className="h-7 w-7" />,
            titulo: 'Sin solicitudes en aprobación',
            descripcion: 'No hay solicitudes pendientes de aprobación',
          },
          renderAcciones: (solicitudId) => (
            <>
              <DropdownMenuItem
                className="gap-3 cursor-pointer rounded-md px-2.5 py-2 focus:bg-accent group/item"
                onClick={() => abrirAccion('financiamiento', solicitudId)}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary group-hover/item:bg-primary/15">
                  <SendHorizonal className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col gap-0">
                  <span className="text-xs font-medium text-foreground leading-tight">Enviar a Financiamiento</span>
                  <span className="text-[11px] text-muted-foreground leading-tight">Pasar al equipo de análisis financiero</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="gap-3 cursor-pointer rounded-md px-2.5 py-2 focus:bg-accent group/item"
                onClick={() => abrirAccion('regresar_promotor', solicitudId)}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover/item:bg-amber-500/15">
                  <RotateCcw className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col gap-0">
                  <span className="text-xs font-medium text-foreground leading-tight">Regresar al Promotor</span>
                  <span className="text-[11px] text-muted-foreground leading-tight">Devolver para revisión adicional</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 bg-border/60" />

              <DropdownMenuItem
                className="gap-3 cursor-pointer rounded-md px-2.5 py-2 focus:bg-destructive/10 group/item"
                onClick={() => abrirAccion('cancelar', solicitudId)}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive group-hover/item:bg-destructive/15">
                  <Ban className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col gap-0">
                  <span className="text-xs font-medium text-destructive leading-tight">Cancelar Solicitud</span>
                  <span className="text-[11px] text-muted-foreground leading-tight">Cancelar definitivamente esta solicitud</span>
                </div>
              </DropdownMenuItem>
            </>
          ),
        }}
      />
    </>
  )
}