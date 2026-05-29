// app/(dashboard)/dashboard/admin/asignacion/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import {
    RefreshCw, UserCheck, Zap, Filter, ChevronRight,
    Inbox, Users, AlertCircle, Clock, Loader2, ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { AsignacionSheet } from '@/components/admin/asignacion/AsignacionSheet'
import { CargaBadge } from '@/components/admin/asignacion/CargaBadge'
import { useAsignacion } from '@/lib/hooks/useAsignacion'
import { useGrupos } from '@/lib/hooks/useGrupos'
import { apiAuth } from '@/lib/api/client'
import type { GestorConCarga } from '@/lib/types/asignacion.types'
import { cn } from '@/lib/utils/cn'

// ─── Tipos locales ────────────────────────────────────────────────────────────

interface SolicitudPendiente {
    id: string
    folio: string
    programa: { nombre: string }
    solicitante: { nombre: string; apellidoPaterno: string }
    estatus: string
    tipoPersona: string | null
    sector: string | null
    montoSolicitado: number | null
    creadoEn: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function tiempoRelativo(fecha: string): string {
    const diff = Date.now() - new Date(fecha).getTime()
    const min = Math.floor(diff / 60_000)
    if (min < 60) return `hace ${min}m`
    const hrs = Math.floor(min / 60)
    if (hrs < 24) return `hace ${hrs}h`
    return `hace ${Math.floor(hrs / 24)}d`
}

function formatMonto(monto: number | null): string {
    if (!monto) return '—'
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(monto)
}

const ESTATUS_STYLES: Record<string, string> = {
    PENDIENTE: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/40',
    EN_REVISION: 'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/40',
    BORRADOR: 'bg-muted text-muted-foreground border-border/60',
}

// ─── Fila de solicitud ────────────────────────────────────────────────────────

function SolicitudRow({
    solicitud,
    seleccionada,
    onSeleccionar,
    onAsignarRapido,
    asignandoId,
}: {
    solicitud: SolicitudPendiente
    seleccionada: boolean
    onSeleccionar: (id: string) => void
    onAsignarRapido: (id: string) => void
    asignandoId: string | null
}) {
    const asignandoEsta = asignandoId === solicitud.id

    return (
        <div
            onClick={() => onSeleccionar(solicitud.id)}
            className={cn(
                'group flex items-center gap-3 px-4 py-3 border-b border-border/40 cursor-pointer transition-colors duration-100',
                seleccionada ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-accent/30'
            )}
        >
            {/* Checkbox visual */}
            <div className={cn(
                'shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors',
                seleccionada ? 'bg-primary border-primary' : 'border-border/60 group-hover:border-primary/40'
            )}>
                {seleccionada && <span className="text-primary-foreground text-[9px]">✓</span>}
            </div>

            {/* Folio */}
            <span className="shrink-0 font-mono text-xs font-semibold text-foreground w-24">{solicitud.folio}</span>

            {/* Solicitante */}
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                    {solicitud.solicitante.nombre} {solicitud.solicitante.apellidoPaterno}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">{solicitud.programa.nombre}</p>
            </div>

            {/* Monto */}
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground w-24 text-right hidden md:block">
                {formatMonto(solicitud.montoSolicitado)}
            </span>

            {/* Estatus */}
            <span className={cn(
                'shrink-0 hidden sm:inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-medium',
                ESTATUS_STYLES[solicitud.estatus] ?? ESTATUS_STYLES.BORRADOR
            )}>
                {solicitud.estatus.replace('_', ' ')}
            </span>

            {/* Tiempo */}
            <div className="shrink-0 flex items-center gap-1 text-[11px] text-muted-foreground w-16 justify-end">
                <Clock className="h-3 w-3" />
                {tiempoRelativo(solicitud.creadoEn)}
            </div>

            {/* Asignar rápido */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            'shrink-0 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity',
                            'text-muted-foreground hover:text-primary hover:bg-primary/10'
                        )}
                        onClick={(e) => { e.stopPropagation(); onAsignarRapido(solicitud.id) }}
                        disabled={!!asignandoId}
                    >
                        {asignandoEsta
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Zap className="h-3.5 w-3.5" />
                        }
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                    <p className="text-xs">Asignación automática</p>
                </TooltipContent>
            </Tooltip>
        </div>
    )
}

// ─── Tarjeta de gestor ────────────────────────────────────────────────────────

function GestorCard({ gestor }: { gestor: GestorConCarga }) {
    const iniciales = `${gestor.nombre[0]}${gestor.apellidoPaterno[0]}`.toUpperCase()
    const cargaRatio = gestor.cargaActual / 20
    const nivel = cargaRatio < 0.3 ? 'libre' : cargaRatio < 0.7 ? 'ocupado' : 'lleno'

    return (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40 last:border-0">
            <div className={cn(
                'shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold',
                nivel === 'libre' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
                    nivel === 'ocupado' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
                        'bg-destructive/10 text-destructive'
            )}>
                {iniciales}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                    {gestor.nombre} {gestor.apellidoPaterno}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">{gestor.correo}</p>
            </div>
            <CargaBadge carga={gestor.cargaActual} />
        </div>
    )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function AsignacionPage() {
    const { gestores, cargandoGestores, asignando, cargarGestores, asignarAutomaticamente } = useAsignacion()
    const { grupos } = useGrupos()

    const [solicitudes, setSolicitudes] = useState<SolicitudPendiente[]>([])
    const [cargandoSolicitudes, setCargandoSolicitudes] = useState(true)
    const [errorSolicitudes, setErrorSolicitudes] = useState<string | null>(null)

    const [seleccionadas, setSeleccionadas] = useState<Set<string>>(new Set())
    const [grupoFiltro, setGrupoFiltro] = useState<string>('todos')
    const [asignandoId, setAsignandoId] = useState<string | null>(null)
    const [asignandoLote, setAsignandoLote] = useState(false)

    // Sheet de asignación manual
    const [sheetData, setSheetData] = useState<{
        solicitudId: string
        folio: string
        gestorActualId?: string
    } | null>(null)

    const cargarSolicitudes = useCallback(async () => {
        try {
            setCargandoSolicitudes(true)
            setErrorSolicitudes(null)
            // Solicitudes PENDIENTE o EN_REVISION sin asignación activa
            const data = await apiAuth<SolicitudPendiente[]>(
                '/solicitudes?estatus=PENDIENTE,EN_REVISION&sinAsignar=true'
            )
            setSolicitudes(data)
        } catch (err: any) {
            setErrorSolicitudes(err.message ?? 'Error al cargar solicitudes')
        } finally {
            setCargandoSolicitudes(false)
        }
    }, [])

    useEffect(() => {
        cargarSolicitudes()
        cargarGestores()
    }, [cargarSolicitudes, cargarGestores])

    const toggleSeleccion = (id: string) => {
        setSeleccionadas(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    const toggleTodos = () => {
        if (seleccionadas.size === solicitudes.length) {
            setSeleccionadas(new Set())
        } else {
            setSeleccionadas(new Set(solicitudes.map(s => s.id)))
        }
    }

    const handleAsignarRapido = async (solicitudId: string) => {
        setAsignandoId(solicitudId)
        const ok = await asignarAutomaticamente(solicitudId, () => {
            setSolicitudes(prev => prev.filter(s => s.id !== solicitudId))
            setSeleccionadas(prev => { const n = new Set(prev); n.delete(solicitudId); return n })
        })
        setAsignandoId(null)
    }

    const handleAsignarLote = async () => {
        if (seleccionadas.size === 0) return
        setAsignandoLote(true)
        const ids = [...seleccionadas]
        for (const id of ids) {
            await asignarAutomaticamente(id, () => {
                setSolicitudes(prev => prev.filter(s => s.id !== id))
            })
        }
        setSeleccionadas(new Set())
        setAsignandoLote(false)
    }

    const solicitudesFiltradas = solicitudes.filter(s => {
        if (grupoFiltro === 'todos') return true
        // filtrado por grupo — en producción el backend lo haría
        return true
    })

    const haySeleccion = seleccionadas.size > 0
    const todoSeleccionado = solicitudes.length > 0 && seleccionadas.size === solicitudes.length

    return (
        <div className="flex flex-col h-full">

            {/* Header de página */}
            <div className="px-6 py-5 border-b border-border/60 flex items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <span>Admin</span>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-foreground font-medium">Cola de asignación</span>
                    </div>
                    <h1 className="text-lg font-semibold text-foreground">Cola de asignación</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 h-8 border-border/60 text-xs"
                        onClick={() => { cargarSolicitudes(); cargarGestores() }}
                        disabled={cargandoSolicitudes}
                    >
                        <RefreshCw className={cn('h-3.5 w-3.5', cargandoSolicitudes && 'animate-spin')} />
                        Actualizar
                    </Button>
                </div>
            </div>

            {/* Layout de dos columnas */}
            <div className="flex flex-1 overflow-hidden">

                {/* ─── Columna izquierda: solicitudes ───────────────────────── */}
                <div className="flex-1 flex flex-col min-w-0 border-r border-border/60">

                    {/* Toolbar */}
                    <div className="px-4 py-3 border-b border-border/40 flex items-center gap-3">

                        {/* Checkbox seleccionar todos */}
                        <div
                            onClick={toggleTodos}
                            className={cn(
                                'shrink-0 w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors',
                                todoSeleccionado ? 'bg-primary border-primary' : 'border-border/60 hover:border-primary/40'
                            )}
                        >
                            {todoSeleccionado && <span className="text-primary-foreground text-[9px]">✓</span>}
                            {!todoSeleccionado && haySeleccion && <span className="text-primary text-[9px]">—</span>}
                        </div>

                        {haySeleccion ? (
                            <div className="flex items-center gap-2 flex-1">
                                <span className="text-xs text-muted-foreground">{seleccionadas.size} seleccionadas</span>
                                <Button
                                    size="sm"
                                    className="h-7 gap-1.5 text-xs bg-primary hover:bg-primary/90"
                                    onClick={handleAsignarLote}
                                    disabled={asignandoLote}
                                >
                                    {asignandoLote ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                        <Zap className="h-3 w-3" />
                                    )}
                                    Asignar automáticamente
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 gap-1.5 text-xs border-border/60"
                                    onClick={() => {
                                        const primera = [...seleccionadas][0]
                                        const sol = solicitudes.find(s => s.id === primera)
                                        if (sol) setSheetData({ solicitudId: sol.id, folio: sol.folio })
                                    }}
                                >
                                    <UserCheck className="h-3 w-3" />
                                    Asignar manual
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 flex-1">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Inbox className="h-3.5 w-3.5" />
                                    <span>
                                        {cargandoSolicitudes
                                            ? 'Cargando...'
                                            : `${solicitudesFiltradas.length} pendientes`
                                        }
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Filtro por grupo */}
                        <Select value={grupoFiltro} onValueChange={setGrupoFiltro}>
                            <SelectTrigger className="h-7 w-auto text-xs border-border/60 gap-1.5 pl-2">
                                <Filter className="h-3 w-3 text-muted-foreground" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos los grupos</SelectItem>
                                {grupos.filter(g => g.activo).map(g => (
                                    <SelectItem key={g.id} value={g.id}>{g.nombre}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Lista */}
                    <div className="flex-1 overflow-y-auto">

                        {/* Header columnas */}
                        <div className="flex items-center gap-3 px-4 py-2 border-b border-border/40 bg-muted/30">
                            <div className="w-4 shrink-0" />
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground w-24">Folio</span>
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex-1">Solicitante / Programa</span>
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground w-24 text-right hidden md:block">Monto</span>
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hidden sm:block w-20">Estatus</span>
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground w-16 text-right">Antigüedad</span>
                            <div className="w-7 shrink-0" />
                        </div>

                        {cargandoSolicitudes ? (
                            <div className="flex flex-col">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-border/40">
                                        <Skeleton className="h-4 w-4 rounded" />
                                        <Skeleton className="h-4 w-24 rounded" />
                                        <Skeleton className="h-4 flex-1 rounded" />
                                        <Skeleton className="h-4 w-20 rounded hidden md:block" />
                                    </div>
                                ))}
                            </div>
                        ) : errorSolicitudes ? (
                            <div className="flex flex-col items-center gap-3 py-12 text-center px-6">
                                <AlertCircle className="h-8 w-8 text-destructive/60" />
                                <p className="text-sm text-muted-foreground">{errorSolicitudes}</p>
                                <Button variant="outline" size="sm" onClick={cargarSolicitudes} className="border-border/60">
                                    Reintentar
                                </Button>
                            </div>
                        ) : solicitudesFiltradas.length === 0 ? (
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
                        ) : (
                            solicitudesFiltradas.map(s => (
                                <SolicitudRow
                                    key={s.id}
                                    solicitud={s}
                                    seleccionada={seleccionadas.has(s.id)}
                                    onSeleccionar={toggleSeleccion}
                                    onAsignarRapido={handleAsignarRapido}
                                    asignandoId={asignandoId}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* ─── Columna derecha: gestores con carga ──────────────────── */}
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
                            <div className="flex flex-col">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-border/40">
                                        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                                        <Skeleton className="h-4 flex-1 rounded" />
                                        <Skeleton className="h-8 w-16 rounded-lg" />
                                    </div>
                                ))}
                            </div>
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

                    {/* Total carga */}
                    {gestores.length > 0 && (
                        <div className="px-4 py-3 border-t border-border/60 bg-muted/20">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Carga total</span>
                                <span className="font-semibold tabular-nums">
                                    {gestores.reduce((acc, g) => acc + g.cargaActual, 0)} casos
                                </span>
                            </div>
                            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                                {gestores.map((g, i) => {
                                    const total = gestores.reduce((acc, gg) => acc + gg.cargaActual, 0) || 1
                                    const w = (g.cargaActual / total) * 100
                                    const colors = ['bg-primary', 'bg-primary/70', 'bg-primary/50', 'bg-primary/30']
                                    return (
                                        <div
                                            key={g.id}
                                            className={`inline-block h-full ${colors[i % colors.length]}`}
                                            style={{ width: `${w}%` }}
                                            title={`${g.nombre}: ${g.cargaActual} casos`}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sheet de asignación manual */}
            {sheetData && (
                <AsignacionSheet
                    open={!!sheetData}
                    onOpenChange={(v) => { if (!v) setSheetData(null) }}
                    solicitudId={sheetData.solicitudId}
                    folio={sheetData.folio}
                    gestorActualId={sheetData.gestorActualId}
                    onAsignado={() => {
                        cargarSolicitudes()
                        cargarGestores()
                        setSeleccionadas(new Set())
                    }}
                />
            )}
        </div>
    )
}