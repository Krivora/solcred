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
      className="inline-flex overflow-hidden rounded-lg border border-line-strong bg-card"
    >
      {OPCIONES.map((op) => (
        <button
          key={op}
          type="button"
          aria-pressed={value === op}
          onClick={() => onChange(op)}
          className={cn(
            'border-l border-border px-3 py-1.5 text-xs transition-colors first:border-l-0',
            value === op
              ? 'bg-brand font-medium text-brand-contrast'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {RANGO_LABELS[op]}
        </button>
      ))}
    </div>
  )
}
