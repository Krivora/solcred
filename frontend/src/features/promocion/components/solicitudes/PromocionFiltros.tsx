// PromocionFiltros.tsx
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
import type { FiltrosPromocion, PersonalResumen } from '@/features/promocion/types/solicitud.types'

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  filtros: FiltrosPromocion
  gestores: PersonalResumen[]
  onFiltrar: (f: Partial<FiltrosPromocion>) => void
  onLimpiar: () => void
  hayFiltrosActivos: boolean
}

// ── Componente ────────────────────────────────────────────────────────────────

export function PromocionFiltros({ filtros, gestores, onFiltrar, onLimpiar, hayFiltrosActivos }: Props) {
  const fields: FilterFieldConfig[] = useMemo(() => [
    SEARCH_SOLICITANTE_FIELD,
    {
      type: 'select',
      key: 'estatus',
      label: 'Estatus',
      placeholder: 'Estatus',
      allLabel: 'Todos los estatus',
      options: [
        { value: 'BORRADOR',    label: 'Borrador',    dotColor: 'bg-ink-subtle'  },
        { value: 'PENDIENTE',   label: 'Pendiente',   dotColor: 'bg-warn'        },
        { value: 'EN_REVISION', label: 'En revisión', dotColor: 'bg-brand'       },
      ],
    },
    TIPO_PERSONA_FIELD,
    SECTOR_FIELD,
    TAMANO_EMPRESA_FIELD,
    {
      type: 'select',
      key: 'gestorId',
      label: 'Gestor',
      placeholder: 'Gestor',
      allLabel: 'Todos los gestores',
      minWidth: 'min-w-40',
      options: gestores.map(g => ({
        value: g.id,
        label: `${g.usuario.nombre} ${g.usuario.apellidoPaterno}`,
      })),
    },
    PERIODO_FIELD,
  ], [gestores])

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
      fields={fields}
      values={values}
      onChange={handleChange}
      onClear={onLimpiar}
      hasActiveFilters={hayFiltrosActivos}
    />
  )
}