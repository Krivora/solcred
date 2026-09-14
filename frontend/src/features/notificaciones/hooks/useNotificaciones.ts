'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { notificacionesApi } from '@/features/notificaciones/api/notificaciones.api'
import { notificacionesKeys } from '@/features/notificaciones/lib/notificaciones.keys'
import type { FiltrosNotificaciones } from '@/features/notificaciones/types/notificaciones.types'

/**
 * El contador y el listado se refrescan por polling: no hay websockets en
 * este stack. 60s es razonable para este dominio (asignaciones, cambios de
 * estatus) — no es un feed transaccional, un retraso de hasta un minuto no
 * cambia el flujo de trabajo. `refetchOnWindowFocus` se fuerza a `true` aquí
 * como excepción deliberada al default global (`query-client.ts` lo apaga
 * para el resto de la app) para que, si el usuario vuelve de otra pestaña
 * tras varios minutos, el conteo no se quede viejo hasta el próximo tick.
 */
const REFETCH_MS = 60_000

export function useContadorNoLeidas() {
  return useQuery({
    queryKey: notificacionesKeys.contador(),
    queryFn: () => notificacionesApi.contador(),
    refetchInterval: REFETCH_MS,
    refetchOnWindowFocus: true,
  })
}

export function useNotificaciones(filtros: FiltrosNotificaciones = {}, enabled = true) {
  return useQuery({
    queryKey: notificacionesKeys.listado(filtros),
    queryFn: () => notificacionesApi.listar(filtros),
    enabled,
    refetchInterval: enabled ? REFETCH_MS : false,
    refetchOnWindowFocus: enabled,
    placeholderData: (prev) => prev,
  })
}

/** Invalida listado + contador tras marcar leída una o todas. */
export function useInvalidarNotificaciones() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: notificacionesKeys.all })
  }
}
