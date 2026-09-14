'use client'

import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query'
import { notificacionesApi } from '@/features/notificaciones/api/notificaciones.api'
import { notificacionesKeys } from '@/features/notificaciones/lib/notificaciones.keys'
import type { ContadorNoLeidas, Notificaciones } from '@/features/notificaciones/types/notificaciones.types'

const esListado = (queryKey: QueryKey) => queryKey[1] === 'listado'

/**
 * Marcar leída (una o todas) con actualización optimista: la fila cambia de
 * peso/color y el contador del badge baja antes de esperar al servidor — se
 * marca leída al hacer clic en el ítem, nunca solo por abrir el panel.
 */
export function useAccionesNotificacion() {
  const qc = useQueryClient()

  const marcarLeida = useMutation({
    mutationFn: (id: string) => notificacionesApi.marcarLeida(id),
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: notificacionesKeys.all })

      const previasListados = qc.getQueriesData<Notificaciones>({
        queryKey: notificacionesKeys.all,
        predicate: (q) => esListado(q.queryKey),
      })
      const previoContador = qc.getQueryData<ContadorNoLeidas>(notificacionesKeys.contador())

      const ahora = new Date().toISOString()
      let cambio = false

      qc.setQueriesData<Notificaciones>(
        { queryKey: notificacionesKeys.all, predicate: (q) => esListado(q.queryKey) },
        (data) => {
          if (!data) return data
          return {
            ...data,
            data: data.data.map((n) => {
              if (n.id !== id || n.leidaEn) return n
              cambio = true
              return { ...n, leidaEn: ahora }
            }),
          }
        },
      )

      if (cambio) {
        qc.setQueryData<ContadorNoLeidas>(notificacionesKeys.contador(), (data) =>
          data ? { count: Math.max(0, data.count - 1) } : data,
        )
      }

      return { previasListados, previoContador }
    },
    onError: (_err, _id, context) => {
      context?.previasListados.forEach(([key, data]) => qc.setQueryData(key, data))
      if (context?.previoContador) {
        qc.setQueryData(notificacionesKeys.contador(), context.previoContador)
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: notificacionesKeys.all }),
  })

  const marcarTodasLeidas = useMutation({
    mutationFn: () => notificacionesApi.marcarTodasLeidas(),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificacionesKeys.all }),
  })

  return { marcarLeida, marcarTodasLeidas }
}
