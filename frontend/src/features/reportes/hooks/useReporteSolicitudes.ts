'use client'

import { useCallback, useState } from 'react'
import { useMutation, useQuery, keepPreviousData } from '@tanstack/react-query'
import { toast } from 'sonner'
import { reportesApi } from '@/features/reportes/api/reportes.api'
import { reportesKeys } from '@/features/reportes/lib/reportes.keys'
import { FILTROS_INICIALES, contarFiltrosActivos } from '@/features/reportes/lib/reportes.filtros'
import type { FiltrosReporte } from '@/features/reportes/types/reportes.types'

const PAGE_SIZE = 15

function descargarBlob(blob: Blob, nombreArchivo: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombreArchivo
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function useReporteSolicitudes() {
  const [filtros, setFiltros] = useState<FiltrosReporte>(FILTROS_INICIALES)
  const [page, setPage] = useState(1)

  const { data: catalogos, isLoading: cargandoCatalogos } = useQuery({
    queryKey: reportesKeys.catalogos(),
    queryFn: () => reportesApi.catalogos(),
    staleTime: 5 * 60_000,
  })

  const {
    data: previsualizacion,
    isLoading: cargandoPrevia,
    isFetching: refrescandoPrevia,
    isError,
  } = useQuery({
    queryKey: reportesKeys.previsualizar(filtros, page),
    queryFn: () => reportesApi.previsualizar(filtros, page, PAGE_SIZE),
    placeholderData: keepPreviousData,
  })

  const exportarMutation = useMutation({
    mutationFn: () => reportesApi.exportar(filtros),
    onSuccess: (blob) => {
      const fecha = new Date().toISOString().slice(0, 10)
      descargarBlob(blob, `reporte-solicitudes-${fecha}.xlsx`)
      toast.success('Reporte exportado', {
        description: 'La descarga del Excel comenzó en tu navegador.',
      })
    },
    onError: () => {
      toast.error('No se pudo exportar el reporte', {
        description: 'Intenta de nuevo o acota los filtros.',
      })
    },
  })

  const actualizarFiltro = useCallback(<K extends keyof FiltrosReporte>(campo: K, valor: FiltrosReporte[K]) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }))
    setPage(1)
  }, [])

  const limpiarFiltros = useCallback(() => {
    setFiltros(FILTROS_INICIALES)
    setPage(1)
  }, [])

  return {
    filtros,
    actualizarFiltro,
    limpiarFiltros,
    filtrosActivos: contarFiltrosActivos(filtros),

    catalogos: catalogos ?? null,
    cargandoCatalogos,

    filas: previsualizacion?.data ?? [],
    resumen: previsualizacion?.resumen ?? null,
    paginacion: previsualizacion?.pagination ?? { page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 0 },
    page,
    cambiarPagina: setPage,
    cargandoPrevia,
    refrescandoPrevia,
    error: isError ? 'No se pudo cargar la vista previa del reporte.' : null,

    exportar: exportarMutation.mutate,
    exportando: exportarMutation.isPending,
  }
}
