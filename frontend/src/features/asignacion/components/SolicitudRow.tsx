'use client'

import { Loader2, Zap, Clock } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip'
import { cn } from '@/shared/lib/utils/cn'
import {
    ESTATUS_STYLES,
    SECTOR_LABELS,
    TAMANO_LABELS,
    formatMonto,
} from '@/shared/config/solicitudes.config'
import type { SolicitudPendiente } from '../types/asignacion.types'
import { SolicitanteCell } from '@/shared/components/ui/SolicitanteCell'

// ─── Helpers locales ──────────────────────────────────────────────────────────

function tiempoRelativo(fecha: string): string {
    const diff = Date.now() - new Date(fecha).getTime()
    const min = Math.floor(diff / 60_000)
    if (min < 60) return `hace ${min}m`
    const hrs = Math.floor(min / 60)
    if (hrs < 24) return `hace ${hrs}h`
    return `hace ${Math.floor(hrs / 24)}d`
}


function EstatusBadge({ estatus }: { estatus: string }) {
    const style = ESTATUS_STYLES[estatus] ?? ESTATUS_STYLES.BORRADOR
    return (
        <span className={cn(
            'shrink-0 hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-medium',
            style.className
        )}>
            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', style.dotClass)} />
            {style.label}
        </span>
    )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface SolicitudRowProps {
    solicitud: SolicitudPendiente
    seleccionada: boolean
    asignandoId: string | null
    onSeleccionar: (id: string) => void
    onAsignarRapido: (id: string) => void
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function SolicitudRow({
    solicitud,
    seleccionada,
    asignandoId,
    onSeleccionar,
    onAsignarRapido,
}: SolicitudRowProps) {
    const asignandoEsta = asignandoId === solicitud.id
    const monto = formatMonto(solicitud.montoSolicitado)

    return (
        <div
            onClick={() => onSeleccionar(solicitud.id)}
            className={cn(
                'group flex items-center gap-3 px-4 py-3 border-b border-border/40 cursor-pointer transition-colors duration-100',
                seleccionada
                    ? 'bg-primary/5 border-l-2 border-l-primary'
                    : 'hover:bg-accent/30'
            )}
        >
            {/* Checkbox visual */}
            <div className={cn(
                'shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors',
                seleccionada
                    ? 'bg-primary border-primary'
                    : 'border-border/60 group-hover:border-primary/40'
            )}>
                {seleccionada && (
                    <span className="text-primary-foreground text-[9px]">✓</span>
                )}
            </div>

            {/* Folio */}
            <span className="shrink-0 font-mono text-xs font-semibold text-primary/80 bg-primary/5 border border-primary/10 px-2 py-0.5 rounded-md w-28">
                {solicitud.folio}
            </span>

            {/* Tipo persona + Solicitante */}
            <div className="flex items-center gap-2 w-48 shrink-0 min-w-0">
                <SolicitanteCell datos={solicitud.datosSolicitante} tipoPersona={solicitud.tipoPersona} />
            </div>

            {/* Programa + Monto */}
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <p className="text-xs font-medium text-foreground truncate">
                    {solicitud.programa.nombre}
                </p>
                {monto
                    ? <span className="text-[11px] text-muted-foreground tabular-nums">{monto}</span>
                    : <span className="text-[11px] text-muted-foreground/40">Sin monto</span>
                }
            </div>

            {/* Sector + Tamaño */}
            <div className="hidden lg:flex flex-col gap-0.5 w-28 shrink-0">
                {solicitud.sector && (
                    <span className="text-xs font-medium text-foreground truncate">
                        {SECTOR_LABELS[solicitud.sector] ?? solicitud.sector}
                    </span>
                )}
                {solicitud.tamanoEmpresa
                    ? <span className="text-[11px] text-muted-foreground">{TAMANO_LABELS[solicitud.tamanoEmpresa]}</span>
                    : <span className="text-[11px] text-muted-foreground/40">—</span>
                }
            </div>

            {/* Estatus */}
            <EstatusBadge estatus={solicitud.estatus} />

            {/* Antigüedad */}
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
                        onClick={(e) => {
                            e.stopPropagation()
                            onAsignarRapido(solicitud.id)
                        }}
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