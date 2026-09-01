'use client'

import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DashboardCard, CardLegend } from './DashboardCard'
import { makeChartTooltip } from './ChartTooltip'
import { formatMontoCompacto, formatPct } from '@/features/dashboard/lib/dashboard.format'
import type { CarteraPrograma } from '@/features/dashboard/types/dashboard.types'

const COLOR_SOL = 'var(--color-primary)'
const COLOR_APR = 'color-mix(in oklab, var(--color-primary) 38%, var(--color-card))'

const CarteraTooltip = makeChartTooltip((p) => {
  const sol = p.solicitado as number
  const apr = p.aprobado as number
  return {
    title: p.programa as string,
    rows: [
      { label: 'Solicitado', value: formatMontoCompacto(sol), color: COLOR_SOL },
      { label: 'Aprobado', value: formatMontoCompacto(apr), color: COLOR_APR },
      { label: 'Tasa de fondeo', value: formatPct(sol > 0 ? (apr / sol) * 100 : 0) },
    ],
  }
})

export function CarteraProgramas({ cartera }: { cartera: CarteraPrograma[] }) {
  return (
    <DashboardCard
      title="Cartera por programa"
      description="Monto solicitado y aprobado de lo recibido en el periodo"
      aside={
        <CardLegend
          items={[
            { label: 'Solicitado', color: COLOR_SOL },
            { label: 'Aprobado', color: COLOR_APR },
          ]}
        />
      }
    >
      {cartera.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Sin solicitudes en el periodo.
        </p>
      ) : (
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={cartera}
              margin={{ top: 2, right: 48, bottom: 2, left: 6 }}
              barGap={2}
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
              <Bar dataKey="solicitado" fill={COLOR_SOL} radius={[0, 3, 3, 0]} isAnimationActive={false}>
                <LabelList
                  dataKey="solicitado"
                  position="right"
                  formatter={(v: number) => formatMontoCompacto(v)}
                  style={{ fontSize: 10.5, fill: 'var(--color-foreground)', fontWeight: 600 }}
                />
              </Bar>
              <Bar dataKey="aprobado" fill={COLOR_APR} radius={[0, 3, 3, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardCard>
  )
}
