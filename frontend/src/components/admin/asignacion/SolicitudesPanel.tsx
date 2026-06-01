'use client'

import { AlertCircle, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { SolicitudesToolbar } from './SolicitudesToolbar'
import { SolicitudRow } from './SolicitudRow'
import type { SolicitudPendiente, GrupoGestion } from '@/lib/types/asignacion.types'

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ListaSkeleton() {
    return (
        <div className="flex flex-col">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-border/40">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-28 rounded" />
                    <Skeleton className="h-4 w-48 rounded" />
                    <Skeleton className="h-4 flex-1 rounded" />
                    <Skeleton className="h-4 w-20 rounded hidden md:block" />
                </div>
            ))}
        </div>
    )
}

// ─── Header columnas ──────────────────────────────────────────────────────────

function ColumnasHeader() {
    return (
        <div className="flex items-center gap-3 px-4 py-2 border-b border-border/40 bg-muted/30">
            <div className="w-4 shrink-0" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground w-28">Folio</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground w-48 shrink-0">Solicitante</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex-1">Programa / Monto</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground w-28 hidden lg:block">Sector / Tamaño</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hidden sm:block w-24">Estatus</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground w-16 text-right">Antigüedad</span>
            <div className="w-7 shrink-0" />
        </div>
    )
}

// ─── Estados vacíos ───────────────────────────────────────────────────────────

function EstadoError({ mensaje, onReintentar }: { mensaje: string; onReintentar: () => void }) {
    return (
        <div className="flex flex-col items-center gap-3 py-12 text-center px-6">
            <AlertCircle className="h-8 w-8 text-destructive/60" />
            <p className="text-sm text-muted-foreground">{mensaje}</p>
            <Button variant="outline" size="sm" onClick={onReintentar} className="border-border/60">
                Reintentar
            </Button>
        </div>
    )
}

function EstadoVacio() {
    return (
        <div className="flex flex-col items-center gap-3 py-16 text-center px-6">
            <div className="p-4 bg-muted/50 rounded-2xl">
                <Inbox className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
                <p className="text-sm font-medium text-foreground">Cola vacía</p>
                <p className="text-xs text-muted-foreground mt-1">
                    No hay solicitudes pendientes de asignación
                </p>
            </div>
        </div>
    )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface SolicitudesPanelProps {
    // datos
    solicitudes: SolicitudPendiente[]
    cargando: boolean
    error: string | null
    grupos: GrupoGestion[]
    // selección
    seleccionadas: Set<string>
    todoSeleccionado: boolean
    // asignación
    asignandoId: string | null
    asignandoLote: boolean
    // filtro
    grupoFiltro: string
    // handlers
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

            <ColumnasHeader />

            <div className="flex-1 overflow-y-auto">
                {cargando ? (
                    <ListaSkeleton />
                ) : error ? (
                    <EstadoError mensaje={error} onReintentar={onReintentar} />
                ) : solicitudes.length === 0 ? (
                    <EstadoVacio />
                ) : (
                    solicitudes.map(s => (
                        <SolicitudRow
                            key={s.id}
                            solicitud={s}
                            seleccionada={seleccionadas.has(s.id)}
                            asignandoId={asignandoId}
                            onSeleccionar={onSeleccionar}
                            onAsignarRapido={onAsignarRapido}
                        />
                    ))
                )}
            </div>
        </div>
    )
}