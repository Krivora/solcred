'use client'

import { AlertCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { PageHeader, RefreshAction } from '@/shared/components/common/PageHeader'
import { useNavAnimation } from '@/shared/hooks/useNavAnimation'
import { useAsignacionFinanciamiento } from '@/features/financiamiento/hooks/useFinanciamientoListados'
import { FinanciamientoFiltros } from '@/features/financiamiento/components/FinanciamientoFiltros'
import { AsignacionFinanciamientoTable } from '@/features/financiamiento/components/AsignacionFinanciamientoTable'

export default function AsignacionFinanciamientoPage() {
  const {
    solicitudes, meta, filtros, cargando, error,
    hayFiltrosActivos, actualizarFiltros, cambiarPagina, limpiarFiltros, recargar,
  } = useAsignacionFinanciamiento()

  const claseAnimacion = useNavAnimation('')

  return (
    <div className={`${claseAnimacion} mx-auto max-w-8xl space-y-6`}>
      <PageHeader
        title="Asignación de Analistas"
        description="Asigna un analista a cada solicitud que pasó la Mesa de Control"
        action={RefreshAction(recargar, cargando)}
      />

      <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
        <FinanciamientoFiltros
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
            variant="ghost" size="sm" onClick={recargar}
            className="h-7 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
          >
            Reintentar
          </Button>
        </div>
      )}

      <AsignacionFinanciamientoTable
        solicitudes={solicitudes}
        meta={meta}
        cargando={cargando}
        onPaginar={cambiarPagina}
        onRefresh={recargar}
      />
    </div>
  )
}
