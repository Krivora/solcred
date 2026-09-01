import type { TooltipProps } from 'recharts'

interface Row {
  label: string
  value: string
  color?: string
}

/**
 * Tooltip de Recharts con estilo del design system. Se le pasa un `format`
 * que convierte el payload en filas legibles.
 */
export function makeChartTooltip(
  format: (payload: Record<string, unknown>, label: string | number) => { title: string; rows: Row[] },
) {
  return function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
    if (!active || !payload || payload.length === 0) return null
    const first = (payload[0]?.payload ?? {}) as Record<string, unknown>
    const { title, rows } = format(first, label ?? '')

    return (
      <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
        <p className="mb-1 font-semibold text-popover-foreground">{title}</p>
        <div className="flex flex-col gap-1">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center gap-2 whitespace-nowrap text-muted-foreground">
              {r.color && <span className="size-2 rounded-sm" style={{ background: r.color }} />}
              <span>{r.label}</span>
              <span className="ml-auto pl-4 font-medium text-popover-foreground tabular-nums">{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
}
