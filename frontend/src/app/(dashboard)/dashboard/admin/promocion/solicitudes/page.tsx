// app/(dashboard)/dashboard/admin/solicitudes/page.tsx
'use client'

import { RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PromocionStats } from '@/components/admin/solicitudes/PromocionStats'
import { PromocionFiltros } from '@/components/admin/solicitudes/PromocionFiltros'
import { PromocionTable } from '@/components/admin/solicitudes/PromocionTable'
import { useSolicitudesPromocion } from '@/lib/hooks/useSolicitudesPromocion'

export default function SolicitudesPromocionPage() {
  const {
    solicitudes,
    meta,
    stats,
    filtros,
    cargando,
    cargandoStats,
    error,
    hayFiltrosActivos,
    actualizarFiltros,
    cambiarPagina,
    limpiarFiltros,
    recargar,
  } = useSolicitudesPromocion()

  return (
    <div className="mx-auto max-w-8xl space-y-6">

      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Solicitudes de Promoción
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gestión y revisión del primer filtro de solicitudes de crédito
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={recargar}
          disabled={cargando}
          className="gap-1.5 h-8 shrink-0 border-border/60 hover:bg-accent hover:text-accent-foreground hover:border-primary/20 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${cargando ? 'animate-spin text-primary' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Stats */}
      <PromocionStats stats={stats} cargando={cargandoStats} />

      {/* Filtros */}
      <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
        <PromocionFiltros
          filtros={filtros}
          onFiltrar={actualizarFiltros}
          onLimpiar={limpiarFiltros}
          hayFiltrosActivos={hayFiltrosActivos}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm text-destructive">
          <div className="shrink-0 p-1.5 bg-destructive/10 rounded-lg">
            <AlertCircle className="h-4 w-4" />
          </div>
          <span className="flex-1">{error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={recargar}
            className="h-7 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
          >
            Reintentar
          </Button>
        </div>
      )}

      {/* Tabla */}
      <PromocionTable
        solicitudes={solicitudes}
        meta={meta}
        cargando={cargando}
        onPaginar={cambiarPagina}
      />
    </div>
  )
}