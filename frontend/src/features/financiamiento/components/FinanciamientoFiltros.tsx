'use client'

import { useCallback, useMemo } from 'react'
import {
  SEARCH_SOLICITANTE_FIELD,
  TIPO_PERSONA_FIELD,
  SECTOR_FIELD,
  TAMANO_EMPRESA_FIELD,
  PERIODO_FIELD,
} from '@/features/promocion/components/common/filter-bar.constants'
import { FilterBar } from '@/features/promocion/components/common/FilterBar'
import type { FilterField as FilterFieldConfig } from '@/features/promocion/components/common/filter-bar.types'
import type { FiltrosFinanciamiento } from '@/features/financiamiento/types/financiamiento.types'

const FIELDS: FilterFieldConfig[] = [
  SEARCH_SOLICITANTE_FIELD,
  TIPO_PERSONA_FIELD,
  SECTOR_FIELD,
  TAMANO_EMPRESA_FIELD,
  PERIODO_FIELD,
]

interface Props {
  filtros: FiltrosFinanciamiento
  onFiltrar: (f: Partial<FiltrosFinanciamiento>) => void
  onLimpiar: () => void
  hayFiltrosActivos: boolean
}

export function FinanciamientoFiltros({ filtros, onFiltrar, onLimpiar, hayFiltrosActivos }: Props) {
  const values = useMemo(
    () => Object.fromEntries(Object.entries(filtros).map(([k, v]) => [k, v ?? ''])),
    [filtros],
  )
  const handleChange = useCallback(
    (patch: Record<string, string>) => onFiltrar(patch as Partial<FiltrosFinanciamiento>),
    [onFiltrar],
  )

  return (
    <FilterBar
      fields={FIELDS}
      values={values}
      onChange={handleChange}
      onClear={onLimpiar}
      hasActiveFilters={hayFiltrosActivos}
    />
  )
}
