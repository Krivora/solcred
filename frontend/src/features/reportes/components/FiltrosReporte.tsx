'use client'

import { Search, X, FilterX } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { MontoInput } from '@/shared/components/common/MontoInput'
import { MultiSelectFiltro, type OpcionMultiSelect } from './MultiSelectFiltro'
import {
  ESTATUS_SOLICITUD_VALUES,
  SECTOR_VALUES,
  TAMANO_EMPRESA_VALUES,
  TIPO_PERSONA_VALUES,
} from '@/shared/types/domain.enums'
import { estatusSolicitud } from '@/shared/config/estatus.tokens'
import { SECTOR_LABELS, TAMANO_LABELS, TIPO_PERSONA_LABELS } from '@/shared/config/solicitudes.config'
import type { FiltrosReporte as FiltrosReporteType } from '@/features/reportes/types/reportes.types'
import type { CatalogosReporte } from '@/features/reportes/types/reportes.types'

const OPCIONES_ESTATUS: OpcionMultiSelect[] = ESTATUS_SOLICITUD_VALUES.map((e) => ({
  value: e,
  label: estatusSolicitud(e).label,
}))
const OPCIONES_SECTOR: OpcionMultiSelect[] = SECTOR_VALUES.map((s) => ({ value: s, label: SECTOR_LABELS[s] }))
const OPCIONES_TAMANO: OpcionMultiSelect[] = TAMANO_EMPRESA_VALUES.map((t) => ({ value: t, label: TAMANO_LABELS[t] }))
const OPCIONES_PERSONA: OpcionMultiSelect[] = TIPO_PERSONA_VALUES.map((t) => ({ value: t, label: TIPO_PERSONA_LABELS[t] }))

function catalogoAOpciones(items: { id: string; nombre: string }[]): OpcionMultiSelect[] {
  return items.map((i) => ({ value: i.id, label: i.nombre }))
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}

interface Props {
  filtros: FiltrosReporteType
  actualizarFiltro: <K extends keyof FiltrosReporteType>(campo: K, valor: FiltrosReporteType[K]) => void
  limpiarFiltros: () => void
  filtrosActivos: number
  catalogos: CatalogosReporte | null
  cargandoCatalogos: boolean
}

export function FiltrosReporte({
  filtros,
  actualizarFiltro,
  limpiarFiltros,
  filtrosActivos,
  catalogos,
  cargandoCatalogos,
}: Props) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border/70 bg-card p-4 shadow-sm sm:p-5">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">Filtros</h2>
          {filtrosActivos > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
              {filtrosActivos} activo{filtrosActivos === 1 ? '' : 's'}
            </span>
          )}
        </div>
        {filtrosActivos > 0 && (
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs text-muted-foreground" onClick={limpiarFiltros}>
            <FilterX className="size-3.5" />
            Limpiar todo
          </Button>
        )}
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        <Campo label="Estatus">
          <MultiSelectFiltro
            label="Estatus"
            opciones={OPCIONES_ESTATUS}
            seleccionados={filtros.estatus}
            onChange={(v) => actualizarFiltro('estatus', v as FiltrosReporteType['estatus'])}
          />
        </Campo>
        <Campo label="Sector">
          <MultiSelectFiltro
            label="Sector"
            opciones={OPCIONES_SECTOR}
            seleccionados={filtros.sector}
            onChange={(v) => actualizarFiltro('sector', v as FiltrosReporteType['sector'])}
          />
        </Campo>
        <Campo label="Tamaño de empresa">
          <MultiSelectFiltro
            label="Tamaño de empresa"
            opciones={OPCIONES_TAMANO}
            seleccionados={filtros.tamanoEmpresa}
            onChange={(v) => actualizarFiltro('tamanoEmpresa', v as FiltrosReporteType['tamanoEmpresa'])}
          />
        </Campo>
        <Campo label="Tipo de persona">
          <MultiSelectFiltro
            label="Tipo de persona"
            opciones={OPCIONES_PERSONA}
            seleccionados={filtros.tipoPersona}
            onChange={(v) => actualizarFiltro('tipoPersona', v as FiltrosReporteType['tipoPersona'])}
          />
        </Campo>

        <Campo label="Programa">
          <MultiSelectFiltro
            label="Programa"
            opciones={catalogoAOpciones(catalogos?.programas ?? [])}
            seleccionados={filtros.programaId}
            onChange={(v) => actualizarFiltro('programaId', v)}
            placeholder={cargandoCatalogos ? 'Cargando…' : 'Todos'}
          />
        </Campo>
        <Campo label="Gestor asignado">
          <MultiSelectFiltro
            label="Gestor"
            opciones={catalogoAOpciones(catalogos?.gestores ?? [])}
            seleccionados={filtros.gestorId}
            onChange={(v) => actualizarFiltro('gestorId', v)}
            placeholder={cargandoCatalogos ? 'Cargando…' : 'Todos'}
          />
        </Campo>
        <Campo label="Analista asignado">
          <MultiSelectFiltro
            label="Analista"
            opciones={catalogoAOpciones(catalogos?.analistas ?? [])}
            seleccionados={filtros.analistaId}
            onChange={(v) => actualizarFiltro('analistaId', v)}
            placeholder={cargandoCatalogos ? 'Cargando…' : 'Todos'}
          />
        </Campo>
        <Campo label="Grupo de gestión">
          <MultiSelectFiltro
            label="Grupo de gestión"
            opciones={catalogoAOpciones(catalogos?.grupos ?? [])}
            seleccionados={filtros.grupoId}
            onChange={(v) => actualizarFiltro('grupoId', v)}
            placeholder={cargandoCatalogos ? 'Cargando…' : 'Todos'}
          />
        </Campo>

        <Campo label="Solicitada desde">
          <Input
            type="date"
            value={filtros.fechaDesde}
            onChange={(e) => actualizarFiltro('fechaDesde', e.target.value)}
            className="h-8 text-xs"
          />
        </Campo>
        <Campo label="Solicitada hasta">
          <Input
            type="date"
            value={filtros.fechaHasta}
            onChange={(e) => actualizarFiltro('fechaHasta', e.target.value)}
            className="h-8 text-xs"
          />
        </Campo>
        <Campo label="Resuelta desde">
          <Input
            type="date"
            value={filtros.fechaResueltaDesde}
            onChange={(e) => actualizarFiltro('fechaResueltaDesde', e.target.value)}
            className="h-8 text-xs"
          />
        </Campo>
        <Campo label="Resuelta hasta">
          <Input
            type="date"
            value={filtros.fechaResueltaHasta}
            onChange={(e) => actualizarFiltro('fechaResueltaHasta', e.target.value)}
            className="h-8 text-xs"
          />
        </Campo>

        <Campo label="Monto mínimo">
          <MontoInput
            value={filtros.montoMin}
            onChange={(v) => actualizarFiltro('montoMin', v)}
            className="h-8 text-xs"
          />
        </Campo>
        <Campo label="Monto máximo">
          <MontoInput
            value={filtros.montoMax}
            onChange={(v) => actualizarFiltro('montoMax', v)}
            className="h-8 text-xs"
          />
        </Campo>

        <div className="col-span-2 sm:col-span-1 xl:col-span-2">
          <Campo label="Buscar (folio, nombre, RFC, CURP)">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={filtros.busqueda}
                onChange={(e) => actualizarFiltro('busqueda', e.target.value)}
                placeholder="Ej. García, SCP-2026, ABCD900101..."
                className="h-8 pl-8 pr-7 text-xs"
              />
              {filtros.busqueda && (
                <button
                  type="button"
                  onClick={() => actualizarFiltro('busqueda', '')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </Campo>
        </div>
      </div>
    </section>
  )
}
