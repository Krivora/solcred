'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadsApi } from '@/shared/api/uploads.api'
import { expedienteKeys } from '@/features/expediente/lib/expediente.keys'
import { documentoToast } from '@/shared/lib/toaster'

const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message
    if (typeof err === 'string') return err
    return 'Error inesperado'
}

export const useSubirDocumento = (
    solicitudId: string,
    onSuccess?: () => Promise<void> | void,
) => {
    const qc = useQueryClient()

    const mut = useMutation({
        mutationFn: ({ tipoDocumentoId, archivo }: { tipoDocumentoId: string; archivo: File }) =>
            uploadsApi.subirArchivo(solicitudId, tipoDocumentoId, archivo),
        onSuccess: async (documento) => {
            documentoToast.subidaExitosa(documento.version)
            qc.invalidateQueries({ queryKey: expedienteKeys.detail(solicitudId) })
            await onSuccess?.()
        },
        onError: (err) => documentoToast.subidaError(getErrorMessage(err)),
    })

    const subirDocumento = async (tipoDocumentoId: string, archivo: File) =>
        mut.mutateAsync({ tipoDocumentoId, archivo })

    return {
        subiendo: mut.isPending,
        subirDocumento,
    }
}
