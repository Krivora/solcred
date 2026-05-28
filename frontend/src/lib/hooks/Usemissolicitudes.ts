import { useEffect, useState, useCallback } from 'react'
import { solicitudesApi } from '@/lib/api/solicitudes'
import type { Solicitud } from '@/lib/types/solicitudes.types'

interface UseMisSolicitudesReturn {
  solicitudes: Solicitud[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useMisSolicitudes(): UseMisSolicitudesReturn {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSolicitudes = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await solicitudesApi.listar()
      setSolicitudes(data)
    } catch {
      setError('No se pudo cargar tus solicitudes. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSolicitudes()
  }, [fetchSolicitudes])

  return {
    solicitudes,
    isLoading,
    error,
    refetch: fetchSolicitudes,
  }
}