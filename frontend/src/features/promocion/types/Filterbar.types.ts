// ─────────────────────────────────────────────────────────────────────────────
// FilterBar — Tipos
// ─────────────────────────────────────────────────────────────────────────────

export type FilterBarValues = Record<string, string>

// ── Definición de cada campo ─────────────────────────────────────────────────

interface FilterFieldBase {
    /** Clave que se usará en `values` al reportar cambios */
    key: string
}

export interface SearchField extends FilterFieldBase {
    type: 'search'
    label?: string
    placeholder?: string
    /** Ancho en clases de Tailwind. Default: "w-45" */
    width?: string
}

export interface SelectField extends FilterFieldBase {
    type: 'select'
    label?: string
    placeholder: string
    /** Label por defecto (opción "todos"). Default: igual que placeholder */
    allLabel?: string
    options: Array<{
        value: string
        label: string
        /** Color del dot indicador (clase bg-*) */
        dotColor?: string
    }>
    /** Ancho mínimo en clases de Tailwind. Default: "min-w-32" */
    minWidth?: string
}

export interface DateRangeField {
    type: 'daterange'
    /** Clave del campo "desde" */
    fromKey: string
    /** Clave del campo "hasta" */
    toKey: string
    label?: string
}

export type FilterField = SearchField | SelectField | DateRangeField

// ── Props del componente ─────────────────────────────────────────────────────

export interface FilterBarProps {
    fields: FilterField[]
    values: FilterBarValues
    onChange: (patch: FilterBarValues) => void
    onClear: () => void
    /** Se calcula externamente para máxima flexibilidad */
    hasActiveFilters: boolean
}