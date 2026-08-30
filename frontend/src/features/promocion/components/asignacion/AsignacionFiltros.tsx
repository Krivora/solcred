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
import type { FiltrosAsignacion } from '@/features/promocion/types/asignacion.types'

interface Props {
    filtros: FiltrosAsignacion
    onFiltrar: (f: Partial<FiltrosAsignacion>) => void
    onLimpiar: () => void
    hayFiltrosActivos: boolean
}

const FIELDS: FilterFieldConfig[] = [
    SEARCH_SOLICITANTE_FIELD,
    TIPO_PERSONA_FIELD,
    SECTOR_FIELD,
    TAMANO_EMPRESA_FIELD,
    {
        type: 'select',
        key: 'asignacion',
        label: 'Asignación',
        placeholder: 'Asignación',
        allLabel: 'Todas las solicitudes',
        minWidth: 'min-w-36',
        options: [
            { value: 'asignados', label: 'Con gestor asignado', dotColor: 'bg-emerald-500' },
            { value: 'sin_asignar', label: 'Sin asignar', dotColor: 'bg-muted-foreground/40' },
        ],
    },
    PERIODO_FIELD,
]

export function AsignacionFiltros({ filtros, onFiltrar, onLimpiar, hayFiltrosActivos }: Props) {
    const values = useMemo(
        () => Object.fromEntries(
            Object.entries(filtros).map(([k, v]) => [k, v ?? '']),
        ),
        [filtros],
    )

    const handleChange = useCallback(
        ({ asignacion, ...rest }: Record<string, string>) => {
            onFiltrar({
                ...(rest as Partial<FiltrosAsignacion>),
                ...(asignacion !== undefined && {
                    asignacion: asignacion === ''
                        ? undefined
                        : (asignacion as 'asignados' | 'sin_asignar'),
                }),
            })
        },
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
