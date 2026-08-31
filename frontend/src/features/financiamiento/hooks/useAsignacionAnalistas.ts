'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { financiamientoApi } from '@/features/financiamiento/api/financiamiento.api'
import type { PaginacionData } from '@/shared/types/api'
import type {
  SolicitudFinanciamiento,
  AnalistaConCarga,
  FiltrosAsignacionFinanciamiento,
  ResultadoAsignacion,
} from '@/features/financiamiento/types/financiamiento.types'

const getErrorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : 'Error de conexión con el servidor'

export interface EstadoAsignacion {
  total: number
  exitosas: number
  fallidas: ResultadoAsignacion[]
  enProceso: boolean
  finalizado: boolean
}

const ESTADO_INICIAL: EstadoAsignacion = {
  total: 0,
  exitosas: 0,
  fallidas: [],
  enProceso: false,
  finalizado: false,
}

const META_INICIAL: PaginacionData = { total: 0, page: 1, pageSize: 20, totalPages: 0 }

export function useAsignacionAnalistas() {
  const [solicitudes, setSolicitudes] = useState<SolicitudFinanciamiento[]>([])
  const [meta, setMeta] = useState<PaginacionData>(META_INICIAL)
  const [cargandoSolicitudes, setCargandoSolicitudes] = useState(false)

  const [analistas, setAnalistas] = useState<AnalistaConCarga[]>([])
  const [cargandoAnalistas, setCargandoAnalistas] = useState(false)

  const [asignando, setAsignando] = useState(false)
  const [estadoAsignacion, setEstadoAsignacion] = useState<EstadoAsignacion>(ESTADO_INICIAL)

  const cargarSolicitudes = useCallback(async (filtros: Partial<FiltrosAsignacionFinanciamiento>) => {
    try {
      setCargandoSolicitudes(true)
      const { data, pagination } = await financiamientoApi.listarParaAsignacion(filtros)
      setSolicitudes(data)
      setMeta(pagination)
    } catch (err) {
      toast.error('Error al cargar solicitudes', { description: getErrorMessage(err) })
    } finally {
      setCargandoSolicitudes(false)
    }
  }, [])

  const cargarAnalistas = useCallback(async () => {
    try {
      setCargandoAnalistas(true)
      setAnalistas(await financiamientoApi.analistas())
    } catch (err) {
      toast.error('Error al cargar analistas', { description: getErrorMessage(err) })
    } finally {
      setCargandoAnalistas(false)
    }
  }, [])

  const asignarAnalistas = useCallback(
    async (solicitudIds: string[], analistaId: string, motivo: string | undefined, onSuccess?: () => void) => {
      try {
        setAsignando(true)
        setEstadoAsignacion({ ...ESTADO_INICIAL, total: solicitudIds.length, enProceso: true })

        const resultados = await financiamientoApi.asignarAnalistas(solicitudIds, analistaId, motivo)
        const fallidas = resultados.filter((r) => !r.exito)
        const exitosas = resultados.length - fallidas.length

        setEstadoAsignacion({ total: solicitudIds.length, exitosas, fallidas, enProceso: false, finalizado: true })
        if (fallidas.length === 0) toast.success('Asignación completada')

        onSuccess?.()
        return fallidas.length === 0
      } catch (err) {
        const mensaje = getErrorMessage(err)
        setEstadoAsignacion((prev) => ({
          ...prev,
          enProceso: false,
          finalizado: true,
          fallidas: solicitudIds.map((id) => ({ solicitudId: id, exito: false, mensaje })),
        }))
        toast.error('Error al asignar', { description: mensaje })
        return false
      } finally {
        setAsignando(false)
      }
    },
    [],
  )

  const reiniciarEstadoAsignacion = useCallback(() => setEstadoAsignacion(ESTADO_INICIAL), [])

  return {
    solicitudes,
    meta,
    cargandoSolicitudes,
    cargarSolicitudes,
    analistas,
    cargandoAnalistas,
    cargarAnalistas,
    asignando,
    asignarAnalistas,
    estadoAsignacion,
    reiniciarEstadoAsignacion,
  }
}
