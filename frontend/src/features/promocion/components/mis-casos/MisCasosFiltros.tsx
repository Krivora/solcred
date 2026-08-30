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
import type { FiltrosMisCasos } from '@/features/promocion/types/solicitud.types'

// ── Config de campos ──────────────────────────────────────────────────────────

const FIELDS: FilterFieldConfig[] = [
  SEARCH_SOLICITANTE_FIELD,
  {
    type: 'select',
    key: 'estatus',
    placeholder: 'Estatus',
    allLabel: 'Todos los estatus',
    options: [
      { value: 'EN_REVISION',  label: 'En revisión',  dotColor: 'bg-primary'    },
      { value: 'EN_CORRECION', label: 'En corrección', dotColor: 'bg-orange-500' },
    ],
  },
  TIPO_PERSONA_FIELD,
  SECTOR_FIELD,
  TAMANO_EMPRESA_FIELD,
  PERIODO_FIELD,
]

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  filtros: FiltrosMisCasos
  onFiltrar: (f: Partial<FiltrosMisCasos>) => void
  onLimpiar: () => void
  hayFiltrosActivos: boolean
}

// ── Componente ────────────────────────────────────────────────────────────────

export function MisCasosFiltros({ filtros, onFiltrar, onLimpiar, hayFiltrosActivos }: Props) {
  const values = useMemo(
    () => Object.fromEntries(
      Object.entries(filtros).map(([k, v]) => [k, v ?? ''])
    ),
    [filtros],
  )

  const handleChange = useCallback(
    (patch: Record<string, string>) => onFiltrar(patch as Partial<FiltrosMisCasos>),
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