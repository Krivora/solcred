'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { analisisApi } from '@/features/analisis/api/analisis.api'
import { analisisKeys } from '@/features/analisis/lib/analisis.keys'
import type { AnalisisResponse, AnalisisTab } from '@/features/analisis/types/analisis.types'

export type EstadoGuardado = 'idle' | 'guardando' | 'ok' | 'error'

const DEBOUNCE_MS = 1500
/** Backoff antes de reintentar automáticamente un guardado que falló. */
const REINTENTO_MS = 5000

export function useAnalisis(solicitudId: string) {
  const queryClient = useQueryClient()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: analisisKeys.detalle(solicitudId),
    queryFn: () => analisisApi.obtener(solicitudId),
    enabled: !!solicitudId,
  })

  const [guardado, setGuardado] = useState<EstadoGuardado>('idle')

  // Un timer + el último payload pendiente por pestaña.
  const timers = useRef<Partial<Record<AnalisisTab, ReturnType<typeof setTimeout>>>>({})
  const pendientes = useRef<Partial<Record<AnalisisTab, unknown>>>({})
  const enVuelo = useRef(0)
  // Referencia estable a `enviar` para el reintento (evita la recursión directa).
  const enviarRef = useRef<(tab: AnalisisTab) => void>(() => {})

  const enviar = useCallback(
    async (tab: AnalisisTab) => {
      const payload = pendientes.current[tab]
      if (payload === undefined) return
      delete pendientes.current[tab]

      enVuelo.current += 1
      setGuardado('guardando')
      try {
        await analisisApi.guardarTab(solicitudId, tab, payload)
        enVuelo.current -= 1

        // Refleja lo guardado en el cache. Radix desmonta las pestañas
        // inactivas, así que al volver a una pestaña su componente se
        // re-monta y se re-siembra desde aquí: sin esto vería datos viejos.
        queryClient.setQueryData<AnalisisResponse>(
          analisisKeys.detalle(solicitudId),
          (prev) =>
            prev
              ? { ...prev, analisis: { ...prev.analisis, [tab]: payload } as AnalisisResponse['analisis'] }
              : prev,
        )

        if (enVuelo.current === 0 && Object.keys(pendientes.current).length === 0) {
          setGuardado('ok')
          setTimeout(() => setGuardado((g) => (g === 'ok' ? 'idle' : g)), 2000)
        }
      } catch (e) {
        enVuelo.current -= 1
        // Re-encola el payload (si no llegó uno más nuevo mientras tanto) y
        // programa un reintento — así un fallo transitorio no pierde el cambio.
        if (pendientes.current[tab] === undefined) {
          pendientes.current[tab] = payload
          if (timers.current[tab]) clearTimeout(timers.current[tab])
          timers.current[tab] = setTimeout(() => enviarRef.current(tab), REINTENTO_MS)
        }
        setGuardado('error')
        toast.error('No se pudo guardar', {
          description: e instanceof Error ? e.message : 'Se reintentará en unos segundos',
        })
      }
    },
    [solicitudId, queryClient],
  )

  useEffect(() => {
    enviarRef.current = enviar
  }, [enviar])

  /** Encola el guardado de una pestaña (debounced). */
  const guardarTab = useCallback(
    (tab: AnalisisTab, payload: unknown) => {
      pendientes.current[tab] = payload
      if (timers.current[tab]) clearTimeout(timers.current[tab])
      timers.current[tab] = setTimeout(() => void enviar(tab), DEBOUNCE_MS)
    },
    [enviar],
  )

  // Flush de lo pendiente al desmontar y al cerrar la pestaña del navegador.
  useEffect(() => {
    const flush = () => {
      for (const tab of Object.keys(pendientes.current) as AnalisisTab[]) {
        if (timers.current[tab]) clearTimeout(timers.current[tab])
        void enviar(tab)
      }
    }
    window.addEventListener('beforeunload', flush)
    return () => {
      window.removeEventListener('beforeunload', flush)
      flush()
    }
  }, [enviar])

  return {
    analisis: data?.analisis ?? null,
    contexto: data?.contexto ?? null,
    origen: data?.origen ?? null,
    editable: data?.editable ?? false,
    cargando: isLoading,
    error: isError ? (error instanceof Error ? error.message : 'Error al cargar el análisis') : null,
    guardado,
    guardarTab,
  }
}
