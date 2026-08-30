import { useState, useCallback } from 'react'
import { ApiError } from '@/shared/api/client'

interface UseDescargarBlobReturn {
    /** Descarga el blob que devuelva `fetcher` y lo abre en una pestaña nueva. */
    descargar: (id: string, fetcher: () => Promise<Blob>, mensajeError?: string) => Promise<void>
    idDescargando: string | null
    error: string | null
}

/**
 * Núcleo compartido para descargas de documentos/PDF: maneja el estado de carga
 * por id, el manejo de errores y la apertura + limpieza del object URL.
 * Cada feature lo envuelve con su propio `fetcher` (ver useDescargarPDF).
 */
export function useDescargarBlob(): UseDescargarBlobReturn {
    const [idDescargando, setIdDescargando] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const descargar = useCallback(
        async (
            id: string,
            fetcher: () => Promise<Blob>,
            mensajeError = 'No se pudo generar el documento. Intenta de nuevo.',
        ) => {
            setIdDescargando(id)
            setError(null)
            try {
                const blob = await fetcher()
                const url = window.URL.createObjectURL(blob)
                window.open(url, '_blank')
                setTimeout(() => window.URL.revokeObjectURL(url), 10_000)
            } catch (err) {
                setError(err instanceof ApiError ? err.message : mensajeError)
            } finally {
                setIdDescargando(null)
            }
        },
        [],
    )

    return { descargar, idDescargando, error }
}
