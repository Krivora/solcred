import { useState, useCallback } from 'react'
import { solicitudesApi } from '@/features/solicitudes/api/solicitudes.api'
import { ApiError } from '@/shared/api/client'

interface UseDescargarPDFReturn {
    descargar: (id: string, folio?: string) => Promise<void>
    idDescargando: string | null
    error: string | null
}

export function useDescargarPDF(): UseDescargarPDFReturn {
    const [idDescargando, setIdDescargando] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const descargar = useCallback(async (id: string,) => {
        setIdDescargando(id)
        setError(null)
        try {
            const blob = await solicitudesApi.descargarPDF(id)
            const url = window.URL.createObjectURL(blob)
            window.open(url, '_blank')
            setTimeout(() => window.URL.revokeObjectURL(url), 10_000)
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'No se pudo generar el PDF. Intenta de nuevo.'
            setError(message)
        } finally {
            setIdDescargando(null)
        }
    }, [])

    return { descargar, idDescargando, error }
}