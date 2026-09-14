import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Sparkline } from './Sparkline'
import {
  formatEntero,
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
  /** El único número que además del héroe merece dominar la pantalla. */
  enfasis?: boolean
}

const DELTA_STYLES: Record<Tono, string> = {
  up: 'text-ok-ink bg-ok-surface',
  down: 'text-danger-ink bg-danger-surface',
  flat: 'text-muted-foreground bg-muted',
}

/**
 * Tira de KPIs secundarios. `activas` y `tiempoResolucion` ya viven en el
 * veredicto del héroe (`PipelineMesas`) — aquí solo van los que responden
 * "¿estamos originando bien?": volumen y calidad de dictamen. La tasa de
 * aprobación es la pregunta que más le importa a la gerencia día a día, así
 * que es la única con énfasis de tamaño.
 */
export function KpiBand({ panorama }: { panorama: Panorama }) {
  const k = panorama.kpis
  const sp = panorama.tendencia.sparklines

  const tiles: Tile[] = [
    {
      key: 'tasa',
      label: 'Tasa de aprobación',
      value: formatPct(k.tasaAprobacion.valor),
      hint: 'aprobadas / dictaminadas',
      delta: formatDelta(k.tasaAprobacion.delta, 'puntos'),
      tono: tonoDelta(k.tasaAprobacion.delta, k.tasaAprobacion.deltaTipo),
      spark: sp.tasaAprobacion,
      enfasis: true,
    },
    {
      key: 'recibidas',
      label: `Recibidas · ${RANGO_LABELS[panorama.rango]}`,
      value: formatEntero(k.recibidas.valor),
      hint: 'vs. periodo anterior',
      delta: formatDelta(k.recibidas.delta, 'pct'),
      tono: tonoDelta(k.recibidas.delta, k.recibidas.deltaTipo),
      spark: sp.recibidas,
    },
  ]

  return (
    <section aria-label="Indicadores clave" className="grid grid-cols-1 gap-6 sm:grid-cols-[1.6fr_1fr]">
      {tiles.map((t) => {
        const DeltaIcon = t.tono === 'up' ? TrendingUp : t.tono === 'down' ? TrendingDown : Minus
        return (
          <article
            key={t.key}
            className="flex flex-col gap-2 sm:border-l sm:border-border sm:pl-5 sm:first:border-l-0 sm:first:pl-0"
          >
            <p className="text-caption font-medium text-muted-foreground">{t.label}</p>
            <p
              className={cn(
                'font-serif leading-none text-foreground tabular-nums',
                t.enfasis ? 'text-[2.25rem]' : 'text-[1.5rem]',
              )}
            >
              {t.value}
            </p>
            <div className="mt-auto flex min-h-5.5 items-center gap-2 pt-0.5">
              {t.delta && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-caption font-semibold',
                    DELTA_STYLES[t.tono],
                  )}
                >
                  <DeltaIcon className="size-3" />
                  {t.delta}
                </span>
              )}
              {t.spark && <Sparkline data={t.spark} className="ml-auto" />}
            </div>
            <p className="text-caption text-muted-foreground/80">{t.hint}</p>
          </article>
        )
      })}
    </section>
  )
}
