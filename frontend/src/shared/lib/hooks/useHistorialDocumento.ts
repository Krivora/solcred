import { useState, useCallback } from 'react'
import { expedienteApi } from '../api/expediente.api'
import { toast } from '@/shared/lib/utils/toast'
import type { DocumentoActivo } from '../types/expediente.types'

export const useHistorialDocumento = () => {
    const [historial, setHistorial] = useState<DocumentoActivo[]>([])
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [tipoNombre, setTipoNombre] = useState('')

    const verHistorial = useCallback(
        async (solicitudId: string, tipoDocumentoId: string, nombre: string) => {
            try {
                setLoading(true)
                setTipoNombre(nombre)
                setOpen(true)
                const data = await expedienteApi.historial(solicitudId, tipoDocumentoId)
                setHistorial(data)
            } catch (err: any) {
                toast.error(err?.message ?? 'Error al cargar el historial')
                setOpen(false)
            } finally {
                setLoading(false)
            }
        },
        []
    )

    const cerrar = () => {
        setOpen(false)
        setHistorial([])
        setTipoNombre('')
    }

    return { historial, loading, open, tipoNombre, verHistorial, cerrar }
}