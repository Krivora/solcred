'use client'

import { SolicitudesToolbar } from './SolicitudesToolbar'
import { AsignacionSolicitudesTable } from './AsignacionSolicitudesTable'
import type { SolicitudAsignacion } from '@/features/promocion/types/asignacion.types'
import type { GrupoGestion } from '@/features/settings/types/grupos.types'
import { AsignacionFiltros } from './AsignacionFiltros'
import type { FiltrosAsignacion } from '@/features/promocion/types/asignacion.types'
import { Paginacion } from '@/shared/components/common/Paginacion'
import type { PaginacionData } from '@/shared/types/api'
// ─── Props ────────────────────────────────────────────────────────────────────

interface SolicitudesPanelProps {
    solicitudes: SolicitudAsignacion[]
    meta: PaginacionData
    onPaginar: (page: number) => void
    cargando: boolean
    error: string | null
    grupos: GrupoGestion[]
    seleccionadas: Set<string>
    todoSeleccionado: boolean
    asignandoId: string | null
    asignandoLote: boolean
    grupoFiltro: string
    onReintentar: () => void
    onToggleTodos: () => void
    onSeleccionar: (id: string) => void
    onAsignarRapido: (id: string) => void
    onAsignarLote: () => void
    onAsignarManual: () => void
    onCambiarGrupo: (valor: string) => void
    filtros: FiltrosAsignacion
    onFiltrar: (f: Partial<FiltrosAsignacion>) => void
    onLimpiarFiltros: () => void
    hayFiltrosActivos: boolean
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function SolicitudesPanel({
    solicitudes,
    meta,
    onPaginar,
    cargando,
    error,
    grupos,
    seleccionadas,
    todoSeleccionado,
    asignandoId,
    asignandoLote,
    grupoFiltro,
    onReintentar,
    onToggleTodos,
    onSeleccionar,
    onAsignarRapido,
    onAsignarLote,
    onAsignarManual,
    onCambiarGrupo,
    filtros,
    onFiltrar,
    onLimpiarFiltros,
    hayFiltrosActivos
}: SolicitudesPanelProps) {
    const total = solicitudes.filter(s => s.estatus === 'PENDIENTE').length
    return (
        <div className="flex-1 flex flex-col min-w-0">
            <div className="px-4 py-3 border-b border-border/40">
                <AsignacionFiltros
                    filtros={filtros}
                    onFiltrar={onFiltrar}
                    onLimpiar={onLimpiarFiltros}
                    hayFiltrosActivos={hayFiltrosActivos}
                />
            </div>
            <SolicitudesToolbar
                total={total}
                cargando={cargando}
                seleccionadas={seleccionadas}
                todoSeleccionado={todoSeleccionado}
                asignandoLote={asignandoLote}
                grupoFiltro={grupoFiltro}
                grupos={grupos}
                onToggleTodos={onToggleTodos}
                onAsignarLote={onAsignarLote}
                onAsignarManual={onAsignarManual}
                onCambiarGrupo={onCambiarGrupo}
            />

            <div className="flex-1 min-h-0 overflow-y-auto p-4">
                <AsignacionSolicitudesTable
                    solicitudes={solicitudes}
                    seleccionadas={seleccionadas}
                    asignandoId={asignandoId}
                    cargando={cargando}
                    error={error}
                    onSeleccionar={onSeleccionar}
                    onAsignarRapido={onAsignarRapido}
                    onReintentar={onReintentar}
                />
            </div>

            {!cargando && !error && meta.total > 0 && (
                <div className="shrink-0 border-t border-border/60 bg-background px-4 py-2.5">
                    <Paginacion
                        meta={meta}
                        onPaginar={onPaginar}
                    />
                </div>
            )}
        </div>
    )
}