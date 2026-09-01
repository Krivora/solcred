import type { FiltrosReporte } from '@/features/reportes/types/reportes.types'

export const reportesKeys = {
  all: ['reportes'] as const,
  catalogos: () => [...reportesKeys.all, 'catalogos'] as const,
  previsualizar: (filtros: FiltrosReporte, page: number) =>
    [...reportesKeys.all, 'previsualizar', filtros, page] as const,
}
