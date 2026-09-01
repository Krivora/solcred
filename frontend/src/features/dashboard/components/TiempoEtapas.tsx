'use client'

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Minus } from 'lucide-react'
import { DashboardCard } from './DashboardCard'
import { makeChartTooltip } from './ChartTooltip'
import type { PanoramaTiempoPorEtapa } from '@/features/dashboard/types/dashboard.types'

const EtapaTooltip = makeChartTooltip((p) => ({
  title: p.label as string,
  rows: [
    { label: 'Permanencia media', value: `${(p.dias as number).toFixed(1)} d` },
    { label: 'Casos medidos', value: String(p.muestras ?? 0) },
  ],
}))

export function TiempoEtapas({ data }: { data: PanoramaTiempoPorEtapa }) {
  const filas = data.etapas
  const max = Math.max(data.slaDias, ...filas.map((e) => e.dias)) * 1.1

  return (
    <DashboardCard
      title="Dónde se atora"
      description="Tiempo promedio de permanencia por etapa (últimos 120 días)"
      aside={
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Minus className="size-3" strokeWidth={3} /> objetivo {data.slaDias.toFixed(1)} d
        </span>
      }
    >
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={filas}
            margin={{ top: 2, right: 32, bottom: 2, left: 6 }}
            barCategoryGap={6}
          >
            <XAxis type="number" domain={[0, max]} hide />
            <YAxis
              type="category"
              dataKey="label"
              tickLine={false}
              axisLine={false}
              width={104}
              tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
            />
            <Tooltip content={<EtapaTooltip />} cursor={{ fill: 'var(--color-muted)', opacity: 0.4 }} />
            <ReferenceLine
              x={data.slaDias}
              stroke="var(--color-muted-foreground)"
              strokeDasharray="3 3"
            />
            <Bar dataKey="dias" radius={[0, 4, 4, 0]} isAnimationActive={false}>
              {filas.map((e) => (
                <Cell
                  key={e.estatus}
                  fill={
                    e.estatus === data.peorEtapa ? 'var(--color-warning)' : 'var(--color-primary)'
                  }
                />
              ))}
              <LabelList
                dataKey="dias"
                position="right"
                formatter={(v: number) => `${v.toFixed(1)} d`}
                style={{ fontSize: 11, fill: 'var(--color-foreground)', fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  )
}
