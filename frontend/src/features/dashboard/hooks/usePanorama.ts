'use client'

import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { dashboardApi } from '@/features/dashboard/api/dashboard.api'
import { dashboardKeys } from '@/features/dashboard/lib/dashboard.keys'
import type { RangoDashboard } from '@/features/dashboard/types/dashboard.types'

export function usePanorama(rangoInicial: RangoDashboard = '30d') {
  const queryClient = useQueryClient()
  const [rango, setRango] = useState<RangoDashboard>(rangoInicial)

  const query = useQuery({
    queryKey: dashboardKeys.panorama(rango),
    queryFn: () => dashboardApi.panorama(rango),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    refetchInterval: 5 * 60_000, // el tablero se refresca solo cada 5 min
  })

  const recargar = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
  }, [queryClient])

  return {
    panorama: query.data ?? null,
    rango,
    setRango,
    cargando: query.isLoading,
    refrescando: query.isFetching && !query.isLoading,
    error: query.isError ? 'No se pudo cargar el panorama.' : null,
    recargar,
  }
}
