// components/admin/solicitudes/PromocionFiltros.tsx
'use client'

import { Search, X, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { FiltrosPromocion } from '@/lib/types/solicitudes.types'

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

      {/* Row 1: todos los filtros en línea */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Filtros:</span>
        </div>

        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-5.5 text-muted-foreground" />
          <Input
            placeholder="Nombre o RFC..."
            value={filtros.busqueda ?? ''}
            onChange={e => onFiltrar({ busqueda: e.target.value })}
            className="pl-8 h-8 w-[180px] text-xs"
          />
          {filtros.busqueda && (
            <button
              onClick={() => onFiltrar({ busqueda: '' })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
          <SelectTrigger className="h-8 w-auto min-w-[130px] text-xs">
            <SelectValue placeholder="Estatus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estatus</SelectItem>
            <SelectItem value="BORRADOR">Borrador</SelectItem>
            <SelectItem value="PENDIENTE">Pendiente</SelectItem>
            <SelectItem value="EN_REVISION">En revisión</SelectItem>
            <SelectItem value="APROBADO">Aprobado</SelectItem>
            <SelectItem value="RECHAZADO">Rechazado</SelectItem>
          </SelectContent>
        </Select>

        {/* Tipo persona */}
        <Select
          value={toSelect(filtros.tipoPersona)}
          onValueChange={v => onFiltrar({ tipoPersona: toFiltro(v) as any })}
        >
          <SelectTrigger className="h-8 w-auto min-w-[130px] text-xs">
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
          <SelectTrigger className="h-8 w-auto min-w-[130px] text-xs">
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
          <SelectTrigger className="h-8 w-auto min-w-[120px] text-xs">
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

        {/* Limpiar — al final del row */}
        {hayFiltrosActivos && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onLimpiar}
            className="h-8 gap-1.5 text-muted-foreground hover:text-foreground ml-auto"
          >
            <X className="h-3.5 w-3.5" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Row 2: rango de fechas */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground shrink-0">Período:</span>
        <Input
          type="date"
          value={filtros.fechaDesde ?? ''}
          onChange={e => onFiltrar({ fechaDesde: e.target.value })}
          className="h-8 w-auto text-xs"
          title="Desde"
        />
        <span className="text-muted-foreground text-xs">–</span>
        <Input
          type="date"
          value={filtros.fechaHasta ?? ''}
          onChange={e => onFiltrar({ fechaHasta: e.target.value })}
          className="h-8 w-auto text-xs"
          title="Hasta"
        />
        {(filtros.fechaDesde || filtros.fechaHasta) && (
          <button
            onClick={() => onFiltrar({ fechaDesde: '', fechaHasta: '' })}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

    </div>
  )
}