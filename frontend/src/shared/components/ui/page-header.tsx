import * as React from 'react'
import { cn } from '@/shared/lib/cn'

interface PageHeaderProps {
  title: React.ReactNode
  description?: React.ReactNode
  /** Botones / acciones alineados a la derecha. */
  actions?: React.ReactNode
  /** Slot a la izquierda del título (p. ej. un botón de regreso). */
  leading?: React.ReactNode
  className?: string
  /** Divisor inferior. `true` por defecto. */
  divider?: boolean
}

/**
 * Encabezado de sección/pantalla. Reemplaza el patrón "ícono en caja con tinte
 * + ring": título + descripción + acciones, separado por un hairline.
 */
export function PageHeader({
  title,
  description,
  actions,
  leading,
  className,
  divider = true,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 pb-4',
        divider && 'border-b border-hairline',
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-2.5">
        {leading}
        <div className="min-w-0">
          <h1 className="text-title text-ink text-balance">{title}</h1>
          {description && (
            <p className="mt-0.5 text-body-sm text-ink-muted">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
