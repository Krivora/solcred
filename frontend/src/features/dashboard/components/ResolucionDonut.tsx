'use client'

import { formatEntero, formatPct, RANGO_LABELS } from '@/features/dashboard/lib/dashboard.format'
import type { PanoramaResolucion, RangoDashboard } from '@/features/dashboard/types/dashboard.types'

interface Props {
  resolucion: PanoramaResolucion
  rango: RangoDashboard
}

const DEFS = [
  { key: 'aprobadas', label: 'Aprobadas', color: 'var(--color-ok)' },
  { key: 'rechazadas', label: 'Rechazadas', color: 'var(--color-danger)' },
  { key: 'canceladas', label: 'Canceladas', color: 'var(--color-muted-foreground)' },
] as const

/**
 * Stat compacto de resolución — vive junto a TendenciaFlujo, no como card propia.
 * Reemplaza el donut: la cifra grande ya es el dato, la barra segmentada da el desglose.
 */
export function ResolucionDonut({ resolucion, rango }: Props) {
  const total = resolucion.total
  const segmentos = DEFS.map((s) => ({ ...s, valor: resolucion[s.key] }))

  return (
    <div className="flex h-full flex-col justify-between gap-4">
      <div>
        <p className="text-caption font-medium text-muted-foreground">
          Resolución · últimos {RANGO_LABELS[rango]}
        </p>
        <p className="mt-1 text-display leading-none text-foreground tabular-nums">
          {formatPct(resolucion.tasaAprobacion)}
        </p>
        <p className="mt-0.5 text-caption text-muted-foreground">tasa de aprobación</p>
      </div>

      <div className="space-y-2.5">
        <div className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full bg-muted">
          {total > 0 &&
            segmentos.map(
              (s) =>
                s.valor > 0 && (
                  <span
                    key={s.key}
                    className="h-full"
                    style={{ width: `${(s.valor / total) * 100}%`, background: s.color }}
                  />
                ),
            )}
        </div>

        <ul className="space-y-1.5">
          {segmentos.map((s) => (
            <li key={s.key} className="flex items-center gap-2 text-caption">
              <span className="size-2 shrink-0 rounded-sm" style={{ background: s.color }} />
              <span className="text-muted-foreground">{s.label}</span>
              <span className="ml-auto font-semibold text-foreground tabular-nums">
                {formatEntero(s.valor)}
              </span>
            </li>
          ))}
          <li className="flex items-center gap-2 border-t border-border/60 pt-1.5 text-caption">
            <span className="text-muted-foreground">Total dictaminadas</span>
            <span className="ml-auto font-semibold text-foreground tabular-nums">
              {formatEntero(total)}
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}
