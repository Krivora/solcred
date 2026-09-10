'use client'

import { TrendingUp } from 'lucide-react'
import type { MetricasExpediente } from '@/features/expediente/types/expediente.types'
import { ESTATUS_DOCUMENTO, TONE, type EstatusDocumentoUI } from '@/shared/config/estatus.tokens'
import { cn } from '@/shared/lib/cn'

interface MetricasExpedientePanelProps {
    metricas: MetricasExpediente
}

// Cada fila del panel reutiliza el estatus de documento y su tono.
const STATS_CONFIG: { key: keyof MetricasExpediente; estatus: EstatusDocumentoUI }[] = [
    { key: 'totalAprobados', estatus: 'APROBADO' },
    { key: 'totalPendientes', estatus: 'PENDIENTE' },
    { key: 'totalRechazados', estatus: 'RECHAZADO' },
    { key: 'totalNoSubidos', estatus: 'NO_SUBIDO' },
]

export const MetricasExpedientePanel = ({ metricas }: MetricasExpedientePanelProps) => {
    const { totalRequeridos, totalAprobados, porcentajeCompletado } = metricas

    const radius = 34
    const stroke = 5
    const circumference = 2 * Math.PI * radius
    const dashOffset = circumference * (1 - porcentajeCompletado / 100)

    const progresoTone =
        porcentajeCompletado === 100 ? 'success' : porcentajeCompletado >= 60 ? 'info' : 'warning'

    return (
        <div className="rounded-lg border border-hairline bg-card overflow-hidden">
            {/* ── Encabezado ─────────────────────────────────────────── */}
            <div className="px-4 pt-4 pb-3 border-b border-hairline bg-surface-sunken">
                <div className="flex items-center gap-1.5">
                    <TrendingUp className="size-3.5 text-ink-subtle" />
                    <p className="text-label uppercase tracking-wide text-ink-subtle">
                        Progreso
                    </p>
                </div>
            </div>

            {/* ── Círculo de progreso ────────────────────────────────── */}
            <div className="flex flex-col items-center py-5 px-4 gap-1">
                <div className="relative inline-flex items-center justify-center">
                    <svg
                        width="88"
                        height="88"
                        viewBox="0 0 88 88"
                        className="-rotate-90"
                        aria-hidden="true"
                    >
                        {/* Track */}
                        <circle
                            cx="44"
                            cy="44"
                            r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={stroke}
                            className="text-hairline"
                        />
                        {/* Fill */}
                        <circle
                            cx="44"
                            cy="44"
                            r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={stroke}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashOffset}
                            className={cn('transition-[stroke-dashoffset,color] duration-700 ease-out', TONE[progresoTone].text)}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span
                            className={cn('text-title leading-none tabular-nums', TONE[progresoTone].text)}
                            role="progressbar"
                            aria-valuenow={porcentajeCompletado}
                            aria-valuemin={0}
                            aria-valuemax={100}
                        >
                            {porcentajeCompletado}%
                        </span>
                    </div>
                </div>

                <p className="text-body-sm font-medium text-ink leading-none mt-1 tabular-nums">
                    {totalAprobados}
                    <span className="text-ink-subtle font-normal">
                        /{totalRequeridos}
                    </span>
                </p>
                <p className="text-caption text-ink-subtle">documentos aprobados</p>
            </div>

            {/* ── Stats individuales ─────────────────────────────────── */}
            <div className="px-3 pb-4 space-y-2">
                {STATS_CONFIG.map(({ key, estatus }) => {
                    const value = metricas[key]
                    const pct = totalRequeridos > 0 ? Math.round((value / totalRequeridos) * 100) : 0
                    const { label, tone, icon: Icon } = ESTATUS_DOCUMENTO[estatus]

                    return (
                        <div
                            key={key}
                            className={cn(
                                'rounded-md px-3 py-2.5 ring-1 transition-opacity duration-200',
                                TONE[tone].chip,
                                value === 0 ? 'opacity-40' : 'opacity-100',
                            )}
                        >
                            {/* Fila superior: ícono + label + valor */}
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <Icon className="size-3 shrink-0" />
                                    <span className="text-caption truncate">
                                        {label}
                                    </span>
                                </div>
                                <span className="text-body-sm font-semibold tabular-nums shrink-0">
                                    {value}
                                </span>
                            </div>
                            {/* Barra de proporción */}
                            <div className="h-1 w-full rounded-full bg-hairline overflow-hidden">
                                <div
                                    className={cn('h-full rounded-full transition-all duration-700', TONE[tone].solid)}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
