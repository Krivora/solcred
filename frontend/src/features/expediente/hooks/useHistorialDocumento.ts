'use client'

import { useState, useCallback } from 'react'
import { expedienteApi } from '@/features/expediente/api/expediente.api'
import { expedienteToast } from '@/shared/lib/toaster'
import type { DocumentoConValidacionRaw } from '@/features/expediente/types/expediente.types'

const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message
    if (typeof err === 'string') return err
    return 'Error inesperado'
}

/**
 * Controlador del sheet de historial de un documento: estado de apertura +
 * carga bajo demanda. Es imperativo por diseño (se dispara al hacer click).
 */
export const useHistorialDocumento = () => {
    const [historial, setHistorial] = useState<DocumentoConValidacionRaw[]>([])
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [tipoNombre, setTipoNombre] = useState('')

    const verHistorial = useCallback(
        async (solicitudId: string, tipoDocumentoId: string, nombre: string) => {
            try {
                setLoading(true)
                setHistorial([])
                setTipoNombre(nombre)
                setOpen(true)
                const data = await expedienteApi.historial(solicitudId, tipoDocumentoId)
                setHistorial(data)
            } catch (err: unknown) {
                expedienteToast.historialError(getErrorMessage(err))
                setOpen(false)
            } finally {
                setLoading(false)
            }
        },
        [],
    )

    const cerrar = useCallback(() => {
        setOpen(false)
        setHistorial([])
        setTipoNombre('')
    }, [])

    return { historial, loading, open, tipoNombre, verHistorial, cerrar }
}
