import { apiAuth } from '@/shared/api/client'
import type {
  ContadorNoLeidas,
  FiltrosNotificaciones,
  Notificacion,
  Notificaciones,
} from '@/features/notificaciones/types/notificaciones.types'

const BASE = '/notificaciones'

const qs = (obj: Record<string, unknown>): string => {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null && v !== '') p.set(k, String(v))
  }
  const s = p.toString()
  return s ? `?${s}` : ''
}

export const notificacionesApi = {
  listar: (f: FiltrosNotificaciones = {}) =>
    apiAuth<Notificaciones>(
      `${BASE}${qs({ page: f.page, pageSize: f.pageSize, soloNoLeidas: f.soloNoLeidas })}`,
    ),

  contador: () => apiAuth<ContadorNoLeidas>(`${BASE}/no-leidas/contador`),

  marcarLeida: (id: string) =>
    apiAuth<Notificacion>(`${BASE}/${id}/leida`, { method: 'PATCH' }),

  marcarTodasLeidas: () =>
    apiAuth<{ actualizadas: number }>(`${BASE}/leidas`, { method: 'PATCH' }),
}
