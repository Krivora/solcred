'use client'

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { DashboardCard } from './DashboardCard'
import { formatEntero, formatPct } from '@/features/dashboard/lib/dashboard.format'
import { RANGO_LABELS } from '@/features/dashboard/lib/dashboard.format'
import type { PanoramaResolucion, RangoDashboard } from '@/features/dashboard/types/dashboard.types'

interface Props {
  resolucion: PanoramaResolucion
  rango: RangoDashboard
}

export function ResolucionDonut({ resolucion, rango }: Props) {
  const segmentos = [
    { key: 'aprobadas', label: 'Aprobadas', valor: resolucion.aprobadas, color: 'var(--color-success)' },
    { key: 'rechazadas', label: 'Rechazadas', valor: resolucion.rechazadas, color: 'var(--color-destructive)' },
    { key: 'canceladas', label: 'Canceladas', valor: resolucion.canceladas, color: 'var(--color-muted-foreground)' },
  ]
  const hayDatos = resolucion.total > 0

  return (
    <DashboardCard
      title="Resolución"
      description={`Casos dictaminados · últimos ${RANGO_LABELS[rango]}`}
    >
      <div className="flex flex-wrap items-center gap-5">
        <div className="relative h-[150px] w-[150px] shrink-0">
          {hayDatos ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={segmentos}
                  dataKey="valor"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={70}
                  paddingAngle={2}
                  stroke="var(--color-card)"
                  strokeWidth={2}
                  startAngle={90}
                  endAngle={-270}
                  isAnimationActive={false}
                >
                  {segmentos.map((s) => (
                    <Cell key={s.key} fill={s.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="absolute inset-0 rounded-full border-[13px] border-muted" />
          )}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold tracking-tight text-foreground tabular-nums">
              {formatPct(resolucion.tasaAprobacion)}
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
              Aprobación
            </span>
          </div>
        </div>

        <ul className="min-w-[150px] flex-1 space-y-2">
          {segmentos.map((s) => {
            const pct = resolucion.total > 0 ? Math.round((s.valor / resolucion.total) * 100) : 0
            return (
              <li key={s.key} className="flex items-center gap-2.5 text-[13px]">
                <span className="size-2.5 rounded-sm" style={{ background: s.color }} />
                <span className="text-muted-foreground">{s.label}</span>
                <span className="ml-auto font-semibold text-foreground tabular-nums">
                  {formatEntero(s.valor)}
                </span>
                <span className="w-9 text-right text-[11px] text-muted-foreground tabular-nums">{pct}%</span>
              </li>
            )
          })}
          <li className="flex items-center gap-2.5 border-t border-border pt-2 text-[13px]">
            <span className="text-muted-foreground">Total dictaminadas</span>
            <span className="ml-auto font-semibold text-foreground tabular-nums">
              {formatEntero(resolucion.total)}
            </span>
          </li>
        </ul>
      </div>
    </DashboardCard>
  )
}
