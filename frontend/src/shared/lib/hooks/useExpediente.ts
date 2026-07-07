import { useState, useEffect, useCallback, useRef } from 'react'
import { expedienteApi } from '../api/expediente.api'
import { expedienteToast } from '@/shared/lib/utils/toaster'
import type {
    DocumentoActivo,
    Expediente,
    ValidarDocumentoDto,
} from '../types/expediente.types'

const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message
    if (typeof err === 'string') return err
    return 'Error inesperado'
}

export const useExpediente = (solicitudId: string) => {
    const [expediente, setExpediente] = useState<Expediente | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [validando, setValidando] = useState<string | null>(null)

    // Evita condiciones de carrera si el componente se desmonta o cambia el id
    const ignoreRef = useRef(false)

    const cargar = useCallback(
        async (esRecarga = false) => {
            if (!solicitudId) return
            try {
                // Solo mostramos el skeleton de página completa en la carga inicial
                if (!esRecarga) setLoading(true)
                setError(null)

                const data = await expedienteApi.obtener(solicitudId)

                if (!ignoreRef.current) {
                    setExpediente(data)
                }
            } catch (err: unknown) {
                const message = getErrorMessage(err)
                if (!ignoreRef.current) {
                    setError(message)
                    expedienteToast.cargaError(message)
                }
            } finally {
                if (!ignoreRef.current && !esRecarga) {
                    setLoading(false)
                }
            }
        },
        [solicitudId]
    )

    useEffect(() => {
        ignoreRef.current = false
        const timeoutId = setTimeout(() => {
            cargar(false)
        }, 0)

        return () => {
            ignoreRef.current = true
            clearTimeout(timeoutId)
        }
    }, [cargar])

    const refetch = useCallback(() => cargar(true), [cargar])

    const validarDocumento = useCallback(
        async (
            documentoId: string,
            dto: ValidarDocumentoDto
        ) => {
            try {
                setValidando(documentoId)
                await expedienteApi.validarDocumento(
                    solicitudId,
                    documentoId,
                    dto
                )
                if (dto.estatus === 'APROBADO') {
                    expedienteToast.documentoAprobado()
                } else {
                    expedienteToast.documentoRechazado()
                }
                await refetch()
            } catch (err: unknown) {
                const message = getErrorMessage(err)
                expedienteToast.validacionError(message)
            } finally {
                setValidando(null)
            }
        },
        [solicitudId, refetch]
    )

    return {
        expediente,
        loading,
        error,
        validando,
        refetch,
        validarDocumento,
    }
}

export const useHistorialDocumento = () => {
    const [historial, setHistorial] = useState<DocumentoActivo[]>([])
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [tipoNombre, setTipoNombre] = useState('')
    const verHistorial = useCallback(
        async (
            solicitudId: string,
            tipoDocumentoId: string,
            nombre: string
        ) => {
            try {
                setLoading(true)
                setHistorial([])
                setTipoNombre(nombre)
                setOpen(true)
                const data = await expedienteApi.historial(
                    solicitudId,
                    tipoDocumentoId
                )
                setHistorial(data)
            } catch (err: unknown) {
                const message = getErrorMessage(err)
                expedienteToast.historialError(message)
                setOpen(false)
            } finally {
                setLoading(false)
            }
        },
        []
    )
    const cerrar = useCallback(() => {
        setOpen(false)
        setHistorial([])
        setTipoNombre('')
    }, [])
    return {
        historial,
        loading,
        open,
        tipoNombre,
        verHistorial,
        cerrar,
    }
}