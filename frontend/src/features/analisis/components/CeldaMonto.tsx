'use client'

import { MontoInput } from '@/shared/components/common/MontoInput'
import { montoAFloat } from '@/shared/lib/masks'
import { cn } from '@/shared/lib/cn'

interface Props {
  valor: number | null | undefined
  onChange: (v: number | null) => void
  disabled?: boolean
  className?: string
}

/** Celda de captura de monto en pesos, compartida por las pestañas del análisis. */
export function CeldaMonto({ valor, onChange, disabled, className }: Props) {
  return (
    <MontoInput
      value={valor === null || valor === undefined ? '' : String(valor)}
      onChange={(raw) => onChange(montoAFloat(raw))}
      disabled={disabled}
      className={cn(
        'h-7 rounded-md border-border/60 px-1.5 py-0 text-right font-mono text-[11px]',
        'focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/20',
        'disabled:bg-muted/40 disabled:text-muted-foreground',
        className,
      )}
    />
  )
}
