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
import type {
  FiltrosAsignacionFinanciamiento,
  AnalistaConCarga,
} from '@/features/financiamiento/types/financiamiento.types'

interface Props {
  filtros: FiltrosAsignacionFinanciamiento
  onFiltrar: (f: Partial<FiltrosAsignacionFinanciamiento>) => void
  onLimpiar: () => void
  hayFiltrosActivos: boolean
  analistas: AnalistaConCarga[]
}

const ASIGNACION_FIELD: FilterFieldConfig = {
  type: 'select',
  key: 'asignacion',
  label: 'Asignación',
  placeholder: 'Asignación',
  allLabel: 'Todas',
  minWidth: 'min-w-36',
  options: [
    { value: 'asignados', label: 'Con analista', dotColor: 'bg-emerald-500' },
    { value: 'sin_asignar', label: 'Sin asignar', dotColor: 'bg-muted-foreground/40' },
  ],
}

export function AsignacionAnalistaFiltros({ filtros, onFiltrar, onLimpiar, hayFiltrosActivos, analistas }: Props) {
  const fields = useMemo<FilterFieldConfig[]>(() => {
    const base: FilterFieldConfig[] = [
      SEARCH_SOLICITANTE_FIELD,
      TIPO_PERSONA_FIELD,
      SECTOR_FIELD,
      TAMANO_EMPRESA_FIELD,
      ASIGNACION_FIELD,
    ]
    if (analistas.length > 0) {
      base.push({
        type: 'select',
        key: 'analistaId',
        label: 'Analista',
        placeholder: 'Analista',
        allLabel: 'Todos los analistas',
        minWidth: 'min-w-40',
        options: analistas.map((a) => ({ value: a.id, label: `${a.nombre} ${a.apellidoPaterno}` })),
      })
    }
    base.push(PERIODO_FIELD)
    return base
  }, [analistas])

  const values = useMemo(
    () => Object.fromEntries(Object.entries(filtros).map(([k, v]) => [k, v ?? ''])),
    [filtros],
  )

  const handleChange = useCallback(
    ({ asignacion, analistaId, ...rest }: Record<string, string>) => {
      onFiltrar({
        ...(rest as Partial<FiltrosAsignacionFinanciamiento>),
        ...(asignacion !== undefined && {
          asignacion: asignacion === '' ? undefined : (asignacion as 'asignados' | 'sin_asignar'),
        }),
        ...(analistaId !== undefined && { analistaId: analistaId === '' ? undefined : analistaId }),
      })
    },
    [onFiltrar],
  )

  return (
    <FilterBar fields={fields} values={values} onChange={handleChange} onClear={onLimpiar} hasActiveFilters={hayFiltrosActivos} />
  )
}
