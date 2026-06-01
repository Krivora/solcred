// lib/hooks/useAsignacion.ts

import { useState, useCallback } from 'react'
import * as asignacionApi from '@/lib/api/admin/asignacion'
import type { GestorConCarga, AsignarManualDto } from '@/lib/types/asignacion.types'
import { toast } from "@/lib/utils/toast";

export function useAsignacion() {
    const [gestores, setGestores] = useState<GestorConCarga[]>([])
    const [cargandoGestores, setCargandoGestores] = useState(false)
    const [asignando, setAsignando] = useState(false)

    const cargarGestores = useCallback(async (grupoId?: string) => {
        try {
            setCargandoGestores(true)
            const data = await asignacionApi.obtenerCargaGestores(grupoId)
            setGestores(data)
        } catch (err: any) {
            toast.error(err.message ?? 'Error al cargar gestores')
        } finally {
            setCargandoGestores(false)
        }
    }, [])

    const asignarManualmente = async (
        solicitudId: string,
        dto: AsignarManualDto,
        onSuccess?: () => void
    ): Promise<boolean> => {
        try {
            setAsignando(true)
            await asignacionApi.asignarManualmente(solicitudId, dto)
            toast.success('Solicitud asignada correctamente')
            onSuccess?.()
            return true
        } catch (err: any) {
            toast.error(err.message ?? 'Error al asignar solicitud')
            return false
        } finally {
            setAsignando(false)
        }
    }

    const asignarAutomaticamente = async (
        solicitudId: string,
        onSuccess?: () => void
    ): Promise<boolean> => {
        try {
            setAsignando(true)
            await asignacionApi.asignarAutomaticamente(solicitudId)
            toast.success('Solicitud asignada automáticamente')
            onSuccess?.()
            return true
        } catch (err: any) {
            toast.error(err.message ?? 'Error al asignar solicitud')
            return false
        } finally {
            setAsignando(false)
        }
    }

    return {
        gestores,
        cargandoGestores,
        asignando,
        cargarGestores,
        asignarManualmente,
        asignarAutomaticamente,
    }
}