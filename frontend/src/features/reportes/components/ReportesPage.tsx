'use client'

import { FileSpreadsheet, Download, TriangleAlert } from 'lucide-react'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { useReporteSolicitudes } from '@/features/reportes/hooks/useReporteSolicitudes'
import { FiltrosReporte } from './FiltrosReporte'
import { ResumenReporte } from './ResumenReporte'
import { TablaReporte } from './TablaReporte'

/** Espejo de `MAX_FILAS_EXPORT` en el backend — solo para avisar en pantalla. */
const MAX_FILAS_EXPORT = 20_000

export function ReportesPage() {
  const {
    filtros,
    actualizarFiltro,
    limpiarFiltros,
    filtrosActivos,
    catalogos,
    cargandoCatalogos,
    filas,
    resumen,
    paginacion,
    page,
    cambiarPagina,
    cargandoPrevia,
    refrescandoPrevia,
    error,
    exportar,
    exportando,
  } = useReporteSolicitudes()

  const excedeLimite = paginacion.total > MAX_FILAS_EXPORT

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Reportes"
          description="Combina los filtros que necesites y exporta el resultado a Excel"
          icon={<FileSpreadsheet className="h-5 w-5 text-primary" />}
        />
        <Button
          onClick={() => exportar()}
          disabled={exportando || paginacion.total === 0}
          className="gap-1.5 shrink-0"
        >
          <Download className={cn('size-4', exportando && 'animate-bounce')} />
          {exportando ? 'Generando…' : `Exportar a Excel${paginacion.total ? ` (${paginacion.total.toLocaleString('es-MX')})` : ''}`}
        </Button>
      </div>

      {excedeLimite && (
        <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
          <TriangleAlert className="size-4 shrink-0" />
          El resultado supera las {MAX_FILAS_EXPORT.toLocaleString('es-MX')} filas: el Excel se generará truncado. Acota los filtros para exportarlo completo.
        </div>
      )}

      <FiltrosReporte
        filtros={filtros}
        actualizarFiltro={actualizarFiltro}
        limpiarFiltros={limpiarFiltros}
        filtrosActivos={filtrosActivos}
        catalogos={catalogos}
        cargandoCatalogos={cargandoCatalogos}
      />

      <ResumenReporte resumen={resumen} cargando={cargandoPrevia} />

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center text-sm text-destructive">
          {error}
        </div>
      ) : (
        <TablaReporte
          filas={filas}
          paginacion={{ ...paginacion, page }}
          cambiarPagina={cambiarPagina}
          cargando={cargandoPrevia || refrescandoPrevia}
        />
      )}
    </div>
  )
}
