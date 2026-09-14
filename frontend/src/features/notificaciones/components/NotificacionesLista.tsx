'use client'

import { CheckCircle2 } from 'lucide-react'
import { NotificacionItem } from '@/features/notificaciones/components/NotificacionItem'
import type { Notificacion } from '@/features/notificaciones/types/notificaciones.types'

interface Props {
  notificaciones: Notificacion[]
  cargando?: boolean
  rol?: string
  onNavegar?: () => void
}

/** Mismo patrón de estado vacío que `AlertasPanel`: ícono + una frase, sin ilustración. */
export function NotificacionesLista({ notificaciones, cargando, rol, onNavegar }: Props) {
  if (cargando) {
    return (
      <div className="flex flex-col gap-2 px-2 py-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-md bg-surface-sunken" />
        ))}
      </div>
    )
  }

  if (notificaciones.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
        <CheckCircle2 className="size-6 text-ok-ink" />
        <p className="text-body-sm text-muted-foreground">No tienes notificaciones nuevas.</p>
      </div>
    )
  }

  return (
    <ul role="list" className="flex flex-col gap-0.5 px-1 py-1">
      {notificaciones.map((n) => (
        <li key={n.id}>
          <NotificacionItem notificacion={n} rol={rol} onNavegar={onNavegar} />
        </li>
      ))}
    </ul>
  )
}
