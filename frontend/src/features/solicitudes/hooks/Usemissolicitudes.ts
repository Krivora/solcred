import { useEffect, useState, useCallback, useRef } from 'react'
import { solicitudesApi } from '@/features/solicitudes/api/solicitudes.api'
import type {
  Solicitud,
  PaginacionMeta,
} from '@/features/solicitudes/types/solicitud.types'

interface UseMisSolicitudesReturn {
  solicitudes: Solicitud[]
  pagination: PaginacionMeta | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

const MENSAJE_ERROR_DEFAULT = 'No se pudo cargar tus solicitudes. Intenta de nuevo.'

export function useMisSolicitudes(): UseMisSolicitudesReturn {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [pagination, setPagination] = useState<PaginacionMeta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Evita "setState en componente desmontado" y pisar resultados
  // con una respuesta más vieja si refetch() se dispara varias veces.
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchSolicitudes = useCallback(async () => {
    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    setIsLoading(true)
    setError(null)

    try {
      const { items, pagination } = await solicitudesApi.listar(controller.signal)
      if (controller.signal.aborted) return

      setSolicitudes(items)
      setPagination(pagination)
    } catch (err) {
      if (controller.signal.aborted) return

      console.error('Error al obtener solicitudes:', err)
      setError(MENSAJE_ERROR_DEFAULT)
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    fetchSolicitudes()
    return () => abortControllerRef.current?.abort()
  }, [fetchSolicitudes])

  return {
    solicitudes,
    pagination,
    isLoading,
    error,
    refetch: fetchSolicitudes,
  }
}