
'use client'

import { Loader2, Zap, Clock, Inbox, AlertCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/components/ui/table'
import { cn } from '@/shared/lib/cn'
import {
    ESTATUS_STYLES,
    SECTOR_LABELS,
    TAMANO_LABELS,
    formatMonto,
} from '@/shared/config/solicitudes.config'
import type { SolicitudAsignacion } from '@/features/promocion/types/asignacion.types'
import { SolicitanteCell } from '@/shared/components/common/SolicitanteCell'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function tiempoRelativo(fecha: string): string {
    const diff = Date.now() - new Date(fecha).getTime()
    const min = Math.floor(diff / 60_000)
    if (min < 60) return `hace ${min}m`
    const hrs = Math.floor(min / 60)
    if (hrs < 24) return `hace ${hrs}h`
    return `hace ${Math.floor(hrs / 24)}d`
}
function formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

function EstatusBadge({ estatus }: { estatus: string }) {
    const style = ESTATUS_STYLES[estatus] ?? ESTATUS_STYLES.BORRADOR
    return (
        <span className={cn(
            'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-medium whitespace-nowrap',
            style.className
        )}>
            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', style.dotClass)} />
            {style.label}
        </span>
    )
}

function ListaSkeleton() {
    return (
        <div className="rounded-xl border border-border/60 overflow-hidden bg-card">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/60">
                        {['', 'Folio', 'Solicitante', 'Programa / Monto', 'Sector / Tamaño', 'Estatus', 'Antigüedad', ''].map((h, i) => (
                            <TableHead key={i} className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest">
                                {h}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <TableRow key={i} className="border-b border-border/40">
                            {Array.from({ length: 8 }).map((_, j) => (
                                <TableCell key={j} className="py-3">
                                    <Skeleton className="h-4 w-full rounded-md" />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
function EstadoError({ mensaje, onReintentar }: { mensaje: string; onReintentar?: () => void }) {
    return (
        <div className="flex flex-col items-center gap-3 py-12 text-center px-6">
            <AlertCircle className="h-8 w-8 text-destructive/60" />
            <p className="text-sm text-muted-foreground">{mensaje}</p>
            {onReintentar && (
                <Button variant="outline" size="sm" onClick={onReintentar} className="border-border/60">
                    Reintentar
                </Button>
            )}
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

interface SolicitudesTableProps {
    solicitudes: SolicitudAsignacion[]
    seleccionadas: Set<string>
    asignandoId: string | null
    cargando?: boolean
    error?: string | null
    onSeleccionar: (id: string) => void
    onAsignarRapido: (id: string) => void
    onReintentar?: () => void
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function AsignacionSolicitudesTable({
    solicitudes,
    seleccionadas,
    asignandoId,
    cargando,
    error,
    onSeleccionar,
    onAsignarRapido,
    onReintentar,
}: SolicitudesTableProps) {
    if (cargando) return <ListaSkeleton />
    if (error) return <EstadoError mensaje={error} onReintentar={onReintentar} />
    if (solicitudes.length === 0) return <EstadoVacio />

    return (
        <div className="rounded-xl border border-border/60 overflow-hidden bg-card shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/60">
                        {[
                            { label: '', extra: 'w-8' },
                            { label: 'Folio', extra: 'w-20' },
                            { label: 'Solicitante', extra: 'w-44' },
                            { label: 'Programa / Monto', extra: 'w-20' },
                            { label: 'Sector / Tamaño', extra: 'w-20 hidden lg:table-cell' },
                            { label: 'Estatus', extra: 'w-20 hidden sm:table-cell' },
                            { label: 'Antigüedad', extra: 'w-20 text-right' },
                            { label: 'Gestor', extra: 'w-10' },
                            { label: '', extra: 'w-8' },
                        ].map(({ label, extra }, i) => (
                            <TableHead
                                key={label || i}
                                className={cn(
                                    'text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest py-3',
                                    extra
                                )}
                            >
                                {label}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {solicitudes.map(s => (
                        <SolicitudRow
                            key={s.id}
                            solicitud={s}
                            seleccionada={seleccionadas.has(s.id)}
                            asignandoId={asignandoId}
                            onSeleccionar={onSeleccionar}
                            onAsignarRapido={onAsignarRapido}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

// ─── Row ─────────────────────────────────────────────────────────────────────

interface SolicitudRowProps {
    solicitud: SolicitudAsignacion
    seleccionada: boolean
    asignandoId: string | null
    onSeleccionar: (id: string) => void
    onAsignarRapido: (id: string) => void
}

function SolicitudRow({
    solicitud,
    seleccionada,
    asignandoId,
    onSeleccionar,
    onAsignarRapido,
}: SolicitudRowProps) {
    const asignandoEsta = asignandoId === solicitud.id
    const monto = formatMonto(solicitud.montoSolicitado)
    return (
        <TableRow
            onClick={() => onSeleccionar(solicitud.id)}
            className={cn(
                'cursor-pointer transition-colors duration-100 border-b border-border/40 last:border-0 group',
                seleccionada
                    ? 'bg-primary/5 border-l-2 border-l-primary'
                    : 'hover:bg-accent/40'
            )}
        >
            {/* Checkbox */}
            <TableCell className="py-3">
                <div className={cn(
                    'w-4 h-4 rounded border flex items-center justify-center transition-colors',
                    seleccionada
                        ? 'bg-primary border-primary'
                        : 'border-border/60 group-hover:border-primary/40'
                )}>
                    {seleccionada && (
                        <span className="text-primary-foreground text-[9px]">✓</span>
                    )}
                </div>
            </TableCell>

            {/* Folio */}
            <TableCell className="py-3">
                <span className="font-mono text-xs font-semibold text-primary/80 bg-primary/5 border border-primary/10 px-2 py-0.5 rounded-md">
                    {solicitud.folio}
                </span>
            </TableCell>

            {/* Solicitante */}
            <TableCell className="py-3">
                <SolicitanteCell
                    datos={solicitud.datosSolicitante}
                    tipoPersona={solicitud.tipoPersona}
                />
            </TableCell>

            {/* Programa + Monto */}
            <TableCell className="py-3">
                <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-foreground leading-tight">
                        {solicitud.programa.nombre}
                    </span>
                    {monto
                        ? <span className="text-xs text-muted-foreground tabular-nums">{monto}</span>
                        : <span className="text-xs text-muted-foreground/40">Sin monto</span>
                    }
                </div>
            </TableCell>

            {/* Sector + Tamaño */}
            <TableCell className="py-3 hidden lg:table-cell">
                <div className="flex flex-col gap-0.5">
                    {solicitud.sector
                        ? <span className="text-xs font-medium text-foreground">
                            {SECTOR_LABELS[solicitud.sector] ?? solicitud.sector}
                        </span>
                        : <span className="text-xs text-muted-foreground/40">—</span>
                    }
                    {solicitud.tamanoEmpresa
                        ? <span className="text-xs text-muted-foreground">{TAMANO_LABELS[solicitud.tamanoEmpresa]}</span>
                        : <span className="text-xs text-muted-foreground/40">—</span>
                    }
                </div>
            </TableCell>

            {/* Estatus */}
            <TableCell className="py-3 hidden sm:table-cell">
                <EstatusBadge estatus={solicitud.estatus} />
            </TableCell>

            {/* Antigüedad */}
            <TableCell className="py-3 text-right">
                <div className="inline-flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                    <Clock className="h-3 w-3 shrink-0" />
                    {tiempoRelativo(solicitud.creadoEn)}
                </div>
            </TableCell>

            <TableCell className="py-3">
                {solicitud.asignacion ? (
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-medium text-foreground leading-tight">
                            {solicitud.asignacion.gestor.nombre} {solicitud.asignacion.gestor.apellidoPaterno}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                            {formatFecha(solicitud.asignacion.fechaAsignacion)}
                        </span>
                    </div>
                ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/50 bg-muted/40 border border-border/40 px-2 py-0.5 rounded-md">
                        Sin asignar
                    </span>
                )}
            </TableCell>

            {/* Asignar rápido */}
            <TableCell className="py-3" onClick={e => e.stopPropagation()}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => onAsignarRapido(solicitud.id)}
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
            </TableCell>
        </TableRow>
    )
}