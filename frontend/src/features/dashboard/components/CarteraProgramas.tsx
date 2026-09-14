'use client'

import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DashboardCard } from './DashboardCard'
import { makeChartTooltip } from './ChartTooltip'
import { formatEntero, formatPct } from '@/features/dashboard/lib/dashboard.format'
import type { CarteraPrograma } from '@/features/dashboard/types/dashboard.types'

const COLOR_SOLICITUDES = 'var(--color-brand)'

const CarteraTooltip = makeChartTooltip((p) => ({
  title: p.programa as string,
  rows: [
    { label: 'Solicitudes', value: formatEntero(p.solicitudes as number), color: COLOR_SOLICITUDES },
    { label: 'Tasa de aprobación', value: formatPct(p.tasaAprobacion as number | null) },
  ],
}))

export function CarteraProgramas({ cartera }: { cartera: CarteraPrograma[] }) {
  return (
    <DashboardCard
      title="Solicitudes por programa"
      description="Volumen y tasa de aprobación de lo recibido en el periodo"
    >
      {cartera.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Sin solicitudes en el periodo.
        </p>
      ) : (
        <div className="h-55 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={cartera}
              margin={{ top: 2, right: 56, bottom: 2, left: 6 }}
              barCategoryGap={10}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="programa"
                tickLine={false}
                axisLine={false}
                width={112}
                tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
              />
              <Tooltip content={<CarteraTooltip />} cursor={{ fill: 'var(--color-muted)', opacity: 0.4 }} />
              <Bar dataKey="solicitudes" fill={COLOR_SOLICITUDES} radius={[0, 3, 3, 0]} isAnimationActive={false}>
                <LabelList
                  dataKey="solicitudes"
                  position="right"
                  formatter={(v: number) => formatEntero(v)}
                  style={{ fontSize: 10.5, fill: 'var(--color-foreground)', fontWeight: 600 }}
                />
                <LabelList
                  dataKey="tasaAprobacion"
                  position="right"
                  offset={34}
                  formatter={(v: number | null) => (v == null ? '' : formatPct(v))}
                  style={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardCard>
  )
}
