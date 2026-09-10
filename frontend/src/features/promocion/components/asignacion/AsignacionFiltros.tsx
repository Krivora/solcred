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
import type { FiltrosAsignacion, GestorConCarga } from '@/features/promocion/types/asignacion.types'

interface Props {
    filtros: FiltrosAsignacion
    onFiltrar: (f: Partial<FiltrosAsignacion>) => void
    onLimpiar: () => void
    hayFiltrosActivos: boolean
    /** Para el select "Gestor" — permite filtrar (y así reasignar en lote) por gestor. */
    gestores?: GestorConCarga[]
}

const ASIGNACION_FIELD: FilterFieldConfig = {
    type: 'select',
    key: 'asignacion',
    label: 'Asignación',
    placeholder: 'Asignación',
    allLabel: 'Todas las solicitudes',
    minWidth: 'min-w-36',
    options: [
        { value: 'asignados', label: 'Con gestor asignado', dotColor: 'bg-ok' },
        { value: 'sin_asignar', label: 'Sin asignar', dotColor: 'bg-muted-foreground/40' },
    ],
}

export function AsignacionFiltros({ filtros, onFiltrar, onLimpiar, hayFiltrosActivos, gestores = [] }: Props) {
    const fields = useMemo<FilterFieldConfig[]>(() => {
        const base: FilterFieldConfig[] = [
            SEARCH_SOLICITANTE_FIELD,
            TIPO_PERSONA_FIELD,
            SECTOR_FIELD,
            TAMANO_EMPRESA_FIELD,
            ASIGNACION_FIELD,
        ]
        if (gestores.length > 0) {
            base.push({
                type: 'select',
                key: 'gestorId',
                label: 'Gestor',
                placeholder: 'Gestor',
                allLabel: 'Todos los gestores',
                minWidth: 'min-w-40',
                options: gestores.map((g) => ({
                    value: g.id,
                    label: `${g.nombre} ${g.apellidoPaterno}`,
                })),
            })
        }
        base.push(PERIODO_FIELD)
        return base
    }, [gestores])

    const values = useMemo(
        () => Object.fromEntries(
            Object.entries(filtros).map(([k, v]) => [k, v ?? '']),
        ),
        [filtros],
    )

    const handleChange = useCallback(
        ({ asignacion, gestorId, ...rest }: Record<string, string>) => {
            onFiltrar({
                ...(rest as Partial<FiltrosAsignacion>),
                ...(asignacion !== undefined && {
                    asignacion: asignacion === ''
                        ? undefined
                        : (asignacion as 'asignados' | 'sin_asignar'),
                }),
                ...(gestorId !== undefined && {
                    gestorId: gestorId === '' ? undefined : gestorId,
                }),
            })
        },
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
