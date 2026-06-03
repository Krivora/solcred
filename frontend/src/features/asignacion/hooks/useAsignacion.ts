import { useState, useCallback } from 'react'
import * as asignacionApi from '../api/asignacion'
import type {
    GestorConCarga,
    AsignarManualDto,
    SolicitudAsignacion,
    FiltrosAsignacion,
    PaginatedResponse,
} from '../types/asignacion.types'
import { toast } from "@/shared/lib/utils/toast";

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
            toast.error(err.message ?? 'Error al cargar solicitudes')
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