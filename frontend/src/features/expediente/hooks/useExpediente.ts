'use client'

import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { expedienteApi } from '@/features/expediente/api/expediente.api'
import { expedienteKeys } from '@/features/expediente/lib/expediente.keys'
import { expedienteToast } from '@/shared/lib/toaster'
import type {
    ValidarDocumentoDto,
} from '@/features/expediente/types/expediente.types'

const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message
    if (typeof err === 'string') return err
    return 'Error inesperado'
}

export const useExpediente = (solicitudId: string) => {
    const qc = useQueryClient()

    const {
        data: expediente = null,
        isLoading: loading,
        isError,
        error: queryError,
        refetch: refetchQuery,
    } = useQuery({
        queryKey: expedienteKeys.detail(solicitudId),
        queryFn: () => expedienteApi.obtener(solicitudId),
        enabled: !!solicitudId,
    })

    // Toast en error de carga (sincroniza con un sistema externo, sin setState)
    useEffect(() => {
        if (isError) expedienteToast.cargaError(getErrorMessage(queryError))
    }, [isError, queryError])

    const validarMut = useMutation({
        mutationFn: ({ documentoId, dto }: { documentoId: string; dto: ValidarDocumentoDto }) =>
            expedienteApi.validarDocumento(solicitudId, documentoId, dto),
        onSuccess: (_data, { dto }) => {
            if (dto.estatus === 'APROBADO') expedienteToast.documentoAprobado()
            else expedienteToast.documentoRechazado()
            qc.invalidateQueries({ queryKey: expedienteKeys.detail(solicitudId) })
        },
        onError: (err) => expedienteToast.validacionError(getErrorMessage(err)),
    })

    const validarDocumento = async (documentoId: string, dto: ValidarDocumentoDto) => {
        try {
            await validarMut.mutateAsync({ documentoId, dto })
        } catch {
            // el toast de error ya lo emite onError
        }
    }

    return {
        expediente,
        loading,
        error: isError ? getErrorMessage(queryError) : null,
        validando: validarMut.isPending ? validarMut.variables?.documentoId ?? null : null,
        refetch: async (): Promise<void> => {
            await refetchQuery()
        },
        validarDocumento,
    }
}
