'use client'

// ─────────────────────────────────────────────────────────────────────────────
// FilterBar — Componente reutilizable de filtros
//
// Uso declarativo: define los campos como configuración y el componente
// se encarga del render, sin repetir lógica ni markup en cada módulo.
// ─────────────────────────────────────────────────────────────────────────────

import { Search, X, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { cn } from '@/shared/lib/utils/cn'
import type {
  DateRangeField,
  FilterBarProps,
  FilterField as FilterFieldConfig,
  FilterBarValues,
  SearchField,
  SelectField,
} from '../types/Filterbar.types'

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convierte valor de Select a filtro: "todos" → "" */
const toFilterValue = (val: string): string => (val === 'todos' ? '' : val)

/** Convierte valor de filtro a Select: "" / undefined → "todos" */
const toSelectValue = (val?: string): string => (!val ? 'todos' : val)

// ── Sub-renders ───────────────────────────────────────────────────────────────

function SearchFilterField({
  field,
  values,
  onChange,
}: {
  field: SearchField
  values: FilterBarValues
  onChange: (patch: FilterBarValues) => void
}) {
  const value = values[field.key] ?? ''

  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
      <Input
        placeholder={field.placeholder ?? 'Buscar...'}
        value={value}
        onChange={e => onChange({ [field.key]: e.target.value })}
        className={cn(
          'pl-8 h-8 text-xs border-border/60',
          'focus-visible:border-primary/50 focus-visible:ring-primary/20',
          field.width ?? 'w-45',
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange({ [field.key]: '' })}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Limpiar búsqueda"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

function SelectFilterField({
  field,
  values,
  onChange,
}: {
  field: SelectField
  values: FilterBarValues
  onChange: (patch: FilterBarValues) => void
}) {
  return (
    <Select
      value={toSelectValue(values[field.key])}
      onValueChange={v => onChange({ [field.key]: toFilterValue(v) })}
    >
      <SelectTrigger
        className={cn(
          'h-8 w-auto text-xs border-border/60 data-[state=open]:border-primary/50',
          field.minWidth ?? 'min-w-32',
        )}
      >
        <SelectValue placeholder={field.placeholder} />
      </SelectTrigger>
      <SelectContent>
        {/* Opción "todos" */}
        <SelectItem value="todos">
          {field.allLabel ?? field.placeholder}
        </SelectItem>

        {field.options.map(opt => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.dotColor ? (
              <span className="flex items-center gap-1.5">
                <span
                  className={cn('w-1.5 h-1.5 rounded-full inline-block', opt.dotColor)}
                />
                {opt.label}
              </span>
            ) : (
              opt.label
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function DateRangeFilterField({
  field,
  values,
  onChange,
}: {
  field: DateRangeField
  values: FilterBarValues
  onChange: (patch: FilterBarValues) => void
}) {
  const from = values[field.fromKey] ?? ''
  const to = values[field.toKey] ?? ''
  const hasValue = from || to

  return (
    <>
      {field.label && (
        <span className="text-xs font-medium text-muted-foreground shrink-0">
          {field.label}
        </span>
      )}

      <Input
        type="date"
        value={from}
        onChange={e => onChange({ [field.fromKey]: e.target.value })}
        title="Desde"
        className="h-8 w-auto text-xs border-border/60 focus-visible:border-primary/50 focus-visible:ring-primary/20"
      />

      <span className="text-muted-foreground/50 text-xs font-light" aria-hidden>—</span>

      <Input
        type="date"
        value={to}
        onChange={e => onChange({ [field.toKey]: e.target.value })}
        title="Hasta"
        className="h-8 w-auto text-xs border-border/60 focus-visible:border-primary/50 focus-visible:ring-primary/20"
      />

      {hasValue && (
        <button
          type="button"
          onClick={() => onChange({ [field.fromKey]: '', [field.toKey]: '' })}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Limpiar rango de fechas"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </>
  )
}

// ── Render dispatcher ─────────────────────────────────────────────────────────

function FilterFieldRenderer({
  field,
  values,
  onChange,
}: {
  field: FilterFieldConfig
  values: FilterBarValues
  onChange: (patch: FilterBarValues) => void
}) {
  switch (field.type) {
    case 'search':
      return <SearchFilterField field={field} values={values} onChange={onChange} />
    case 'select':
      return <SelectFilterField field={field} values={values} onChange={onChange} />
    case 'daterange':
      return <DateRangeFilterField field={field} values={values} onChange={onChange} />
  }
}

// ── Componente principal ──────────────────────────────────────────────────────

export function FilterBar({
  fields,
  values,
  onChange,
  onClear,
  hasActiveFilters,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3">

      {/* Header */}
      <div className="flex items-center gap-2 mb-0.5">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">Filtros</span>
        </div>

        {hasActiveFilters && (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
            Activos
          </span>
        )}
      </div>

      {/* Campos */}
      <div className="flex flex-wrap gap-2 items-center">
        {fields.map((field) => (
          <FilterFieldRenderer
            key={field.type === 'daterange' ? `${field.fromKey}-${field.toKey}` : field.key}
            field={field}
            values={values}
            onChange={onChange}
          />
        ))}

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-8 gap-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 ml-auto text-xs"
          >
            <X className="h-3.5 w-3.5" />
            Limpiar filtros
          </Button>
        )}
      </div>

    </div>
  )
}