'use client'

import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiError } from '@/shared/api/client'
import { analisisApi } from '@/features/analisis/api/analisis.api'
import { analisisKeys } from '@/features/analisis/lib/analisis.keys'
import { construirPayloadInforme } from '@/features/analisis/lib/informe-ejecutivo'

/**
 * Genera el Informe Ejecutivo de una solicitud: reusa (o carga) el análisis,
 * arma el payload con los `lib/` de las pestañas, pide el PDF y lo abre.
 * Sirve para el header de la herramienta y para las acciones de fila de los
 * listados de financiamiento.
 */
export function useInformeEjecutivo() {
  const queryClient = useQueryClient()
  const [generandoId, setGenerandoId] = useState<string | null>(null)

  const generar = useCallback(
    async (solicitudId: string) => {
      setGenerandoId(solicitudId)
      try {
        const res = await queryClient.fetchQuery({
          queryKey: analisisKeys.detalle(solicitudId),
          queryFn: () => analisisApi.obtener(solicitudId),
          staleTime: 10_000,
        })
        const payload = construirPayloadInforme(res.analisis, res.origen.ajustesCredito)
        const blob = await analisisApi.generarInformeEjecutivo(solicitudId, payload)
        const url = window.URL.createObjectURL(blob)
        window.open(url, '_blank')
        setTimeout(() => window.URL.revokeObjectURL(url), 10_000)
      } catch (err) {
        toast.error('No se pudo generar el informe ejecutivo', {
          description: err instanceof ApiError ? err.message : 'Intenta de nuevo en unos segundos',
        })
      } finally {
        setGenerandoId(null)
      }
    },
    [queryClient],
  )

  return { generar, generandoId }
}
