import { useState, useCallback } from 'react'
import { solicitudesApi } from '../api/promocion'
import { ApiError } from '@/shared/lib/client'
import type { DocumentoTipo } from '@/shared/config/documentos.config'
import { DOCUMENTO_LABELS } from '@/shared/config/documentos.config'

interface UseDescargarPDFReturn {
    descargar: (id: string, tipo?: DocumentoTipo) => Promise<void>
    idDescargando: string | null
    error: string | null
}

export function useDescargarPDF(): UseDescargarPDFReturn {
    const [idDescargando, setIdDescargando] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const descargar = useCallback(async (id: string, tipo: DocumentoTipo = 'solicitud') => {
        setIdDescargando(id)
        setError(null)
        try {
            const blob = await solicitudesApi.descargarDocumento(id, tipo)
            const url = window.URL.createObjectURL(blob)
            window.open(url, '_blank')
            setTimeout(() => window.URL.revokeObjectURL(url), 10_000)
        } catch (err) {
            const message =
                err instanceof ApiError
                    ? err.message
                    : `No se pudo generar el documento: ${DOCUMENTO_LABELS[tipo]}.`
            setError(message)
        } finally {
            setIdDescargando(null)
        }
    }, [])

    return { descargar, idDescargando, error }
}