'use client'

import { useState, type ReactNode } from 'react'
import { DropdownMenuItem, DropdownMenuSeparator } from '@/shared/components/ui/dropdown-menu'
import { SolicitudesTable } from '@/features/promocion/components/common/SolicitudesTable'
import type { SolicitudPromocion, PaginacionData } from '@/features/promocion/types/solicitud.types'
import {
  AccionFinanciamientoDialog,
  type AccionFinTipo,
} from '@/features/financiamiento/components/AccionFinanciamientoDialog'
import { useAccionesFinanciamiento } from '@/features/financiamiento/hooks/useAccionesFinanciamiento'

export interface AccionDef {
  tipo: AccionFinTipo
  label: string
  sub: string
  icon: ReactNode
  destructive?: boolean
  /** dibuja un separador ANTES de este item */
  separadorAntes?: boolean
}

interface Props {
  solicitudes: SolicitudPromocion[]
  meta: PaginacionData
  cargando: boolean
  onPaginar: (page: number) => void
  onRefresh: () => void
  acciones: AccionDef[]
  mostrarColumnaAnalista?: boolean
  vacio: { icon: ReactNode; titulo: string; descripcion: string }
}

export function FinanciamientoTabla({
  solicitudes, meta, cargando, onPaginar, onRefresh, acciones, mostrarColumnaAnalista, vacio,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [accionActiva, setAccionActiva] = useState<AccionFinTipo | null>(null)
  const [solicitudActiva, setSolicitudActiva] = useState<string | null>(null)

  const fin = useAccionesFinanciamiento({
    onSuccess: () => { setDialogOpen(false); onRefresh() },
  })

  const abrir = (tipo: AccionFinTipo, id: string) => {
    setAccionActiva(tipo)
    setSolicitudActiva(id)
    setDialogOpen(true)
  }

  const confirmar = async (motivo: string) => {
    if (!solicitudActiva || !accionActiva) return
    const id = solicitudActiva
    switch (accionActiva) {
      case 'regresar_aprobacion': return fin.regresarAAprobacion(id, motivo)
      case 'pasar_asignacion':    return fin.pasarAAsignacion(id, motivo || undefined)
      case 'enviar_validacion':   return fin.enviarAValidacion(id, motivo || undefined)
      case 'regresar_analista':   return fin.regresarAAnalista(id, motivo)
      case 'enviar_comite':       return fin.enviarAComite(id, motivo || undefined)
      case 'regresar_validacion': return fin.regresarAValidacion(id, motivo)
      case 'aprobar':             return fin.aprobar(id, motivo || undefined)
      case 'rechazar':            return fin.rechazar(id, motivo)
      case 'cancelar':            return fin.cancelar(id, motivo)
    }
  }

  return (
    <>
      <AccionFinanciamientoDialog
        open={dialogOpen}
        accion={accionActiva}
        loading={fin.loading}
        onConfirmar={confirmar}
        onCerrar={() => setDialogOpen(false)}
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
          mostrarColumnaAnalista,
          mostrarColumnaEstatus: true,
          mostrarColumnaComentario: true,
          mostrarColumnaPdf: false,
          labelFecha: 'Recibida',
          vacioCopy: vacio,
          renderAcciones: acciones.length
            ? (id) => (
                <>
                  {acciones.map((a) => (
                    <span key={a.tipo}>
                      {a.separadorAntes && <DropdownMenuSeparator className="my-1 bg-border/60" />}
                      <DropdownMenuItem
                        className={`gap-3 cursor-pointer rounded-md px-2.5 py-2 group/item ${
                          a.destructive ? 'focus:bg-destructive/10' : 'focus:bg-accent'
                        }`}
                        onClick={() => abrir(a.tipo, id)}
                      >
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                            a.destructive
                              ? 'bg-destructive/10 text-destructive group-hover/item:bg-destructive/15'
                              : 'bg-primary/10 text-primary group-hover/item:bg-primary/15'
                          }`}
                        >
                          {a.icon}
                        </div>
                        <div className="flex flex-col gap-0">
                          <span className={`text-xs font-medium leading-tight ${a.destructive ? 'text-destructive' : 'text-foreground'}`}>
                            {a.label}
                          </span>
                          <span className="text-[11px] text-muted-foreground leading-tight">{a.sub}</span>
                        </div>
                      </DropdownMenuItem>
                    </span>
                  ))}
                </>
              )
            : undefined,
        }}
      />
    </>
  )
}
