'use client'

import { useState, useEffect, useCallback } from 'react'
import { solicitudesApi } from '../api/promocion'
import type {
  SolicitudPromocion,
  PaginacionMeta,
  StatsPromocion,
  FiltrosPromocion,
} from '@/shared/lib/types/solicitudes.types'

const FILTROS_INICIALES: FiltrosPromocion = {
  page: 1,
  limit: 10,
  estatus: '',
  tipoPersona: '',
  sector: '',
  tamanoEmpresa: '',
  programaId: '',
  fechaDesde: '',
  fechaHasta: '',
  busqueda: '',
  asignacion: '',
}

export function useSolicitudesPromocion(filtrosIniciales?: Partial<FiltrosPromocion>) {
  const [solicitudes, setSolicitudes] = useState<SolicitudPromocion[]>([])
  const [meta, setMeta] = useState<PaginacionMeta>({ total: 0, page: 1, limit: 20, totalPages: 0 })
  const [stats, setStats] = useState<StatsPromocion | null>(null)
  const [filtros, setFiltros] = useState<FiltrosPromocion>({
    ...FILTROS_INICIALES,
    ...filtrosIniciales,
  })
  const [cargando, setCargando] = useState(true)
  const [cargandoStats, setCargandoStats] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarStats = useCallback(async () => {
    setCargandoStats(true)
    try {
      const data = await solicitudesApi.statsPromocion()
      setStats(data)
    } catch {
      // silencioso — stats no bloquean la tabla
    } finally {
      setCargandoStats(false)
    }
  }, [])

  const cargarSolicitudes = useCallback(async (f: FiltrosPromocion) => {
    setCargando(true)
    setError(null)
    try {
      const { data, meta } = await solicitudesApi.listarPromocion(f)
      setSolicitudes(data)
      setMeta(meta)
    } catch {
      setError('No se pudieron cargar las solicitudes.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarStats()
  }, [cargarStats])

  useEffect(() => {
    cargarSolicitudes(filtros)
  }, [filtros, cargarSolicitudes])

  const actualizarFiltros = useCallback((nuevos: Partial<FiltrosPromocion>) => {
    setFiltros(prev => ({ ...prev, ...nuevos, page: 1 }))
  }, [])

  const cambiarPagina = useCallback((page: number) => {
    setFiltros(prev => ({ ...prev, page }))
  }, [])

  const limpiarFiltros = useCallback(() => {
    setFiltros({ ...FILTROS_INICIALES, ...filtrosIniciales })
  }, [filtrosIniciales])

  const recargar = useCallback(() => {
    cargarStats()
    cargarSolicitudes(filtros)
  }, [filtros, cargarStats, cargarSolicitudes])

  const hayFiltrosActivos = Object.entries(filtros).some(
    ([key, value]) =>
      !['page', 'limit'].includes(key) && value !== '' && value !== undefined
  )

  return {
    solicitudes,
    meta,
    stats,
    filtros,
    cargando,
    cargandoStats,
    error,
    hayFiltrosActivos,
    actualizarFiltros,
    cambiarPagina,
    limpiarFiltros,
    recargar,
  }
}