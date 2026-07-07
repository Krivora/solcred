// app/(dashboard)/dashboard/admin/solicitudes/page.tsx
'use client'

import { AlertCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { PromocionStats } from '@/features/promocion/components/solicitudes/PromocionStats'
import { PromocionFiltros } from '@/features/promocion/components/solicitudes/PromocionFiltros'
import { PromocionTable } from '@/features/promocion/components/solicitudes/PromocionTable'
import { useSolicitudesPromocion } from '@/features/promocion/hooks/useSolicitudesPromocion'
import { PageHeader, RefreshAction } from '@/shared/components/ui/PageHeader'

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

      <PageHeader
        title="Solicitudes de Promoción"
        description="Gestión y revisión del primer filtro de solicitudes de crédito"
        action={RefreshAction(recargar, cargando)}
      />

      <PromocionStats stats={stats} cargando={cargandoStats} />

      <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
        <PromocionFiltros
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
            variant="ghost"
            size="sm"
            onClick={recargar}
            className="h-7 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
          >
            Reintentar
          </Button>
        </div>
      )}

      <PromocionTable
        solicitudes={solicitudes}
        meta={meta}
        cargando={cargando}
        onPaginar={cambiarPagina}
        onRefresh={recargar}
      />
    </div>
  )
}