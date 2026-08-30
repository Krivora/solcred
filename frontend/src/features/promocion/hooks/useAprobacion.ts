'use client'

import { useState, useEffect, useCallback } from 'react'
import { solicitudesApi } from '@/features/promocion/api/promocion'
import type {
  SolicitudPromocion,
  PaginacionMeta,
  FiltrosAprobacion,
} from '@/features/promocion/types/solicitud.types'

const FILTROS_INICIALES: FiltrosAprobacion = {
  page: 1,
  limit: 10,
  tipoPersona: '',
  sector: '',
  tamanoEmpresa: '',
  programaId: '',
  fechaDesde: '',
  fechaHasta: '',
  busqueda: '',
}

export function useAprobacion(filtrosIniciales?: Partial<FiltrosAprobacion>) {
  const [solicitudes, setSolicitudes] = useState<SolicitudPromocion[]>([])
  const [meta, setMeta] = useState<PaginacionMeta>({ total: 0, page: 1, limit: 10, totalPages: 0 })
  const [filtros, setFiltros] = useState<FiltrosAprobacion>({
    ...FILTROS_INICIALES,
    ...filtrosIniciales,
  })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarSolicitudes = useCallback(async (f: FiltrosAprobacion) => {
    setCargando(true)
    setError(null)
    try {
      const { data, meta } = await solicitudesApi.listarAprobacion(f)
      setSolicitudes(data)
      setMeta(meta)
    } catch {
      setError('No se pudieron cargar las solicitudes en aprobación.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarSolicitudes(filtros)
  }, [filtros, cargarSolicitudes])

  const actualizarFiltros = useCallback((nuevos: Partial<FiltrosAprobacion>) => {
    setFiltros(prev => ({ ...prev, ...nuevos, page: 1 }))
  }, [])

  const cambiarPagina = useCallback((page: number) => {
    setFiltros(prev => ({ ...prev, page }))
  }, [])

  const limpiarFiltros = useCallback(() => {
    setFiltros({ ...FILTROS_INICIALES, ...filtrosIniciales })
  }, [filtrosIniciales])

  const recargar = useCallback(() => {
    cargarSolicitudes(filtros)
  }, [filtros, cargarSolicitudes])

  const hayFiltrosActivos = Object.entries(filtros).some(
    ([key, value]) =>
      !['page', 'limit'].includes(key) && value !== '' && value !== undefined
  )

  return {
    solicitudes,
    meta,
    filtros,
    cargando,
    error,
    hayFiltrosActivos,
    actualizarFiltros,
    cambiarPagina,
    limpiarFiltros,
    recargar,
  }
}