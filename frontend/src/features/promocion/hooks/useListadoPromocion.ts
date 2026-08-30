'use client'

import { useState, useCallback } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import type {
    SolicitudPromocion,
    PaginacionMeta,
} from '@/features/promocion/types/solicitud.types'

interface FiltrosBase {
    page?: number
    limit?: number
}

interface ListadoConfig<F extends FiltrosBase> {
    queryKey: (filtros: F) => readonly unknown[]
    queryFn: (filtros: F) => Promise<{ data: SolicitudPromocion[]; meta: PaginacionMeta }>
    filtrosIniciales: F
    errorMsg: string
}

const META_INICIAL: PaginacionMeta = { total: 0, page: 1, limit: 10, totalPages: 0 }

/**
 * Base compartida de los listados paginados+filtrados de promoción
 * (aprobación, histórico, mis-casos). Mismo contrato de retorno que
 * `useSolicitudesPromocion`.
 */
export function useListadoPromocion<F extends FiltrosBase>(
    config: ListadoConfig<F>,
    filtrosIniciales?: Partial<F>,
) {
    const base = { ...config.filtrosIniciales, ...filtrosIniciales }
    const [filtros, setFiltros] = useState<F>(base)

    const { data, isLoading: cargando, isError, refetch } = useQuery({
        queryKey: config.queryKey(filtros),
        queryFn: () => config.queryFn(filtros),
        placeholderData: keepPreviousData,
    })

    const actualizarFiltros = useCallback((nuevos: Partial<F>) => {
        setFiltros(prev => ({ ...prev, ...nuevos, page: 1 }))
    }, [])

    const cambiarPagina = useCallback((page: number) => {
        setFiltros(prev => ({ ...prev, page }))
    }, [])

    const limpiarFiltros = useCallback(() => {
        setFiltros({ ...config.filtrosIniciales, ...filtrosIniciales })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const hayFiltrosActivos = Object.entries(filtros).some(
        ([key, value]) =>
            !['page', 'limit'].includes(key) && value !== '' && value !== undefined,
    )

    return {
        solicitudes: data?.data ?? [],
        meta: data?.meta ?? META_INICIAL,
        filtros,
        cargando,
        error: isError ? config.errorMsg : null,
        hayFiltrosActivos,
        actualizarFiltros,
        cambiarPagina,
        limpiarFiltros,
        recargar: () => refetch(),
    }
}
