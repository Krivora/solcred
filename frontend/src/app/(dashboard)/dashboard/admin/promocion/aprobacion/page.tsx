'use client'

import { AlertCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { AprobacionFiltros } from '@/features/promocion/components/aprobacion/AprobacionFiltros'
import { AprobacionTable } from '@/features/promocion/components/aprobacion/AprobacionTable'
import { useAprobacion } from '@/features/promocion/hooks/useAprobacion'
import { PageHeader, RefreshAction } from '@/shared/components/common/PageHeader'
import { useNavAnimation } from '@/shared/hooks/useNavAnimation'

export default function AprobacionPage() {
  const {
    solicitudes, meta, filtros, cargando, error,
    hayFiltrosActivos, actualizarFiltros, cambiarPagina,
    limpiarFiltros, recargar,
  } = useAprobacion()

  const claseAnimacion = useNavAnimation('') // '' = sin animación salvo que vengas del detalle

  return (
    <div className={`${claseAnimacion} mx-auto max-w-8xl space-y-6`}>

      <PageHeader
        title="Comité de Aprobación"
        description="Solicitudes en espera de aprobación de promoción"
        action={RefreshAction(recargar, cargando)}
      />

      <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
        <AprobacionFiltros
          filtros={filtros}
          onFiltrar={actualizarFiltros}
          onLimpiar={limpiarFiltros}
          hayFiltrosActivos={hayFiltrosActivos}
        />
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm text-destructive">
          <div className="shrink-0 p-1.5 bg-destructive/10 rounded-lg">
            <AlertCircle className="h-4 w-4" />
          </div>
          <span className="flex-1">{error}</span>
          <Button
            variant="ghost" size="sm"
            onClick={recargar}
            className="h-7 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
          >
            Reintentar
          </Button>
        </div>
      )}

      <AprobacionTable
        solicitudes={solicitudes}
        meta={meta}
        cargando={cargando}
        onPaginar={cambiarPagina}
        onRefresh={recargar}
      />
    </div>
  )
}