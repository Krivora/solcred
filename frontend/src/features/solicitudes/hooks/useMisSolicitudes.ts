'use client'

import { useQuery } from '@tanstack/react-query'
import { solicitudesApi } from '@/features/solicitudes/api/solicitudes.api'
import { solicitudesKeys } from '@/features/solicitudes/lib/solicitudes.keys'
import type {
  SolicitudListItem,
  PaginacionData,
} from '@/features/solicitudes/types/solicitud.types'

interface UseMisSolicitudesReturn {
  solicitudes: SolicitudListItem[]
  pagination: PaginacionData | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

const MENSAJE_ERROR_DEFAULT = 'No se pudo cargar tus solicitudes. Intenta de nuevo.'

export function useMisSolicitudes(): UseMisSolicitudesReturn {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: solicitudesKeys.mias(),
    queryFn: ({ signal }) => solicitudesApi.listar(signal),
  })

  return {
    solicitudes: data?.data ?? [],
    pagination: data?.pagination ?? null,
    isLoading,
    error: isError ? MENSAJE_ERROR_DEFAULT : null,
    refetch: () => refetch(),
  }
}
