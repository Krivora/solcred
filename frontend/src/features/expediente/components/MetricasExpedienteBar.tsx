'use client'

import { CheckCircle2, XCircle, Clock, Upload, TrendingUp } from 'lucide-react'
import type { MetricasExpediente } from '@/features/expediente/types/expediente.types'

interface MetricasExpedientePanelProps {
    metricas: MetricasExpediente
}

const STATS_CONFIG = [
    {
        key: 'totalAprobados' as const,
        icon: CheckCircle2,
        label: 'Aprobados',
        colorText: 'text-emerald-600 dark:text-emerald-400',
        colorBg: 'bg-emerald-50 dark:bg-emerald-950/40',
        colorRing: 'ring-emerald-200/80 dark:ring-emerald-900/70',
        barColor: 'bg-emerald-400',
    },
    {
        key: 'totalPendientes' as const,
        icon: Clock,
        label: 'En revisión',
        colorText: 'text-amber-600 dark:text-amber-400',
        colorBg: 'bg-amber-50 dark:bg-amber-950/40',
        colorRing: 'ring-amber-200/80 dark:ring-amber-900/70',
        barColor: 'bg-amber-400',
    },
    {
        key: 'totalRechazados' as const,
        icon: XCircle,
        label: 'Rechazados',
        colorText: 'text-red-500 dark:text-red-400',
        colorBg: 'bg-red-50 dark:bg-red-950/40',
        colorRing: 'ring-red-200/80 dark:ring-red-900/70',
        barColor: 'bg-red-400',
    },
    {
        key: 'totalNoSubidos' as const,
        icon: Upload,
        label: 'Sin subir',
        colorText: 'text-slate-500 dark:text-slate-400',
        colorBg: 'bg-slate-50 dark:bg-slate-800/50',
        colorRing: 'ring-slate-200/80 dark:ring-slate-700/70',
        barColor: 'bg-slate-300 dark:bg-slate-600',
    },
]

export const MetricasExpedientePanel = ({ metricas }: MetricasExpedientePanelProps) => {
    const { totalRequeridos, totalAprobados, porcentajeCompletado } = metricas

    const radius = 34
    const stroke = 5
    const circumference = 2 * Math.PI * radius
    const dashOffset = circumference * (1 - porcentajeCompletado / 100)

    const progressColor =
        porcentajeCompletado === 100
            ? '#10b981'
            : porcentajeCompletado >= 60
                ? '#3b82f6'
                : '#f59e0b'

    return (
        <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
            {/* ── Encabezado ─────────────────────────────────────────── */}
            <div className="px-4 pt-4 pb-3 border-b border-border bg-muted/30">
                <div className="flex items-center gap-1.5 mb-0.5">
                    <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
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
                            className="text-muted/40"
                        />
                        {/* Fill */}
                        <circle
                            cx="44"
                            cy="44"
                            r={radius}
                            fill="none"
                            stroke={progressColor}
                            strokeWidth={stroke}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashOffset}
                            style={{
                                transition: 'stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1), stroke 0.4s ease',
                            }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                        <span
                            className="text-xl font-bold leading-none tabular-nums"
                            style={{ color: progressColor }}
                        >
                            {porcentajeCompletado}%
                        </span>
                    </div>
                </div>

                <p className="text-sm font-semibold text-foreground leading-none mt-1">
                    {totalAprobados}
                    <span className="text-muted-foreground font-normal text-sm">
                        /{totalRequeridos}
                    </span>
                </p>
                <p className="text-[11px] text-muted-foreground">documentos aprobados</p>
            </div>

            {/* ── Stats individuales ─────────────────────────────────── */}
            <div className="px-3 pb-4 space-y-2">
                {STATS_CONFIG.map(({ key, icon: Icon, label, colorText, colorBg, colorRing, barColor }) => {
                    const value = metricas[key]
                    const pct = totalRequeridos > 0 ? Math.round((value / totalRequeridos) * 100) : 0

                    return (
                        <div
                            key={key}
                            className={`
                                rounded-lg px-3 py-2.5
                                ${colorBg} ring-1 ${colorRing}
                                transition-opacity duration-200
                                ${value === 0 ? 'opacity-35' : 'opacity-100'}
                            `}
                        >
                            {/* Fila superior: ícono + label + valor */}
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <Icon className={`h-3 w-3 ${colorText} shrink-0`} />
                                    <span className="text-[11px] text-muted-foreground truncate">
                                        {label}
                                    </span>
                                </div>
                                <span className={`text-sm font-bold tabular-nums ${colorText} shrink-0`}>
                                    {value}
                                </span>
                            </div>
                            {/* Barra de proporción */}
                            <div className="h-1 w-full rounded-full bg-foreground/10 overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${barColor} transition-all duration-700`}
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