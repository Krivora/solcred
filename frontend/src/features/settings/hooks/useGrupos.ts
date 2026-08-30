import { useState, useEffect, useCallback } from 'react'
import * as gruposApi from '@/features/settings/api/grupos.api'
import type {
    GrupoGestion,
    CrearGrupoDto,
    ActualizarGrupoDto,
} from '@/features/settings/types/grupos.types'
import { grupoToast } from '@/shared/lib/utils/toaster'

export function useGrupos() {
    const [grupos, setGrupos] = useState<GrupoGestion[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const cargar = useCallback(async () => {
        try {
            setCargando(true)
            setError(null)
            const data = await gruposApi.listarGrupos()
            setGrupos(data)
        } catch (err: any) {
            setError(err.message ?? 'Error al cargar grupos')
        } finally {
            setCargando(false)
        }
    }, [])

    useEffect(() => { cargar() }, [cargar])

    const crear = async (dto: CrearGrupoDto): Promise<boolean> => {
        try {
            const nuevo = await gruposApi.crearGrupo(dto)
            setGrupos(prev => [nuevo, ...prev])
            grupoToast.creado()
            return true
        } catch (err: any) {
            grupoToast.crearError(err.message)
            return false
        }
    }

    const actualizar = async (
        id: string,
        dto: ActualizarGrupoDto
    ): Promise<boolean> => {
        try {
            const actualizado = await gruposApi.actualizarGrupo(id, dto)
            setGrupos(prev =>
                prev.map(g => (g.id === id ? actualizado : g))
            )
            grupoToast.actualizado()
            return true
        } catch (err: any) {
            grupoToast.actualizarError(err.message)
            return false
        }
    }

    const eliminar = async (id: string): Promise<boolean> => {
        try {
            await gruposApi.eliminarGrupo(id)
            setGrupos(prev =>
                prev.map(g => (g.id === id ? { ...g, activo: false } : g))
            )
            grupoToast.desactivado()
            return true
        } catch (err: any) {
            grupoToast.eliminarError(err.message)
            return false
        }
    }

    return {
        grupos,
        cargando,
        error,
        recargar: cargar,
        crear,
        actualizar,
        eliminar,
    }
}