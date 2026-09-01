'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'

export interface OpcionMultiSelect {
  value: string
  label: string
}

interface Props {
  label: string
  opciones: OpcionMultiSelect[]
  seleccionados: string[]
  onChange: (valores: string[]) => void
  placeholder?: string
  /** A partir de cuántas opciones se muestra el buscador interno. */
  umbralBusqueda?: number
  className?: string
}

/**
 * Selector múltiple: cada filtro del reporte admite elegir varios valores a
 * la vez (ej. sector Tecnología + Comercial + Agropecuario). El trigger
 * imita el `Select` de una sola opción para verse igual en la barra de
 * filtros; el contenido es una lista con checkboxes en vez de radio.
 */
export function MultiSelectFiltro({
  label,
  opciones,
  seleccionados,
  onChange,
  placeholder = 'Todos',
  umbralBusqueda = 7,
  className,
}: Props) {
  const [busqueda, setBusqueda] = useState('')
  const [abierto, setAbierto] = useState(false)

  const filtradas = useMemo(() => {
    if (!busqueda.trim()) return opciones
    const q = busqueda.trim().toLowerCase()
    return opciones.filter((o) => o.label.toLowerCase().includes(q))
  }, [busqueda, opciones])

  const set = new Set(seleccionados)

  const toggle = (value: string) => {
    const next = new Set(set)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    onChange([...next])
  }

  const textoTrigger =
    seleccionados.length === 0
      ? placeholder
      : seleccionados.length === 1
        ? (opciones.find((o) => o.value === seleccionados[0])?.label ?? '1 seleccionado')
        : `${seleccionados.length} seleccionados`

  return (
    <Popover open={abierto} onOpenChange={(v) => { setAbierto(v); if (!v) setBusqueda('') }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border px-2.5 text-xs transition-colors outline-none',
            'focus-visible:ring-3 focus-visible:ring-ring/50',
            seleccionados.length > 0
              ? 'border-primary/40 bg-primary/5 text-foreground'
              : 'border-input bg-transparent text-muted-foreground hover:text-foreground',
            className,
          )}
        >
          <span className="truncate">{textoTrigger}</span>
          <ChevronDown className="size-3.5 shrink-0 opacity-60" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-64">
        <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
          <span className="text-xs font-semibold text-foreground">{label}</span>
          {seleccionados.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="flex items-center gap-0.5 text-[11px] font-medium text-muted-foreground hover:text-destructive"
            >
              <X className="size-3" /> Limpiar
            </button>
          )}
        </div>

        {opciones.length > umbralBusqueda && (
          <div className="relative border-b border-border p-2">
            <Search className="absolute left-4.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar..."
              className="h-7 w-full rounded-md border border-input bg-transparent pl-6 pr-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            />
          </div>
        )}

        <div className="max-h-56 overflow-y-auto p-1.5">
          {filtradas.length === 0 ? (
            <p className="px-2 py-3 text-center text-xs text-muted-foreground">Sin resultados</p>
          ) : (
            filtradas.map((o) => {
              const checked = set.has(o.value)
              return (
                <label
                  key={o.value}
                  className="group flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-accent"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggle(o.value)}
                    className="shrink-0"
                  />
                  <span className="truncate text-foreground">{o.label}</span>
                </label>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
