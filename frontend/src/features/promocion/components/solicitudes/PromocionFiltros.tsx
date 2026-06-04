'use client'

import { useCallback, useMemo } from 'react'
import {
  SEARCH_SOLICITANTE_FIELD,
  TIPO_PERSONA_FIELD,
  SECTOR_FIELD,
  TAMANO_EMPRESA_FIELD,
  PERIODO_FIELD,
} from '../../types/Filterbar.constants'
import { FilterBar } from '../Filterbar'
import type { FilterField as FilterFieldConfig } from '../../types/Filterbar.types'
import type { FiltrosPromocion } from '@/shared/lib/types/solicitudes.types'

// ── Config de campos ──────────────────────────────────────────────────────────

const FIELDS: FilterFieldConfig[] = [
  SEARCH_SOLICITANTE_FIELD,
  {
    type: 'select',
    key: 'estatus',
    placeholder: 'Estatus',
    allLabel: 'Todos los estatus',
    options: [
      { value: 'BORRADOR',    label: 'Borrador',    dotColor: 'bg-muted-foreground/60' },
      { value: 'PENDIENTE',   label: 'Pendiente',   dotColor: 'bg-amber-500'           },
      { value: 'EN_REVISION', label: 'En revisión', dotColor: 'bg-primary'             },
    ],
  },
  TIPO_PERSONA_FIELD,
  SECTOR_FIELD,
  TAMANO_EMPRESA_FIELD,
  {
    type: 'select',
    key: 'asignacion',
    placeholder: 'Asignación',
    allLabel: 'Todas las solicitudes',
    minWidth: 'min-w-36',
    options: [
      { value: 'asignados',   label: 'Con gestor asignado', dotColor: 'bg-emerald-500'         },
      { value: 'sin_asignar', label: 'Sin asignar',         dotColor: 'bg-muted-foreground/40' },
    ],
  },
  PERIODO_FIELD,
]

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  filtros: FiltrosPromocion
  onFiltrar: (f: Partial<FiltrosPromocion>) => void
  onLimpiar: () => void
  hayFiltrosActivos: boolean
}

// ── Componente ────────────────────────────────────────────────────────────────

export function PromocionFiltros({ filtros, onFiltrar, onLimpiar, hayFiltrosActivos }: Props) {
  const values = useMemo(
    () => Object.fromEntries(
      Object.entries(filtros).map(([k, v]) => [k, v ?? ''])
    ),
    [filtros],
  )

  const handleChange = useCallback(
    (patch: Record<string, string>) => onFiltrar(patch as Partial<FiltrosPromocion>),
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