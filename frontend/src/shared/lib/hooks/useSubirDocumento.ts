import { useState, useCallback } from 'react'
import { uploadsApi } from '@/shared/lib/api/uploads.api'
import { documentoToast } from '@/shared/lib/utils/toaster'
const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message
    if (typeof err === 'string') return err
    return 'Error inesperado'
}
export const useSubirDocumento = (
    solicitudId: string,
    onSuccess?: () => Promise<void> | void
) => {
    const [subiendo, setSubiendo] = useState(false)

    const subirDocumento = useCallback(
        async (
            tipoDocumentoId: string,
            archivo: File
        ) => {
            try {
                setSubiendo(true)

                const documento =
                    await uploadsApi.subirArchivo(
                        solicitudId,
                        tipoDocumentoId,
                        archivo
                    )

                documentoToast.subidaExitosa(documento.version)

                await onSuccess?.()

                return documento
            } catch (err: unknown) {
                const message = getErrorMessage(err)
                documentoToast.subidaError(message)
                throw err
            } finally {
                setSubiendo(false)
            }
        },
        [solicitudId, onSuccess]
    )

    return {
        subiendo,
        subirDocumento,
    }
}