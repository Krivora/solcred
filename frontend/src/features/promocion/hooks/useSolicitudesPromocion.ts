'use client'

import { useState, useEffect, useCallback } from 'react'
import { solicitudesApi } from '../api/promocion'
import type {
  SolicitudPromocion,
  PaginacionMeta,
  StatsPromocion,
  FiltrosPromocion,
  SolicitudDetalle,
  PersonalResumen
} from '@/features/promocion/types/solicitud.types'

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
  gestorId: '',
}

export function useSolicitudesPromocion(filtrosIniciales?: Partial<FiltrosPromocion>) {
  const [solicitudes, setSolicitudes] = useState<SolicitudPromocion[]>([])
  const [meta, setMeta] = useState<PaginacionMeta>({ total: 0, page: 1, limit: 20, totalPages: 0 })
  const [stats, setStats] = useState<StatsPromocion | null>(null)
  const [gestores, setGestores] = useState<PersonalResumen[]>([])
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

  const cargarGestores = useCallback(async () => {
    try {
      const data = await solicitudesApi.gestoresPromocion()
      setGestores(data)
    } catch {
      // silencioso — el filtro de gestor simplemente queda vacío
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

  // Stats y gestores: solo al montar. No dependen de filtros.
  useEffect(() => {
    cargarStats()
    cargarGestores()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Tabla: cada vez que cambian los filtros (incluye la carga inicial).
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

  // Recargar manual: sí refresca todo (botón "Actualizar" explícito).
  const recargar = useCallback(() => {
    cargarStats()
    cargarGestores()
    cargarSolicitudes(filtros)
  }, [filtros, cargarStats, cargarGestores, cargarSolicitudes])

  const hayFiltrosActivos = Object.entries(filtros).some(
    ([key, value]) =>
      !['page', 'limit'].includes(key) && value !== '' && value !== undefined
  )

  return {
    solicitudes,
    meta,
    stats,
    gestores,
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

export function useSolicitudDetalle(id: string) {
  const [solicitud, setSolicitud] = useState<SolicitudDetalle | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarSolicitud = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const data = await solicitudesApi.obtener(id)
      setSolicitud(data)
    } catch {
      setError('No se pudo cargar la información de la solicitud.')
    } finally {
      setCargando(false)
    }
  }, [id])

  useEffect(() => {
    if (id) cargarSolicitud()
  }, [id, cargarSolicitud])

  const recargar = useCallback(() => {
    cargarSolicitud()
  }, [cargarSolicitud])

  return {
    solicitud,
    cargando,
    error,
    recargar,
  }
}