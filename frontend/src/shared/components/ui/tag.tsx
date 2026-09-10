import * as React from 'react'
import { cn } from '@/shared/lib/cn'

export type TagTone = 1 | 2 | 3 | 4 | 5 | 6 | 'neutral'

const DOT: Record<Exclude<TagTone, 'neutral'>, string> = {
  1: 'bg-cat-1',
  2: 'bg-cat-2',
  3: 'bg-cat-3',
  4: 'bg-cat-4',
  5: 'bg-cat-5',
  6: 'bg-cat-6',
}

interface TagProps extends React.ComponentProps<'span'> {
  /** Tono categórico (tipo de comunicación, módulo…). `neutral` = sin punto. */
  tone?: TagTone
}

/**
 * Etiqueta categórica: chip neutro + punto de color. El punto distingue sin
 * meter texto de color saturado; siempre legible en ambos temas.
 */
export function Tag({ tone = 'neutral', className, children, ...props }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-surface-sunken px-2 py-0.5 text-caption font-medium text-ink-muted whitespace-nowrap',
        className,
      )}
      {...props}
    >
      {tone !== 'neutral' && (
        <span className={cn('size-1.5 shrink-0 rounded-full', DOT[tone])} aria-hidden="true" />
      )}
      {children}
    </span>
  )
}
