'use client'

import { Paginacion } from '@/shared/components/common/Paginacion'
import type { PaginacionData } from '@/shared/types/api'
import { AsignacionAnalistaFiltros } from './AsignacionAnalistaFiltros'
import { AsignacionAnalistaToolbar } from './AsignacionAnalistaToolbar'
import { AsignacionAnalistaTable } from './AsignacionAnalistaTable'
import type {
  SolicitudFinanciamiento,
  FiltrosAsignacionFinanciamiento,
  AnalistaConCarga,
} from '@/features/financiamiento/types/financiamiento.types'

interface Props {
  solicitudes: SolicitudFinanciamiento[]
  meta: PaginacionData
  cargando: boolean
  error: string | null
  analistas: AnalistaConCarga[]
  seleccionadas: Set<string>
  todoSeleccionado: boolean
  filtros: FiltrosAsignacionFinanciamiento
  hayFiltrosActivos: boolean
  onPaginar: (page: number) => void
  onReintentar: () => void
  onToggleTodos: () => void
  onSeleccionar: (id: string) => void
  onAsignarLote: () => void
  onAsignarFila: (id: string) => void
  onFiltrar: (f: Partial<FiltrosAsignacionFinanciamiento>) => void
  onLimpiarFiltros: () => void
}

export function AsignacionAnalistaPanel({
  solicitudes, meta, cargando, error, analistas, seleccionadas, todoSeleccionado,
  filtros, hayFiltrosActivos, onPaginar, onReintentar, onToggleTodos, onSeleccionar,
  onAsignarLote, onAsignarFila, onFiltrar, onLimpiarFiltros,
}: Props) {
  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="p-4 pb-0">
        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
          <AsignacionAnalistaFiltros
            filtros={filtros}
            onFiltrar={onFiltrar}
            onLimpiar={onLimpiarFiltros}
            hayFiltrosActivos={hayFiltrosActivos}
            analistas={analistas}
          />
        </div>
      </div>

      <AsignacionAnalistaToolbar
        total={meta.total}
        cargando={cargando}
        seleccionadas={seleccionadas}
        todoSeleccionado={todoSeleccionado}
        onToggleTodos={onToggleTodos}
        onAsignarLote={onAsignarLote}
      />

      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        <AsignacionAnalistaTable
          solicitudes={solicitudes}
          seleccionadas={seleccionadas}
          cargando={cargando}
          error={error}
          onSeleccionar={onSeleccionar}
          onAsignar={onAsignarFila}
          onReintentar={onReintentar}
        />
      </div>

      {!cargando && !error && meta.total > 0 && (
        <div className="shrink-0 border-t border-border/60 bg-background px-4 py-2.5">
          <Paginacion meta={meta} onPaginar={onPaginar} />
        </div>
      )}
    </div>
  )
}
