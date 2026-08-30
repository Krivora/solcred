import { useState, useCallback } from 'react'
import * as asignacionApi from '@/features/promocion/api/asignacion'
import type {
    GestorConCarga,
    AsignarManualDto,
    SolicitudAsignacion,
    FiltrosAsignacion,
    PaginatedResponse,
} from '@/features/promocion/types/asignacion.types'
import type { ResultadoAsignacion } from '@/features/promocion/api/asignacion'
import { solicitudToast } from '@/shared/lib/toaster'

interface EstadoAsignacionAutomatica {
    total: number
    exitosas: number
    fallidas: ResultadoAsignacion[]
    enProceso: boolean
    finalizado: boolean
}

const estadoAsignacionInicial: EstadoAsignacionAutomatica = {
    total: 0,
    exitosas: 0,
    fallidas: [],
    enProceso: false,
    finalizado: false,
}

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
        solicitudIds: string[],
        dto: AsignarManualDto,
        onSuccess?: () => void
    ): Promise<boolean> => {
        try {
            setAsignando(true)
            setEstadoAsignacion({ ...estadoAsignacionInicial, total: solicitudIds.length, enProceso: true })

            const resultados = await asignacionApi.asignarManualmente(solicitudIds, dto)

            const fallidas = resultados.filter((r) => !r.exito)
            const exitosas = resultados.filter((r) => r.exito).length

            setEstadoAsignacion({
                total: solicitudIds.length,
                exitosas,
                fallidas,
                enProceso: false,
                finalizado: true,
            })

            if (fallidas.length === 0) {
                solicitudToast.asignadaManualmente()
            }

            onSuccess?.()
            return fallidas.length === 0
        } catch (err: any) {
            setEstadoAsignacion((prev) => ({
                ...prev,
                enProceso: false,
                finalizado: true,
                fallidas: solicitudIds.map((id) => ({
                    solicitudId: id,
                    exito: false,
                    mensaje: err.message ?? 'Error de conexión con el servidor',
                })),
            }))
            solicitudToast.asignarError(err.message)
            return false
        } finally {
            setAsignando(false)
        }
    }

    // ── Asignación automática (ahora masiva) ────────────────────────────────
    const [estadoAsignacion, setEstadoAsignacion] = useState<EstadoAsignacionAutomatica>(
        estadoAsignacionInicial
    )

    const asignarAutomaticamente = async (
        solicitudIds: string[],
        onSuccess?: () => void
    ): Promise<boolean> => {
        try {
            setAsignando(true)
            setEstadoAsignacion({ ...estadoAsignacionInicial, total: solicitudIds.length, enProceso: true })

            const resultados = await asignacionApi.asignarAutomaticamente(solicitudIds)

            const fallidas = resultados.filter((r) => !r.exito)
            const exitosas = resultados.filter((r) => r.exito).length

            setEstadoAsignacion({
                total: solicitudIds.length,
                exitosas,
                fallidas,
                enProceso: false,
                finalizado: true,
            })

            if (fallidas.length === 0) {
                solicitudToast.asignadaAutomaticamente()
            }

            onSuccess?.()
            return fallidas.length === 0
        } catch (err: any) {
            // fallo general de red/servidor, no de solicitudes individuales
            setEstadoAsignacion((prev) => ({
                ...prev,
                enProceso: false,
                finalizado: true,
                fallidas: solicitudIds.map((id) => ({
                    solicitudId: id,
                    exito: false,
                    mensaje: err.message ?? 'Error de conexión con el servidor',
                })),
            }))
            solicitudToast.asignarError(err.message)
            return false
        } finally {
            setAsignando(false)
        }
    }

    const reiniciarEstadoAsignacion = useCallback(() => {
        setEstadoAsignacion(estadoAsignacionInicial)
    }, [])

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
        estadoAsignacion,
        reiniciarEstadoAsignacion,
    }
}