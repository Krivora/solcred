'use client'

import { useQuery } from '@tanstack/react-query'
import { useListadoPromocion } from '@/features/promocion/hooks/useListadoPromocion'
import { financiamientoApi } from '@/features/financiamiento/api/financiamiento.api'
import { financiamientoKeys } from '@/features/financiamiento/lib/financiamiento.keys'
import type { FiltrosFinanciamiento } from '@/features/financiamiento/types/financiamiento.types'

const FILTROS_INICIALES: FiltrosFinanciamiento = {
  page: 1,
  pageSize: 10,
  tipoPersona: '',
  sector: '',
  tamanoEmpresa: '',
  programaId: '',
  fechaDesde: '',
  fechaHasta: '',
  busqueda: '',
}

export function useMesaControl(filtrosIniciales?: Partial<FiltrosFinanciamiento>) {
  return useListadoPromocion<FiltrosFinanciamiento>(
    {
      queryKey: financiamientoKeys.mesaControl,
      queryFn: (f) => financiamientoApi.listarMesaControl(f),
      filtrosIniciales: FILTROS_INICIALES,
      errorMsg: 'No se pudieron cargar las solicitudes en Mesa de Control.',
    },
    filtrosIniciales,
  )
}

export function useAsignacionFinanciamiento(filtrosIniciales?: Partial<FiltrosFinanciamiento>) {
  return useListadoPromocion<FiltrosFinanciamiento>(
    {
      queryKey: financiamientoKeys.asignacion,
      queryFn: (f) => financiamientoApi.listarAsignacion(f),
      filtrosIniciales: FILTROS_INICIALES,
      errorMsg: 'No se pudieron cargar las solicitudes por asignar.',
    },
    filtrosIniciales,
  )
}

export function useMisCasosFinanciamiento(filtrosIniciales?: Partial<FiltrosFinanciamiento>) {
  return useListadoPromocion<FiltrosFinanciamiento>(
    {
      queryKey: financiamientoKeys.misCasos,
      queryFn: (f) => financiamientoApi.listarMisCasos(f),
      filtrosIniciales: FILTROS_INICIALES,
      errorMsg: 'No se pudieron cargar tus casos asignados.',
    },
    filtrosIniciales,
  )
}

export function useValidacion(filtrosIniciales?: Partial<FiltrosFinanciamiento>) {
  return useListadoPromocion<FiltrosFinanciamiento>(
    {
      queryKey: financiamientoKeys.validacion,
      queryFn: (f) => financiamientoApi.listarValidacion(f),
      filtrosIniciales: FILTROS_INICIALES,
      errorMsg: 'No se pudieron cargar las solicitudes en validación.',
    },
    filtrosIniciales,
  )
}

export function useComite(filtrosIniciales?: Partial<FiltrosFinanciamiento>) {
  return useListadoPromocion<FiltrosFinanciamiento>(
    {
      queryKey: financiamientoKeys.comite,
      queryFn: (f) => financiamientoApi.listarComite(f),
      filtrosIniciales: FILTROS_INICIALES,
      errorMsg: 'No se pudieron cargar las solicitudes en comité.',
    },
    filtrosIniciales,
  )
}

// ── Auxiliares ───────────────────────────────────────────────────────────────

export function useFinanciamientoStats() {
  const { data, isLoading } = useQuery({
    queryKey: financiamientoKeys.stats(),
    queryFn: () => financiamientoApi.stats(),
  })
  return { stats: data ?? null, cargando: isLoading }
}

export function useAnalistas() {
  const { data, isLoading } = useQuery({
    queryKey: financiamientoKeys.analistas(),
    queryFn: () => financiamientoApi.analistas(),
    staleTime: 60_000,
  })
  return { analistas: data ?? [], cargando: isLoading }
}

export function useFinanciamientoDetalle(id: string) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: financiamientoKeys.detalle(id),
    queryFn: () => financiamientoApi.obtener(id),
    enabled: !!id,
  })
  return {
    solicitud: data ?? null,
    cargando: isLoading,
    error: isError ? 'No se pudo cargar la información de la solicitud.' : null,
    recargar: refetch,
  }
}
