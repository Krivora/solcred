import type { FiltrosNotificaciones } from '@/features/notificaciones/types/notificaciones.types'

export const notificacionesKeys = {
  all: ['notificaciones'] as const,
  listado: (f: FiltrosNotificaciones = {}) => [...notificacionesKeys.all, 'listado', f] as const,
  contador: () => [...notificacionesKeys.all, 'contador'] as const,
}
