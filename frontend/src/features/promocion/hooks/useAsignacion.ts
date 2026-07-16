import { useState, useCallback } from 'react'
import * as asignacionApi from '../api/asignacion'
import type {
    GestorConCarga,
    AsignarManualDto,
    SolicitudAsignacion,
    FiltrosAsignacion,
    PaginatedResponse,
} from '../types/asignacion.types'
import { solicitudToast } from '@/shared/lib/utils/toaster'

export function useAsignacion() {
    const [gestores, setGestores] = useState<GestorConCarga[]>([])
    const [cargandoGestores, setCargandoGestores] = useState(false)
    const [asignando, setAsignando] = useState(false)

    // ── Solicitudes ───────────────────────────────────────────────────────────
    const [solicitudes, setSolicitudes] = useState<SolicitudAsignacion[]>([])
    const [meta, setMeta] = useState<PaginatedResponse<SolicitudAsignacion>['meta']>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    })
    const [cargandoSolicitudes, setCargandoSolicitudes] = useState(false)

    const cargarSolicitudes = useCallback(async (filtros: FiltrosAsignacion) => {
        try {
            setCargandoSolicitudes(true)
            const { data, meta } = await asignacionApi.listarSolicitudesAsignacion(filtros)
            setSolicitudes(data)
            setMeta(meta)
        } catch (err: any) {
            solicitudToast.cargarSolicitudesError(err.message)
        } finally {
            setCargandoSolicitudes(false)
        }
    }, [])

    // ── Gestores ──────────────────────────────────────────────────────────────
    const cargarGestores = useCallback(async (grupoId?: string) => {
        try {
            setCargandoGestores(true)
            const data = await asignacionApi.obtenerCargaGestores(grupoId)
            setGestores(data)
        } catch (err: any) {
            solicitudToast.cargarGestoresError(err.message)
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
            solicitudToast.asignadaManualmente()
            onSuccess?.()
            return true
        } catch (err: any) {
            solicitudToast.asignarError(err.message)
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
            solicitudToast.asignadaAutomaticamente()
            onSuccess?.()
            return true
        } catch (err: any) {
            solicitudToast.asignarError(err.message)
            return false
        } finally {
            setAsignando(false)
        }
    }

    return {
        solicitudes,
        meta,
        cargandoSolicitudes,
        cargarSolicitudes,
        gestores,
        cargandoGestores,
        cargarGestores,
        asignando,
        asignarManualmente,
        asignarAutomaticamente,
    }
}