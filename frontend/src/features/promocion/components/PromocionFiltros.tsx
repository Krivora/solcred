// components/admin/solicitudes/PromocionFiltros.tsx
'use client'

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
import type { FiltrosPromocion } from '@/shared/lib/types/solicitudes.types'

interface Props {
  filtros: FiltrosPromocion
  onFiltrar: (f: Partial<FiltrosPromocion>) => void
  onLimpiar: () => void
  hayFiltrosActivos: boolean
}

const toFiltro = (val: string) => (val === 'todos' ? '' : val)
const toSelect = (val?: string) => (!val ? 'todos' : val)

export function PromocionFiltros({ filtros, onFiltrar, onLimpiar, hayFiltrosActivos }: Props) {
  return (
    <div className="flex flex-col gap-3">

      {/* Label de sección */}
      <div className="flex items-center gap-2 mb-0.5">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">Filtros</span>
        </div>
        {hayFiltrosActivos && (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
            Activos
          </span>
        )}
      </div>

      {/* Row 1: filtros en línea */}
      <div className="flex flex-wrap gap-2 items-center">

        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Nombre o RFC..."
            value={filtros.busqueda ?? ''}
            onChange={e => onFiltrar({ busqueda: e.target.value })}
            className="pl-8 h-8 w-45 text-xs border-border/60 focus-visible:border-primary/50 focus-visible:ring-primary/20"
          />
          {filtros.busqueda && (
            <button
              onClick={() => onFiltrar({ busqueda: '' })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Estatus */}
        <Select
          value={toSelect(filtros.estatus)}
          onValueChange={v => onFiltrar({ estatus: toFiltro(v) as any })}
        >
          <SelectTrigger className="h-8 w-auto min-w-32 text-xs border-border/60 data-[state=open]:border-primary/50">
            <SelectValue placeholder="Estatus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estatus</SelectItem>
            <SelectItem value="BORRADOR">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 inline-block" />
                Borrador
              </span>
            </SelectItem>
            <SelectItem value="PENDIENTE">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                Pendiente
              </span>
            </SelectItem>
            <SelectItem value="EN_REVISION">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                En revisión
              </span>
            </SelectItem>
            <SelectItem value="APROBADO">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                Aprobado
              </span>
            </SelectItem>
            <SelectItem value="RECHAZADO">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive inline-block" />
                Rechazado
              </span>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Tipo persona */}
        <Select
          value={toSelect(filtros.tipoPersona)}
          onValueChange={v => onFiltrar({ tipoPersona: toFiltro(v) as any })}
        >
          <SelectTrigger className="h-8 w-auto min-w-32 text-xs border-border/60 data-[state=open]:border-primary/50">
            <SelectValue placeholder="Tipo persona" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Tipo persona</SelectItem>
            <SelectItem value="FISICA">Persona Física</SelectItem>
            <SelectItem value="MORAL">Persona Moral</SelectItem>
          </SelectContent>
        </Select>

        {/* Sector */}
        <Select
          value={toSelect(filtros.sector)}
          onValueChange={v => onFiltrar({ sector: toFiltro(v) as any })}
        >
          <SelectTrigger className="h-8 w-auto min-w-32 text-xs border-border/60 data-[state=open]:border-primary/50">
            <SelectValue placeholder="Sector" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los sectores</SelectItem>
            <SelectItem value="AGROPECUARIO">Agropecuario</SelectItem>
            <SelectItem value="INDUSTRIAL">Industrial</SelectItem>
            <SelectItem value="COMERCIAL">Comercial</SelectItem>
            <SelectItem value="SERVICIOS">Servicios</SelectItem>
            <SelectItem value="TECNOLOGIA">Tecnología</SelectItem>
            <SelectItem value="OTRO">Otro</SelectItem>
          </SelectContent>
        </Select>

        {/* Tamaño empresa */}
        <Select
          value={toSelect(filtros.tamanoEmpresa)}
          onValueChange={v => onFiltrar({ tamanoEmpresa: toFiltro(v) as any })}
        >
          <SelectTrigger className="h-8 w-auto min-w-30 text-xs border-border/60 data-[state=open]:border-primary/50">
            <SelectValue placeholder="Tamaño" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Tamaño empresa</SelectItem>
            <SelectItem value="MICRO">Micro</SelectItem>
            <SelectItem value="PEQUENA">Pequeña</SelectItem>
            <SelectItem value="MEDIANA">Mediana</SelectItem>
            <SelectItem value="GRANDE">Grande</SelectItem>
          </SelectContent>
        </Select>
        {/* Asignación */}
        <Select
          value={toSelect(filtros.asignacion)}
          onValueChange={v => onFiltrar({ asignacion: toFiltro(v) as any })}
        >
          <SelectTrigger className="h-8 w-auto min-w-36 text-xs border-border/60 data-[state=open]:border-primary/50">
            <SelectValue placeholder="Asignación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas las solicitudes</SelectItem>
            <SelectItem value="asignados">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                Con gestor asignado
              </span>
            </SelectItem>
            <SelectItem value="sin_asignar">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 inline-block" />
                Sin asignar
              </span>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Limpiar */}
        {hayFiltrosActivos && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onLimpiar}
            className="h-8 gap-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 ml-auto text-xs"
          >
            <X className="h-3.5 w-3.5" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Row 2: rango de fechas */}
      <div className="flex items-center gap-2 pt-0.5">
        <span className="text-xs font-medium text-muted-foreground shrink-0">Período:</span>
        <Input
          type="date"
          value={filtros.fechaDesde ?? ''}
          onChange={e => onFiltrar({ fechaDesde: e.target.value })}
          className="h-8 w-auto text-xs border-border/60 focus-visible:border-primary/50 focus-visible:ring-primary/20"
          title="Desde"
        />
        <span className="text-muted-foreground/50 text-xs font-light">—</span>
        <Input
          type="date"
          value={filtros.fechaHasta ?? ''}
          onChange={e => onFiltrar({ fechaHasta: e.target.value })}
          className="h-8 w-auto text-xs border-border/60 focus-visible:border-primary/50 focus-visible:ring-primary/20"
          title="Hasta"
        />
        {(filtros.fechaDesde || filtros.fechaHasta) && (
          <button
            onClick={() => onFiltrar({ fechaDesde: '', fechaHasta: '' })}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

    </div>
  )
}