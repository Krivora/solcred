'use client'

import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { cn } from '@/shared/lib/cn'

interface Props {
  label: string
  value: number | null
  onChange: (v: number | null) => void
  disabled?: boolean
  min?: number
  max?: number
  step?: number
  sufijo?: string
  hint?: string
  invalido?: boolean
}

/** Input numérico con etiqueta, sufijo opcional (%, meses…) y hint de rango. */
export function CampoNumero({
  label, value, onChange, disabled, min, max, step, sufijo, hint, invalido,
}: Props) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] font-medium text-muted-foreground">{label}</Label>
      <div className="relative">
        <Input
          type="number"
          value={value ?? ''}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          className={cn(
            'h-9 text-sm',
            sufijo && 'pr-10',
            invalido && 'border-destructive focus-visible:ring-destructive/30',
          )}
        />
        {sufijo && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
            {sufijo}
          </span>
        )}
      </div>
      {hint && (
        <p className={cn('text-[10px]', invalido ? 'text-destructive' : 'text-muted-foreground/70')}>{hint}</p>
      )}
    </div>
  )
}
