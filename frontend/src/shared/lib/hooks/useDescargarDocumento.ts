import { useState, useCallback } from 'react'
import { uploadsApi } from '../api/uploads.api'
import { documentoToast } from '@/shared/lib/utils/toaster'
const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message
    if (typeof err === 'string') return err
    return 'Error inesperado'
}
export const useDescargarDocumento = (
    solicitudId: string
) => {
    const [descargando, setDescargando] =
        useState<string | null>(null)

    const descargarDocumento = useCallback(
        async (
            documentoId: string,
            nombreArchivo?: string
        ) => {
            try {
                setDescargando(documentoId)

                const blob =
                    await uploadsApi.descargarArchivo(
                        solicitudId,
                        documentoId
                    )

                const url = URL.createObjectURL(blob)

                const a = document.createElement('a')
                a.href = url
                a.download = nombreArchivo ?? 'documento.pdf'

                document.body.appendChild(a)
                a.click()
                a.remove()

                URL.revokeObjectURL(url)
            } catch (err: unknown) {
                const message = getErrorMessage(err)
                documentoToast.downloadError(
                    message ??
                    'Error al descargar el documento'
                )
            } finally {
                setDescargando(null)
            }
        },
        [solicitudId]
    )

    return {
        descargando,
        descargarDocumento,
    }
}