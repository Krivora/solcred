'use client'

import { Card, CardContent } from '@/shared/components/ui/card'
import { CheckCircle2, XCircle, Clock, Upload, TrendingUp } from 'lucide-react'
import type { MetricasExpediente } from '@/shared/lib/types/expediente.types'

interface MetricasExpedienteBarProps {
    metricas: MetricasExpediente
}

export const MetricasExpedienteBar = ({ metricas }: MetricasExpedienteBarProps) => {
    const {
        totalRequeridos,
        totalAprobados,
        totalPendientes,
        totalRechazados,
        totalNoSubidos,
        porcentajeCompletado,
    } = metricas

    const stats = [
        {
            icon: CheckCircle2,
            label: 'Aprobados',
            value: totalAprobados,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
        },
        {
            icon: Clock,
            label: 'En revisión',
            value: totalPendientes,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
        },
        {
            icon: XCircle,
            label: 'Rechazados',
            value: totalRechazados,
            color: 'text-red-600',
            bg: 'bg-red-50',
        },
        {
            icon: Upload,
            label: 'Sin subir',
            value: totalNoSubidos,
            color: 'text-slate-500',
            bg: 'bg-slate-50',
        },
    ]

    return (
        <Card>
            <CardContent className="pt-4 pb-4">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Progreso circular simple */}
                    <div className="flex items-center gap-3 pr-4 border-r border-border">
                        <div className="relative flex items-center justify-center w-14 h-14">
                            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                                <circle
                                    cx="28"
                                    cy="28"
                                    r="22"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    className="text-muted/40"
                                />
                                <circle
                                    cx="28"
                                    cy="28"
                                    r="22"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeDasharray={`${2 * Math.PI * 22}`}
                                    strokeDashoffset={`${2 * Math.PI * 22 * (1 - porcentajeCompletado / 100)}`}
                                    className="text-primary transition-all duration-700"
                                />
                            </svg>
                            <span className="absolute text-sm font-bold">{porcentajeCompletado}%</span>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Completado</p>
                            <p className="text-sm font-semibold">
                                {totalAprobados}/{totalRequeridos}
                            </p>
                            <p className="text-xs text-muted-foreground">requeridos</p>
                        </div>
                    </div>

                    {/* Stats individuales */}
                    <div className="flex flex-wrap gap-3 flex-1">
                        {stats.map(({ icon: Icon, label, value, color, bg }) => (
                            <div
                                key={label}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${bg}`}
                            >
                                <Icon className={`h-4 w-4 ${color}`} />
                                <div>
                                    <p className={`text-base font-bold leading-none ${color}`}>{value}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}