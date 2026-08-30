// features/promocion/hooks/useSolicitudesPromocion.ts
'use client'

import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { useState, useCallback } from 'react'
import { solicitudesApi } from '@/features/promocion/api/promocion.api'
import { promocionKeys } from '@/features/promocion/lib/promocion.keys'
import type { FiltrosPromocion } from '@/features/promocion/types/solicitud.types'

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
  const queryClient = useQueryClient()
  const [filtros, setFiltros] = useState<FiltrosPromocion>({
    ...FILTROS_INICIALES,
    ...filtrosIniciales,
  })

  const {
    data: listadoData,
    isLoading: cargando,
    isError,
    refetch: refetchListado,
  } = useQuery({
    queryKey: promocionKeys.listado(filtros),
    queryFn: () => solicitudesApi.listarPromocion(filtros),
    placeholderData: keepPreviousData, // mientras carga la nueva página, muestra la anterior en vez de vaciar la tabla
  })

  const { data: stats, isLoading: cargandoStats, refetch: refetchStats } = useQuery({
    queryKey: promocionKeys.stats(),
    queryFn: () => solicitudesApi.statsPromocion(),
  })

  const { data: gestores = [], refetch: refetchGestores } = useQuery({
    queryKey: promocionKeys.gestores(),
    queryFn: () => solicitudesApi.gestoresPromocion(),
    staleTime: 5 * 60_000, // los gestores cambian poco, cache más largo
  })

  const actualizarFiltros = useCallback((nuevos: Partial<FiltrosPromocion>) => {
    setFiltros(prev => ({ ...prev, ...nuevos, page: 1 }))
  }, [])

  const cambiarPagina = useCallback((page: number) => {
    setFiltros(prev => ({ ...prev, page }))
  }, [])

  const limpiarFiltros = useCallback(() => {
    setFiltros({ ...FILTROS_INICIALES, ...filtrosIniciales })
  }, [filtrosIniciales])

  // Recargar manual: invalida todo el árbol de promoción, forzando fetch fresco
  const recargar = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: promocionKeys.all })
  }, [queryClient])

  const hayFiltrosActivos = Object.entries(filtros).some(
    ([key, value]) =>
      !['page', 'limit'].includes(key) && value !== '' && value !== undefined
  )

  return {
    solicitudes: listadoData?.data ?? [],
    meta: listadoData?.meta ?? { total: 0, page: 1, limit: 20, totalPages: 0 },
    stats: stats ?? null,
    gestores,
    filtros,
    cargando,
    cargandoStats,
    error: isError ? 'No se pudieron cargar las solicitudes.' : null,
    hayFiltrosActivos,
    actualizarFiltros,
    cambiarPagina,
    limpiarFiltros,
    recargar,
  }
}

export function useSolicitudDetalle(id: string) {
  const {
    data: solicitud,
    isLoading: cargando,
    isError,
    refetch,
  } = useQuery({
    queryKey: promocionKeys.detalle(id),
    queryFn: () => solicitudesApi.obtener(id),
    enabled: !!id,
  })

  return {
    solicitud: solicitud ?? null,
    cargando,
    error: isError ? 'No se pudo cargar la información de la solicitud.' : null,
    recargar: refetch,
  }
}