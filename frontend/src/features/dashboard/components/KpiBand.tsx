import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Sparkline } from './Sparkline'
import {
  formatEntero,
  formatMontoCompacto,
  formatDias,
  formatPct,
  formatDelta,
  tonoDelta,
  RANGO_LABELS,
} from '@/features/dashboard/lib/dashboard.format'
import type { Panorama } from '@/features/dashboard/types/dashboard.types'

type Tono = 'up' | 'down' | 'flat'

interface Tile {
  key: string
  label: string
  value: string
  hint: string
  delta: string | null
  tono: Tono
  spark?: (number | null)[]
  accent?: 'primary' | 'success' | 'warning'
}

function buildTiles(p: Panorama): Tile[] {
  const k = p.kpis
  const sp = p.tendencia.sparklines

  return [
    {
      key: 'activas',
      label: 'Solicitudes activas',
      value: formatEntero(k.activas.valor),
      hint: 'en proceso ahora mismo',
      delta: null,
      tono: 'flat',
      accent: 'primary',
    },
    {
      key: 'recibidas',
      label: `Recibidas · ${RANGO_LABELS[p.rango]}`,
      value: formatEntero(k.recibidas.valor),
      hint: 'vs. periodo anterior',
      delta: formatDelta(k.recibidas.delta, 'pct'),
      tono: tonoDelta(k.recibidas.delta, k.recibidas.deltaTipo),
      spark: sp.recibidas,
    },
    {
      key: 'tasa',
      label: 'Tasa de aprobación',
      value: formatPct(k.tasaAprobacion.valor),
      hint: 'aprobadas / dictaminadas',
      delta: formatDelta(k.tasaAprobacion.delta, 'puntos'),
      tono: tonoDelta(k.tasaAprobacion.delta, k.tasaAprobacion.deltaTipo),
      spark: sp.tasaAprobacion,
    },
    {
      key: 'resolucion',
      label: 'Resolución de punta a punta',
      value: formatDias(k.tiempoResolucion.valor),
      hint: 'promedio del periodo',
      delta: formatDelta(k.tiempoResolucion.delta, 'dias'),
      tono: tonoDelta(k.tiempoResolucion.delta, k.tiempoResolucion.deltaTipo),
      spark: sp.tiempoResolucion,
      accent: 'success',
    },
    {
      key: 'pipeline',
      label: 'Monto en pipeline',
      value: formatMontoCompacto(k.montoPipeline.valor),
      hint: 'solicitado, sin dictaminar',
      delta: null,
      tono: 'flat',
      accent: 'primary',
    },
    {
      key: 'aprobado',
      label: 'Monto aprobado en el periodo',
      value: formatMontoCompacto(k.montoAprobado.valor),
      hint: 'vs. periodo anterior',
      delta: formatDelta(k.montoAprobado.delta, 'pct'),
      tono: tonoDelta(k.montoAprobado.delta, k.montoAprobado.deltaTipo),
      accent: 'success',
    },
  ]
}

const ACCENT_BAR: Record<string, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
}

const DELTA_STYLES: Record<Tono, string> = {
  up: 'text-success bg-success/10',
  down: 'text-destructive bg-destructive/10',
  flat: 'text-muted-foreground bg-muted',
}

export function KpiBand({ panorama }: { panorama: Panorama }) {
  const tiles = buildTiles(panorama)

  return (
    <section
      aria-label="Indicadores clave"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
    >
      {tiles.map((t) => {
        const DeltaIcon = t.tono === 'up' ? TrendingUp : t.tono === 'down' ? TrendingDown : Minus
        return (
          <article
            key={t.key}
            className="relative flex flex-col gap-2.5 overflow-hidden rounded-xl border border-border/70 bg-card p-3.5 shadow-sm"
          >
            <span className={cn('absolute inset-y-0 left-0 w-[3px]', ACCENT_BAR[t.accent ?? 'primary'])} />
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t.label}
            </p>
            <p className="font-mono text-[26px] font-semibold leading-none tracking-tight text-foreground tabular-nums">
              {t.value}
            </p>
            <div className="mt-auto flex min-h-[22px] items-center gap-2">
              {t.delta && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold',
                    DELTA_STYLES[t.tono],
                  )}
                >
                  <DeltaIcon className="size-3" />
                  {t.delta}
                </span>
              )}
              {t.spark && <Sparkline data={t.spark} className="ml-auto" />}
            </div>
            <p className="text-[11px] text-muted-foreground/80">{t.hint}</p>
          </article>
        )
      })}
    </section>
  )
}
