'use client'

import type { ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { PageHeader, RefreshAction } from '@/shared/components/common/PageHeader'
import { useNavAnimation } from '@/shared/hooks/useNavAnimation'
import { FinanciamientoFiltros } from '@/features/financiamiento/components/FinanciamientoFiltros'
import { FinanciamientoTabla, type AccionDef } from '@/features/financiamiento/components/FinanciamientoTabla'
import type { SolicitudPromocion, PaginacionData } from '@/features/promocion/types/solicitud.types'
import type { FiltrosFinanciamiento } from '@/features/financiamiento/types/financiamiento.types'

interface HookResult {
  solicitudes: SolicitudPromocion[]
  meta: PaginacionData
  filtros: FiltrosFinanciamiento
  cargando: boolean
  error: string | null
  hayFiltrosActivos: boolean
  actualizarFiltros: (f: Partial<FiltrosFinanciamiento>) => void
  cambiarPagina: (page: number) => void
  limpiarFiltros: () => void
  recargar: () => void
}

interface Props {
  titulo: string
  descripcion: string
  hook: HookResult
  acciones: AccionDef[]
  mostrarColumnaAnalista?: boolean
  vacio: { icon: ReactNode; titulo: string; descripcion: string }
  enlaceAnalisis?: (id: string) => string
}

export function FinanciamientoListPage({
  titulo, descripcion, hook, acciones, mostrarColumnaAnalista, vacio, enlaceAnalisis,
}: Props) {
  const claseAnimacion = useNavAnimation('')

  return (
    <div className={`${claseAnimacion} mx-auto max-w-8xl space-y-6`}>
      <PageHeader
        title={titulo}
        description={descripcion}
        action={RefreshAction(hook.recargar, hook.cargando)}
      />

      <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
        <FinanciamientoFiltros
          filtros={hook.filtros}
          onFiltrar={hook.actualizarFiltros}
          onLimpiar={hook.limpiarFiltros}
          hayFiltrosActivos={hook.hayFiltrosActivos}
        />
      </div>

      {hook.error && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm text-destructive">
          <div className="shrink-0 p-1.5 bg-destructive/10 rounded-lg">
            <AlertCircle className="h-4 w-4" />
          </div>
          <span className="flex-1">{hook.error}</span>
          <Button
            variant="ghost" size="sm"
            onClick={hook.recargar}
            className="h-7 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
          >
            Reintentar
          </Button>
        </div>
      )}

      <FinanciamientoTabla
        solicitudes={hook.solicitudes}
        meta={hook.meta}
        cargando={hook.cargando}
        onPaginar={hook.cambiarPagina}
        onRefresh={hook.recargar}
        acciones={acciones}
        mostrarColumnaAnalista={mostrarColumnaAnalista}
        vacio={vacio}
        enlaceAnalisis={enlaceAnalisis}
      />
    </div>
  )
}
