'use client'

import { cn } from '@/shared/lib/cn'
import { RANGO_LABELS } from '@/features/dashboard/lib/dashboard.format'
import type { RangoDashboard } from '@/features/dashboard/types/dashboard.types'

const OPCIONES: RangoDashboard[] = ['7d', '30d', '90d', '12m']

interface Props {
  value: RangoDashboard
  onChange: (r: RangoDashboard) => void
}

export function PeriodoSelector({ value, onChange }: Props) {
  return (
    <div
      role="group"
      aria-label="Periodo del panorama"
      className="inline-flex gap-0.5 rounded-lg border border-border bg-muted p-0.5"
    >
      {OPCIONES.map((op) => (
        <button
          key={op}
          type="button"
          aria-pressed={value === op}
          onClick={() => onChange(op)}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
            value === op
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {RANGO_LABELS[op]}
        </button>
      ))}
    </div>
  )
}
