'use client'

import { useEffect, useState, useCallback } from 'react'
import { RefreshCw, Users } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { GestorCard } from '@/features/promocion/components/asignacion/GestorCard'
import { AsignacionSheet } from '@/features/promocion/components/asignacion/AsignacionSheet'
import { AsignacionMasivaDialog } from '@/features/promocion/components/asignacion/AsignacionMasivaDialog' // ← nuevo
import { useAsignacion } from '@/features/promocion/hooks/useAsignacion'
import { useGrupos } from '@/features/settings/hooks/useGrupos'
import { cn } from '@/shared/lib/cn'
import type { FiltrosAsignacion, GestorConCarga } from '@/features/promocion/types/asignacion.types'
import { SolicitudesPanel } from '@/features/promocion/components/asignacion/SolicitudesPanel'
import { PageHeader, RefreshAction } from '@/shared/components/common/PageHeader'


interface SheetData {
    solicitudIds: string[]
    folio?: string
    gestorActualId?: string
}

function ListaGestoresSkeleton() {
    return (
        <div className="flex flex-col">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-border/40">
                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                    <Skeleton className="h-4 flex-1 rounded" />
                    <Skeleton className="h-8 w-16 rounded-lg" />
                </div>
            ))}
        </div>
    )
}

function CargaDistribucion({ gestores }: { gestores: GestorConCarga[] }) {
    const total = gestores.reduce((acc, g) => acc + g.cargaActual, 0)
    const colors = ['bg-primary', 'bg-primary/70', 'bg-primary/50', 'bg-primary/30']

    return (
        <div className="px-4 py-3 border-t border-border/60 bg-muted/20">
            <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Carga total</span>
                <span className="font-semibold tabular-nums">{total} casos</span>
            </div>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                {gestores.map((g, i) => (
                    <div
                        key={g.id}
                        className={`inline-block h-full ${colors[i % colors.length]}`}
                        style={{ width: `${(g.cargaActual / (total || 1)) * 100}%` }}
                        title={`${g.nombre}: ${g.cargaActual} casos`}
                    />
                ))}
            </div>
        </div>
    )
}

const FILTROS_INICIALES: FiltrosAsignacion = {
    page: 1,
    pageSize: 20,
    estatus: 'PENDIENTE,EN_REVISION',
}
export default function AsignacionPage() {
    const {
        solicitudes,
        meta,
        cargandoSolicitudes: cargando,
        cargarSolicitudes,
        gestores,
        cargandoGestores,
        asignarAutomaticamente,
        estadoAsignacion,
        reiniciarEstadoAsignacion,
        cargarGestores,
    } = useAsignacion()

    const { grupos } = useGrupos()

    const [seleccionadas, setSeleccionadas] = useState<Set<string>>(new Set())
    const [grupoFiltro, setGrupoFiltro] = useState('todos')
    const [asignandoId, setAsignandoId] = useState<string | null>(null)
    const [asignandoLote, setAsignandoLote] = useState(false)
    const [sheetData, setSheetData] = useState<SheetData | null>(null)
    const [dialogAsignacionOpen, setDialogAsignacionOpen] = useState(false)
    const [error] = useState<string | null>(null)

    const [filtros, setFiltros] = useState<FiltrosAsignacion>(FILTROS_INICIALES)
    const cargar = useCallback(() => {
        cargarSolicitudes(filtros)
    }, [cargarSolicitudes, filtros])

    useEffect(() => {
        cargar()
        cargarGestores()
    }, [cargar, cargarGestores])

    // ── Selección ──────────────────────────────────────────────────────────────

    const toggleSeleccion = (id: string) => {
        setSeleccionadas(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const toggleTodos = () => {
        setSeleccionadas(prev =>
            prev.size === solicitudes.length
                ? new Set()
                : new Set(solicitudes.map(s => s.id))
        )
    }

    const handleFiltrar = (parcial: Partial<FiltrosAsignacion>) => {
        const nuevos = { ...filtros, ...parcial, page: 1 }
        setFiltros(nuevos)
        cargarSolicitudes(nuevos)
    }

    const handleLimpiarFiltros = () => {
        setFiltros(FILTROS_INICIALES)
        cargarSolicitudes(FILTROS_INICIALES)
    }

    const handlePaginar = (page: number) => {
        setSeleccionadas(new Set()) // la selección es por página
        // el useEffect de arriba recarga al cambiar `filtros`
        setFiltros(prev => ({ ...prev, page }))
    }

    const hayFiltrosActivos =
        !!filtros.busqueda ||
        !!filtros.estatus?.split(',').some(e => !['PENDIENTE', 'EN_REVISION'].includes(e)) ||
        !!filtros.tipoPersona ||
        !!filtros.sector ||
        !!filtros.tamanoEmpresa ||
        !!filtros.gestorId ||
        !!filtros.asignacion ||
        !!filtros.fechaDesde ||
        !!filtros.fechaHasta

    const handleAsignarRapido = async (solicitudId: string) => {
        setAsignandoId(solicitudId)
        await asignarAutomaticamente([solicitudId], () => {
            cargar()
            setSeleccionadas(prev => {
                const next = new Set(prev)
                next.delete(solicitudId)
                return next
            })
        })
        setAsignandoId(null)
    }
    const handleAsignarLote = async () => {
        if (!seleccionadas.size) return
        setAsignandoLote(true)
        setDialogAsignacionOpen(true)

        await asignarAutomaticamente([...seleccionadas], () => {
            cargar()
        })

        setSeleccionadas(new Set())
        setAsignandoLote(false)
    }

    const handleAsignarManual = () => {
        if (seleccionadas.size === 0) return

        const ids = [...seleccionadas]

        if (ids.length === 1) {
            const sol = solicitudes.find(s => s.id === ids[0])
            setSheetData({
                solicitudIds: ids,
                folio: sol?.folio,
                // si tu SolicitudAsignacion trae el gestor actual, pásalo aquí
                // gestorActualId: sol?.gestorActualId,
            })
        } else {
            setSheetData({ solicitudIds: ids })
        }
    }

    // ── Filtrado ───────────────────────────────────────────────────────────────

    const solicitudesFiltradas = solicitudes

    const todoSeleccionado =
        solicitudes.length > 0 && seleccionadas.size === solicitudes.length

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <PageHeader
                title="Cola de asignación"
                description="Gestión y asignación de solicitudes pendientes"
                action={RefreshAction(() => { cargar(); cargarGestores() }, cargando)}
            />

            {/* Layout dos columnas */}
            <div className="flex flex-1 overflow-hidden">

                {/* ── Columna izquierda: solicitudes ─────────────────────────── */}
                <div className="flex-1 flex flex-col min-w-0 border-r border-border/60">
                    <SolicitudesPanel
                        solicitudes={solicitudesFiltradas}
                        meta={meta}
                        onPaginar={handlePaginar}
                        cargando={cargando}
                        error={error}
                        grupos={grupos}
                        gestores={gestores}
                        seleccionadas={seleccionadas}
                        todoSeleccionado={todoSeleccionado}
                        asignandoId={asignandoId}
                        asignandoLote={asignandoLote}
                        grupoFiltro={grupoFiltro}
                        onReintentar={cargar}
                        onToggleTodos={toggleTodos}
                        onSeleccionar={toggleSeleccion}
                        onAsignarRapido={handleAsignarRapido}
                        onAsignarLote={handleAsignarLote}
                        onAsignarManual={handleAsignarManual}
                        onCambiarGrupo={setGrupoFiltro}
                        filtros={filtros}
                        onFiltrar={handleFiltrar}
                        onLimpiarFiltros={handleLimpiarFiltros}
                        hayFiltrosActivos={hayFiltrosActivos}
                    />
                </div>

                {/* ── Columna derecha: gestores (altura propia, no se estira con la tabla) ── */}
                <div className="w-72 shrink-0 flex flex-col self-start max-h-full">
                    <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-semibold text-foreground">Gestores</span>
                            <span className="text-[10px] text-muted-foreground">({gestores.length})</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground"
                            onClick={() => cargarGestores()}
                            disabled={cargandoGestores}
                        >
                            <RefreshCw className={cn('h-3 w-3', cargandoGestores && 'animate-spin')} />
                        </Button>
                    </div>

                    {/* Leyenda */}
                    <div className="px-4 py-2 border-b border-border/40 flex items-center gap-3">
                        {[
                            { label: 'Libre', color: 'bg-emerald-500' },
                            { label: 'Ocupado', color: 'bg-amber-500' },
                            { label: 'Lleno', color: 'bg-destructive' },
                        ].map(l => (
                            <div key={l.label} className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${l.color}`} />
                                <span className="text-[10px] text-muted-foreground">{l.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex-1 min-h-0 overflow-y-auto">
                        {cargandoGestores ? (
                            <ListaGestoresSkeleton />
                        ) : gestores.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-12 text-center px-4">
                                <Users className="h-6 w-6 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">Sin gestores disponibles</p>
                            </div>
                        ) : (
                            gestores
                                .sort((a, b) => a.cargaActual - b.cargaActual)
                                .map(g => <GestorCard key={g.id} gestor={g} />)
                        )}
                    </div>

                    {gestores.length > 0 && (
                        <CargaDistribucion gestores={gestores} />
                    )}
                </div>
            </div>

            {/* Sheet asignación manual */}
            {sheetData && (
                <AsignacionSheet
                    open={!!sheetData}
                    onOpenChange={(v) => { if (!v) setSheetData(null) }}
                    solicitudIds={sheetData.solicitudIds}
                    folio={sheetData.folio}
                    gestorActualId={sheetData.gestorActualId}
                    onAsignado={() => {
                        cargar()
                        cargarGestores()
                        setSeleccionadas(new Set())
                        setSheetData(null)
                    }}
                />
            )}
            <AsignacionMasivaDialog
                open={dialogAsignacionOpen}
                onOpenChange={(open) => {
                    setDialogAsignacionOpen(open)
                    if (!open) reiniciarEstadoAsignacion()
                }}
                estado={estadoAsignacion}
                folioPorId={Object.fromEntries(solicitudes.map(s => [s.id, s.folio]))}
            />
        </div>
    )
}