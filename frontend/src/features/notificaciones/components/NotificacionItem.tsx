'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/shared/lib/cn'
import { destinoNotificacion, resolverIconoYTono, tiempoRelativo, TONE } from '@/features/notificaciones/lib/notificaciones.config'
import { useAccionesNotificacion } from '@/features/notificaciones/hooks/useAccionesNotificacion'
import type { Notificacion } from '@/features/notificaciones/types/notificaciones.types'

interface Props {
  notificacion: Notificacion
  rol?: string
  onNavegar?: () => void
}

/**
 * Un ítem de la bandeja. Mismo vocabulario visual que `ComunicacionCard`
 * (círculo de ícono + texto), no el patrón de caja con borde/fondo tintado de
 * `AlertasPanel` — ese funciona para 3-5 alertas ejecutivas, se vuelve ruido
 * en un feed personal de docenas de notificaciones. Leído/no-leído se
 * distingue solo por peso/color de texto + un punto de 6px, nunca por un
 * nuevo color de fondo (confundiría tono-del-evento con estado-de-lectura).
 */
export function NotificacionItem({ notificacion: n, rol, onNavegar }: Props) {
  const router = useRouter()
  const { marcarLeida } = useAccionesNotificacion()
  const { icon: Icon, tone } = resolverIconoYTono(n)
  const noLeida = !n.leidaEn

  const activar = () => {
    if (noLeida) marcarLeida.mutate(n.id)
    const destino = destinoNotificacion(n, rol)
    onNavegar?.()
    if (destino) router.push(destino)
  }

  return (
    <button
      type="button"
      onClick={activar}
      className="flex w-full items-start gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <span
        className={cn(
          'mt-0.5 grid size-8 shrink-0 place-items-center rounded-full',
          TONE[tone].chip,
        )}
      >
        <Icon className="size-4" />
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'block text-body-sm leading-snug',
            noLeida ? 'font-semibold text-foreground' : 'font-normal text-ink-muted',
          )}
        >
          {n.titulo}
        </span>
        <span className="mt-0.5 block text-caption text-ink-subtle">
          {tiempoRelativo(n.creadoEn)}
        </span>
      </span>

      {noLeida && (
        <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
      )}
    </button>
  )
}
