import * as React from 'react'
import { cn } from '@/shared/lib/cn'

export type StatusTone = 'ok' | 'warn' | 'danger' | 'info' | 'neutral'

const TONE: Record<StatusTone, string> = {
  ok: 'bg-ok-surface text-ok-ink',
  warn: 'bg-warn-surface text-warn-ink',
  danger: 'bg-danger-surface text-danger-ink',
  info: 'bg-info-surface text-info-ink',
  neutral: 'bg-surface-sunken text-ink-muted',
}

interface StatusChipProps extends React.ComponentProps<'span'> {
  tone: StatusTone
  icon?: React.ElementType
}

/**
 * Pill de estado con la receta única de tokens (`--{tone}-surface` / `-ink`).
 * Un solo chip de estado por objeto; el resto de la metadata va como texto.
 */
export function StatusChip({ tone, icon: Icon, className, children, ...props }: StatusChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-caption font-medium whitespace-nowrap',
        TONE[tone],
        className,
      )}
      {...props}
    >
      {Icon && <Icon className="size-3 shrink-0" />}
      {children}
    </span>
  )
}
