'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { PageHeader, RefreshAction } from '@/shared/components/common/PageHeader'
import { AsignacionMasivaDialog } from '@/features/promocion/components/asignacion/AsignacionMasivaDialog'
import { useAsignacionAnalistas } from '@/features/financiamiento/hooks/useAsignacionAnalistas'
import { AsignacionAnalistaPanel } from '@/features/financiamiento/components/asignacion/AsignacionAnalistaPanel'
import { AnalistasPanel } from '@/features/financiamiento/components/asignacion/AnalistasPanel'
import { AsignarAnalistaSheet } from '@/features/financiamiento/components/asignacion/AsignarAnalistaSheet'
import type { FiltrosAsignacionFinanciamiento } from '@/features/financiamiento/types/financiamiento.types'

const FILTROS_INICIALES: FiltrosAsignacionFinanciamiento = {
  page: 1,
  pageSize: 20,
  tipoPersona: '',
  sector: '',
  tamanoEmpresa: '',
  fechaDesde: '',
  fechaHasta: '',
  busqueda: '',
}

interface SheetData {
  solicitudIds: string[]
  folio?: string
  analistaActualId?: string
  /** Cuántas de las seleccionadas ya tienen analista (se reasignarán). */
  yaAsignadas?: number
}

export default function AsignacionFinanciamientoPage() {
  const {
    solicitudes, meta, cargandoSolicitudes, cargarSolicitudes,
    analistas, cargandoAnalistas, cargarAnalistas,
    asignando, asignarAnalistas, estadoAsignacion, reiniciarEstadoAsignacion,
  } = useAsignacionAnalistas()

  const [filtros, setFiltros] = useState<FiltrosAsignacionFinanciamiento>(FILTROS_INICIALES)
  const [seleccionadas, setSeleccionadas] = useState<Set<string>>(new Set())
  const [sheetData, setSheetData] = useState<SheetData | null>(null)
  const [dialogMasivaOpen, setDialogMasivaOpen] = useState(false)

  const cargar = useCallback(() => cargarSolicitudes(filtros), [cargarSolicitudes, filtros])

  useEffect(() => { cargar() }, [cargar])
  useEffect(() => { cargarAnalistas() }, [cargarAnalistas])

  const toggleSeleccion = (id: string) => {
    setSeleccionadas((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleTodos = () => {
    setSeleccionadas((prev) =>
      prev.size === solicitudes.length ? new Set() : new Set(solicitudes.map((s) => s.id)),
    )
  }

  const handleFiltrar = (parcial: Partial<FiltrosAsignacionFinanciamiento>) => {
    setSeleccionadas(new Set())
    setFiltros((prev) => ({ ...prev, ...parcial, page: 1 }))
  }

  const handleLimpiarFiltros = () => {
    setSeleccionadas(new Set())
    setFiltros(FILTROS_INICIALES)
  }

  const handlePaginar = (page: number) => {
    setSeleccionadas(new Set())
    setFiltros((prev) => ({ ...prev, page }))
  }

  const hayFiltrosActivos =
    !!filtros.busqueda || !!filtros.tipoPersona || !!filtros.sector || !!filtros.tamanoEmpresa ||
    !!filtros.asignacion || !!filtros.analistaId || !!filtros.fechaDesde || !!filtros.fechaHasta

  const abrirSheetFila = (id: string) => {
    const sol = solicitudes.find((s) => s.id === id)
    setSheetData({
      solicitudIds: [id],
      folio: sol?.folio,
      analistaActualId: sol?.analistaAsignado?.analista.id,
    })
  }

  const abrirSheetLote = () => {
    if (seleccionadas.size === 0) return
    const ids = [...seleccionadas]
    const yaAsignadas = ids.filter((id) => solicitudes.find((s) => s.id === id)?.analistaAsignado).length
    setSheetData({ solicitudIds: ids, yaAsignadas })
  }

  const folioPorId = useMemo(
    () => Object.fromEntries(solicitudes.map((s) => [s.id, s.folio])),
    [solicitudes],
  )

  const handleConfirmarAsignacion = async (analistaId: string, motivo?: string) => {
    if (!sheetData) return
    const esLote = sheetData.solicitudIds.length > 1
    setSheetData(null)
    if (esLote) setDialogMasivaOpen(true)

    await asignarAnalistas(sheetData.solicitudIds, analistaId, motivo, () => {
      cargar()
      cargarAnalistas()
      setSeleccionadas(new Set())
    })
  }

  const todoSeleccionado = solicitudes.length > 0 && seleccionadas.size === solicitudes.length

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Asignación de Analistas"
        description="Asigna o reasigna analistas a las solicitudes en financiamiento"
        action={RefreshAction(() => { cargar(); cargarAnalistas() }, cargandoSolicitudes)}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 border-r border-border/60">
          <AsignacionAnalistaPanel
            solicitudes={solicitudes}
            meta={meta}
            cargando={cargandoSolicitudes}
            error={null}
            analistas={analistas}
            seleccionadas={seleccionadas}
            todoSeleccionado={todoSeleccionado}
            filtros={filtros}
            hayFiltrosActivos={hayFiltrosActivos}
            onPaginar={handlePaginar}
            onReintentar={cargar}
            onToggleTodos={toggleTodos}
            onSeleccionar={toggleSeleccion}
            onAsignarLote={abrirSheetLote}
            onAsignarFila={abrirSheetFila}
            onFiltrar={handleFiltrar}
            onLimpiarFiltros={handleLimpiarFiltros}
          />
        </div>

        <AnalistasPanel analistas={analistas} cargando={cargandoAnalistas} onRecargar={cargarAnalistas} />
      </div>

      {sheetData && (
        <AsignarAnalistaSheet
          open={!!sheetData}
          onOpenChange={(v) => { if (!v) setSheetData(null) }}
          solicitudIds={sheetData.solicitudIds}
          folio={sheetData.folio}
          analistaActualId={sheetData.analistaActualId}
          yaAsignadas={sheetData.yaAsignadas}
          analistas={analistas}
          cargandoAnalistas={cargandoAnalistas}
          asignando={asignando}
          onConfirmar={handleConfirmarAsignacion}
        />
      )}

      <AsignacionMasivaDialog
        open={dialogMasivaOpen}
        onOpenChange={(open) => { setDialogMasivaOpen(open); if (!open) reiniciarEstadoAsignacion() }}
        estado={estadoAsignacion}
        folioPorId={folioPorId}
      />
    </div>
  )
}
