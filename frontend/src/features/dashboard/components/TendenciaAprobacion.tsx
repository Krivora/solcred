'use client'

import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { cn } from '@/shared/lib/cn'
import { DashboardCard } from './DashboardCard'
import { makeChartTooltip } from './ChartTooltip'
import { formatPct } from '@/features/dashboard/lib/dashboard.format'
import { SECTOR_LABELS } from '@/shared/config/solicitudes.config'
import type { TendenciaAprobacion as TendenciaAprobacionData } from '@/features/dashboard/types/dashboard.types'

/**
 * Paleta categórica fija del design system (`--cat-1..6`) — se asigna en el
 * mismo orden en que llegan las series, nunca se cicla ni se reasigna al
 * cambiar de vista (la identidad de cada programa/sector no depende de su
 * posición). Si algún día hay más de 6 series reales, las que sobren caen al
 * gris neutro en vez de inventar un séptimo tono.
 */
const CAT_COLORS = [
  'var(--color-cat-1)',
  'var(--color-cat-2)',
  'var(--color-cat-3)',
  'var(--color-cat-4)',
  'var(--color-cat-5)',
  'var(--color-cat-6)',
]

/** Mismo criterio que `ComposicionDemanda`: la cola larga agrupada como "Otros" va en gris neutro. */
const COLOR_OTROS = 'var(--color-muted-foreground)'

const LABELS: Record<string, string> = { ...SECTOR_LABELS, OTROS: 'Otros' }
const labelPara = (clave: string) => LABELS[clave] ?? clave

const esOtros = (clave: string) => clave.trim().toUpperCase() === 'OTROS'

function colorPorClave(clavesSinOtros: string[], clave: string): string {
  if (esOtros(clave)) return COLOR_OTROS
  const idx = clavesSinOtros.indexOf(clave)
  if (idx < 0) return COLOR_OTROS
  return CAT_COLORS[Math.min(idx, CAT_COLORS.length - 1)]
}

/**
 * El payload de recharts (`p`) ya trae el valor de cada serie bajo su `clave`,
 * en el mismo orden de inserción con el que se armó el punto — así el tooltip
 * no depende de `series`/`vista` por closure y puede vivir a nivel de módulo,
 * igual que `TrendTooltip` en `TendenciaFlujo`.
 */
const TrendTooltip = makeChartTooltip((p, label) => {
  const claves = Object.keys(p).filter((k) => k !== 'periodo')
  const clavesSinOtros = claves.filter((c) => !esOtros(c))
  return {
    title: label ? `Periodo ${label}` : 'Periodo',
    rows: claves
      .filter((c) => p[c] != null)
      .map((c) => ({
        label: labelPara(c),
        value: formatPct(p[c] as number | null),
        color: colorPorClave(clavesSinOtros, c),
      })),
  }
})

type Vista = 'programa' | 'sector'

export function TendenciaAprobacion({ tendencia }: { tendencia: TendenciaAprobacionData }) {
  const [vista, setVista] = useState<Vista>('programa')
  const series = vista === 'programa' ? tendencia.porPrograma : tendencia.porSector

  const clavesSinOtros = useMemo(
    () => series.filter((s) => !esOtros(s.clave)).map((s) => s.clave),
    [series],
  )

  const data = useMemo(
    () =>
      tendencia.periodos.map((periodo, i) => {
        const punto: Record<string, string | number | null> = { periodo }
        series.forEach((s) => {
          punto[s.clave] = s.porBucket[i] ?? null
        })
        return punto
      }),
    [tendencia.periodos, series],
  )

  return (
    <DashboardCard
      title="Tendencia de aprobación"
      description="Tasa de aprobación por programa/sector a lo largo del tiempo"
      aside={
        <div
          role="group"
          aria-label="Agrupar tendencia de aprobación"
          className="inline-flex overflow-hidden rounded-md border border-border"
        >
          {(['programa', 'sector'] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={vista === v}
              onClick={() => setVista(v)}
              className={cn(
                'px-2 py-1 text-caption transition-colors',
                vista === v
                  ? 'bg-brand font-medium text-brand-contrast'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {v === 'programa' ? 'Por programa' : 'Por sector'}
            </button>
          ))}
        </div>
      }
    >
      {series.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Sin dictámenes en el periodo.</p>
      ) : (
        <div className="h-65 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: -18 }}>
              <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="0" />
              <XAxis
                dataKey="periodo"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
                interval="preserveStartEnd"
                minTickGap={16}
              />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                width={40}
                tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip content={<TrendTooltip />} cursor={{ stroke: 'var(--color-border)', strokeWidth: 1 }} />
              <Legend
                verticalAlign="bottom"
                height={30}
                iconType="plainline"
                wrapperStyle={{ fontSize: 11 }}
                formatter={(value: string) => (
                  <span className="text-caption text-muted-foreground">{labelPara(value)}</span>
                )}
              />
              {series.map((s) => (
                <Line
                  key={s.clave}
                  type="monotone"
                  dataKey={s.clave}
                  name={s.clave}
                  stroke={colorPorClave(clavesSinOtros, s.clave)}
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                  activeDot={{ r: 3.5, strokeWidth: 2, stroke: 'var(--color-card)' }}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardCard>
  )
}
