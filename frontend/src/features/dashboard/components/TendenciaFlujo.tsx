'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { DashboardCard, CardLegend } from './DashboardCard'
import { makeChartTooltip } from './ChartTooltip'
import { formatEntero } from '@/features/dashboard/lib/dashboard.format'
import type { PanoramaTendencia } from '@/features/dashboard/types/dashboard.types'

const COLOR_RECIBIDAS = 'var(--color-primary)'
const COLOR_RESUELTAS = 'var(--color-success)'

const TrendTooltip = makeChartTooltip((p, label) => ({
  title: label ? `Periodo ${label}` : 'Periodo',
  rows: [
    { label: 'Recibidas', value: formatEntero(p.recibidas as number), color: COLOR_RECIBIDAS },
    { label: 'Resueltas', value: formatEntero(p.resueltas as number), color: COLOR_RESUELTAS },
    {
      label: 'Rezago',
      value: formatEntero((p.recibidas as number) - (p.resueltas as number)),
    },
  ],
}))

export function TendenciaFlujo({ tendencia }: { tendencia: PanoramaTendencia }) {
  return (
    <DashboardCard
      title="Flujo de solicitudes"
      description={`Recibidas frente a resueltas · ${
        tendencia.modo === 'mensual' ? 'últimos 12 meses' : 'últimas 12 semanas'
      }`}
      aside={
        <CardLegend
          items={[
            { label: 'Recibidas', color: COLOR_RECIBIDAS },
            { label: 'Resueltas', color: COLOR_RESUELTAS },
          ]}
        />
      }
    >
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={tendencia.puntos} margin={{ top: 6, right: 8, bottom: 0, left: -18 }}>
            <defs>
              <linearGradient id="grad-recibidas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLOR_RECIBIDAS} stopOpacity={0.18} />
                <stop offset="100%" stopColor={COLOR_RECIBIDAS} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="grad-resueltas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLOR_RESUELTAS} stopOpacity={0.16} />
                <stop offset="100%" stopColor={COLOR_RESUELTAS} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="0" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
              interval="preserveStartEnd"
              minTickGap={16}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={40}
              tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
              allowDecimals={false}
            />
            <Tooltip
              content={<TrendTooltip />}
              cursor={{ stroke: 'var(--color-border)', strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="resueltas"
              stroke={COLOR_RESUELTAS}
              strokeWidth={2}
              fill="url(#grad-resueltas)"
              dot={false}
              activeDot={{ r: 3.5, strokeWidth: 2, stroke: 'var(--color-card)' }}
            />
            <Area
              type="monotone"
              dataKey="recibidas"
              stroke={COLOR_RECIBIDAS}
              strokeWidth={2}
              fill="url(#grad-recibidas)"
              dot={false}
              activeDot={{ r: 3.5, strokeWidth: 2, stroke: 'var(--color-card)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  )
}
