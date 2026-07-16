import { useState, useEffect, useCallback } from 'react'
import * as programasApi from '../api/programas'
import type {
    Programa,
    ProgramaFormData,
    TipoDocumento,
} from '../types/programa.types'
import { programaToast } from '@/shared/lib/utils/toaster'

export function useProgramas() {
    const [programas, setProgramas] = useState<Programa[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const cargar = useCallback(async () => {
        try {
            setCargando(true)
            setError(null)
            const data = await programasApi.getProgramas()
            setProgramas(data)
        } catch (err: any) {
            const message = err?.message ?? 'Error al cargar programas'
            setError(message)
            programaToast.cargarError(err?.message)
        } finally {
            setCargando(false)
        }
    }, [])

    useEffect(() => { cargar() }, [cargar])

    const crear = async (data: ProgramaFormData): Promise<Programa | null> => {
        try {
            const nuevo = await programasApi.crearPrograma(data)
            setProgramas(prev => [nuevo, ...prev])
            programaToast.creado(nuevo.nombre)
            return nuevo
        } catch (err: any) {
            programaToast.crearError(err?.message)
            return null
        }
    }

    const actualizar = async (
        id: string,
        data: ProgramaFormData
    ): Promise<Programa | null> => {
        try {
            const actualizado = await programasApi.actualizarPrograma(id, data)
            setProgramas(prev =>
                prev.map(p => (p.id === id ? actualizado : p))
            )
            programaToast.actualizado(actualizado.nombre)
            return actualizado
        } catch (err: any) {
            programaToast.actualizarError(err?.message)
            return null
        }
    }

    const activar = async (id: string): Promise<boolean> => {
        try {
            const actualizado = await programasApi.activarPrograma(id)
            setProgramas(prev =>
                prev.map(p => (p.id === id ? actualizado : p))
            )
            programaToast.activado()
            return true
        } catch (err: any) {
            programaToast.cambiarEstadoError(err?.message)
            return false
        }
    }

    const desactivar = async (id: string): Promise<boolean> => {
        try {
            const actualizado = await programasApi.desactivarPrograma(id)
            setProgramas(prev =>
                prev.map(p => (p.id === id ? actualizado : p))
            )
            programaToast.desactivado()
            return true
        } catch (err: any) {
            programaToast.cambiarEstadoError(err?.message)
            return false
        }
    }

    return {
        programas,
        cargando,
        error,
        recargar: cargar,
        crear,
        actualizar,
        activar,
        desactivar,
    }
}

// ── Hook independiente para tipos de documento ──────────────────────────────
export function useTiposDocumento() {
    const [tipos, setTipos] = useState<TipoDocumento[]>([])
    const [cargando, setCargando] = useState(true)

    const cargar = useCallback(async () => {
        try {
            setCargando(true)
            const data = await programasApi.getTiposDocumento()
            setTipos(data)
        } catch (err: any) {
            programaToast.cargarError(err?.message)
        } finally {
            setCargando(false)
        }
    }, [])

    useEffect(() => { cargar() }, [cargar])

    const crear = async (data: { nombre: string; descripcion?: string }): Promise<TipoDocumento | null> => {
        try {
            const nuevo = await programasApi.crearTipoDocumento(data)
            setTipos(prev => [...prev, nuevo])
            programaToast.tipoDocumentoCreado()
            return nuevo
        } catch (err: any) {
            programaToast.tipoDocumentoError(err?.message)
            return null
        }
    }

    return {
        tipos,
        cargando,
        recargar: cargar,
        crear,
    }
}

// ── Documentos por programa ──────────────────────────────────────────────────
export function useDocumentosPrograma(programaId: string) {
    const [procesando, setProcesando] = useState(false)

    const agregar = async (
        data: { tipoDocumentoId: string; esObligatorio: boolean; aplicaA?: 'FISICA' | 'MORAL' | 'AMBOS' },
        onSuccess?: () => void
    ): Promise<boolean> => {
        try {
            setProcesando(true)
            await programasApi.agregarDocumento(programaId, data)
            programaToast.documentoAgregado()
            onSuccess?.()
            return true
        } catch (err: any) {
            programaToast.documentoAgregarError(err?.message)
            return false
        } finally {
            setProcesando(false)
        }
    }

    const quitar = async (
        tipoDocumentoId: string,
        onSuccess?: () => void
    ): Promise<boolean> => {
        try {
            setProcesando(true)
            await programasApi.quitarDocumento(programaId, tipoDocumentoId)
            programaToast.documentoQuitado()
            onSuccess?.()
            return true
        } catch (err: any) {
            programaToast.documentoQuitarError(err?.message)
            return false
        } finally {
            setProcesando(false)
        }
    }

    return {
        procesando,
        agregar,
        quitar,
    }
}