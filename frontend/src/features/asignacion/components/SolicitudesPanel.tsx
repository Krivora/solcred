'use client'

import { SolicitudesToolbar } from './SolicitudesToolbar'
import { SolicitudesTable } from './SolicitudesTable'
import type { SolicitudPendiente, GrupoGestion } from '../types/asignacion.types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface SolicitudesPanelProps {
    solicitudes: SolicitudPendiente[]
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
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function SolicitudesPanel({
    solicitudes,
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
}: SolicitudesPanelProps) {
    console.log('render de solicitudesd', solicitudes)
    return (
        <div className="flex-1 flex flex-col min-w-0 border-r border-border/60">

            <SolicitudesToolbar
                total={solicitudes.length}
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

            <SolicitudesTable
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
    )
}