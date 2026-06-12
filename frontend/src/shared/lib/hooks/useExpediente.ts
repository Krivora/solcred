import { useState, useEffect, useCallback } from 'react'
import { expedienteApi } from '../api/expediente.api'
import { toast } from '@/shared/lib/utils/toast'
import type { Expediente, ValidarDocumentoDto, SubirDocumentoDto } from '../types/expediente.types'

export const useExpediente = (solicitudId: string) => {
    const [expediente, setExpediente] = useState<Expediente | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [validando, setValidando] = useState<string | null>(null)  // documentoId en proceso
    const [subiendo, setSubiendo] = useState<string | null>(null)    // tipoDocumentoId en proceso

    const cargar = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await expedienteApi.obtener(solicitudId)
            setExpediente(data)
        } catch (err: any) {
            setError(err?.message ?? 'Error al cargar el expediente')
        } finally {
            setLoading(false)
        }
    }, [solicitudId])

    useEffect(() => {
        cargar()
    }, [cargar])

    const validarDocumento = async (documentoId: string, dto: ValidarDocumentoDto) => {
        try {
            setValidando(documentoId)
            await expedienteApi.validarDocumento(solicitudId, documentoId, dto)
            toast.success(
                dto.estatus === 'APROBADO'
                    ? 'Documento aprobado correctamente'
                    : 'Documento rechazado'
            )
            await cargar()
        } catch (err: any) {
            toast.error(err?.message ?? 'Error al validar el documento')
        } finally {
            setValidando(null)
        }
    }

    const subirDocumento = async (dto: SubirDocumentoDto) => {
        try {
            setSubiendo(dto.tipoDocumentoId)
            await expedienteApi.subirDocumento(solicitudId, dto)
            toast.success('Documento subido correctamente')
            await cargar()
        } catch (err: any) {
            toast.error(err?.message ?? 'Error al subir el documento')
        } finally {
            setSubiendo(null)
        }
    }

    return {
        expediente,
        loading,
        error,
        validando,
        subiendo,
        refetch: cargar,
        validarDocumento,
        subirDocumento,
    }
}