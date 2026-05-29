// lib/hooks/useGrupos.ts

import { useState, useEffect, useCallback } from 'react'
import * as asignacionApi from '@/lib/api/asignacion'
import type {
    GrupoGestion,
    CrearGrupoDto,
    ActualizarGrupoDto,
} from '@/lib/types/asignacion.types'
import { toast } from "@/lib/utils/toast";

export function useGrupos() {
    const [grupos, setGrupos] = useState<GrupoGestion[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const cargar = useCallback(async () => {
        try {
            setCargando(true)
            setError(null)
            const data = await asignacionApi.listarGrupos()
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
            const nuevo = await asignacionApi.crearGrupo(dto)
            setGrupos(prev => [nuevo, ...prev])
            toast.success('Grupo creado correctamente')
            return true
        } catch (err: any) {
            toast.error(err.message ?? 'Error al crear grupo')
            return false
        }
    }

    const actualizar = async (
        id: string,
        dto: ActualizarGrupoDto
    ): Promise<boolean> => {
        try {
            const actualizado = await asignacionApi.actualizarGrupo(id, dto)
            setGrupos(prev =>
                prev.map(g => (g.id === id ? actualizado : g))
            )
            toast.success('Grupo actualizado correctamente')
            return true
        } catch (err: any) {
            toast.error(err.message ?? 'Error al actualizar grupo')
            return false
        }
    }

    const eliminar = async (id: string): Promise<boolean> => {
        try {
            await asignacionApi.eliminarGrupo(id)
            setGrupos(prev =>
                prev.map(g => (g.id === id ? { ...g, activo: false } : g))
            )
            toast.success('Grupo desactivado correctamente')
            return true
        } catch (err: any) {
            toast.error(err.message ?? 'Error al eliminar grupo')
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