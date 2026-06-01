'use client'

import { useEffect, useState, useCallback } from 'react'
import { RefreshCw, ChevronRight, Users } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { GestorCard } from '@/components/admin/asignacion/GestorCard'
import { AsignacionSheet } from '@/components/admin/asignacion/AsignacionSheet'
import { useAsignacion } from '@/lib/hooks/useAsignacion'
import { useGrupos } from '@/lib/hooks/useGrupos'
import { apiAuth } from '@/lib/api/client'
import { cn } from '@/lib/utils/cn'
import type { SolicitudPendiente, GestorConCarga } from '@/lib/types/asignacion.types'
import { SolicitudesPanel } from '@/components/admin/asignacion/SolicitudesPanel'

// ─── Tipos locales ────────────────────────────────────────────────────────────

interface SheetData {
    solicitudId: string
    folio: string
    gestorActualId?: string
}

// ─── Hooks de datos ───────────────────────────────────────────────────────────

function useSolicitudesPendientes() {
    const [solicitudes, setSolicitudes] = useState<SolicitudPendiente[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const cargar = useCallback(async () => {
        try {
            setCargando(true)
            setError(null)
            const data = await apiAuth<SolicitudPendiente[]>(
                '/admin/solicitudes?estatus=PENDIENTE,EN_REVISION&sinAsignar=true'
            )
            setSolicitudes(data)
        } catch (err: any) {
            setError(err.message ?? 'Error al cargar solicitudes')
        } finally {
            setCargando(false)
        }
    }, [])

    const remover = useCallback((id: string) => {
        setSolicitudes(prev => prev.filter(s => s.id !== id))
    }, [])

    return { solicitudes, cargando, error, cargar, remover }
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

// ─── Página ───────────────────────────────────────────────────────────────────

export default function AsignacionPage() {
    const { gestores, cargandoGestores, asignarAutomaticamente, cargarGestores } = useAsignacion()
    const { grupos } = useGrupos()
    const { solicitudes, cargando, error, cargar, remover } = useSolicitudesPendientes()

    const [seleccionadas, setSeleccionadas] = useState<Set<string>>(new Set())
    const [grupoFiltro, setGrupoFiltro] = useState('todos')
    const [asignandoId, setAsignandoId] = useState<string | null>(null)
    const [asignandoLote, setAsignandoLote] = useState(false)
    const [sheetData, setSheetData] = useState<SheetData | null>(null)

    useEffect(() => {
        cargar()
        cargarGestores()
    }, [cargar, cargarGestores])

    // ── Selección ──────────────────────────────────────────────────────────────

    const toggleSeleccion = (id: string) => {
        setSeleccionadas(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
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

    // ── Asignación ─────────────────────────────────────────────────────────────

    const handleAsignarRapido = async (solicitudId: string) => {
        setAsignandoId(solicitudId)
        await asignarAutomaticamente(solicitudId, () => {
            remover(solicitudId)
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
        for (const id of [...seleccionadas]) {
            await asignarAutomaticamente(id, () => remover(id))
        }
        setSeleccionadas(new Set())
        setAsignandoLote(false)
    }

    const handleAsignarManual = () => {
        const primera = [...seleccionadas][0]
        const sol = solicitudes.find(s => s.id === primera)
        if (sol) setSheetData({ solicitudId: sol.id, folio: sol.folio })
    }

    // ── Filtrado ───────────────────────────────────────────────────────────────

    // El filtrado por grupo se delega al backend en producción;
    // aquí se mantiene como pass-through listo para extenderse.
    const solicitudesFiltradas = solicitudes

    const todoSeleccionado =
        solicitudes.length > 0 && seleccionadas.size === solicitudes.length

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col h-full">

            {/* Header */}
            <div className="px-6 py-5 border-b border-border/60 flex items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <span>Admin</span>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-foreground font-medium">Cola de asignación</span>
                    </div>
                    <h1 className="text-lg font-semibold text-foreground">Cola de asignación</h1>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 h-8 border-border/60 text-xs"
                    onClick={() => { cargar(); cargarGestores() }}
                    disabled={cargando}
                >
                    <RefreshCw className={cn('h-3.5 w-3.5', cargando && 'animate-spin')} />
                    Actualizar
                </Button>
            </div>

            {/* Layout dos columnas */}
            <div className="flex flex-1 overflow-hidden">

                {/* ── Columna izquierda: solicitudes ─────────────────────────── */}
                <div className="flex-1 flex flex-col min-w-0 border-r border-border/60">
                    <SolicitudesPanel
                        solicitudes={solicitudesFiltradas}
                        cargando={cargando}
                        error={error}
                        grupos={grupos}
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
                    />
                </div>

                {/* ── Columna derecha: gestores ──────────────────────────────── */}
                <div className="w-72 shrink-0 flex flex-col">

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

                    <div className="flex-1 overflow-y-auto">
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
                    solicitudId={sheetData.solicitudId}
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
        </div>
    )
}