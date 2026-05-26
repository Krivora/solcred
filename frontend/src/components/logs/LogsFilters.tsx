'use client';

import { Search, SlidersHorizontal, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { LogFilters } from '@/lib/types/logs.types';
import { ACCIONES_LOG, MODULOS_LOG } from '@/lib/types/logs.types';
import { ACCION_CONFIG, MODULO_CONFIG } from '@/lib/config/logs.config';

interface LogsFiltersProps {
  filters: LogFilters;
  onUpdate: <K extends keyof LogFilters>(key: K, value: LogFilters[K]) => void;
  onReset: () => void;
  loading?: boolean;
}

export function LogsFilters({ filters, onUpdate, onReset, loading }: LogsFiltersProps) {
  const activeFiltersCount = [
    filters.accion,
    filters.modulo,
    filters.usuarioId,
    filters.fechaInicio,
    filters.fechaFin,
    filters.busqueda,
  ].filter(Boolean).length;

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Filtros</span>
          {activeFiltersCount > 0 && (
            <Badge
              variant="secondary"
              className="h-5 min-w-5 rounded-full px-1.5 text-xs font-bold"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            disabled={loading}
            className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            Limpiar filtros
          </Button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* Búsqueda libre */}
        <div className="relative xl:col-span-2">
          <Label className="mb-1.5 block text-xs text-muted-foreground">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar en descripción..."
              value={filters.busqueda}
              onChange={(e) => onUpdate('busqueda', e.target.value)}
              className="h-9 pl-9 text-sm"
              disabled={loading}
            />
            {filters.busqueda && (
              <button
                onClick={() => onUpdate('busqueda', '')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Acción */}
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">Acción</Label>
          <Select
            value={filters.accion || 'all'}
            onValueChange={(v) => onUpdate('accion', v === 'all' ? '' : (v as LogFilters['accion']))}
            disabled={loading}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las acciones</SelectItem>
              <Separator className="my-1" />
              {ACCIONES_LOG.map((accion) => {
                const cfg = ACCION_CONFIG[accion];
                return (
                  <SelectItem key={accion} value={accion}>
                    <span className="flex items-center gap-2">
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${cfg.className.includes('emerald') ? 'bg-emerald-500' : cfg.className.includes('blue') ? 'bg-blue-500' : cfg.className.includes('red') ? 'bg-red-500' : cfg.className.includes('violet') ? 'bg-violet-500' : cfg.className.includes('amber') ? 'bg-amber-500' : cfg.className.includes('rose') ? 'bg-rose-500' : 'bg-slate-400'}`}
                      />
                      {cfg.label}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Módulo */}
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">Módulo</Label>
          <Select
            value={filters.modulo || 'all'}
            onValueChange={(v) => onUpdate('modulo', v === 'all' ? '' : (v as LogFilters['modulo']))}
            disabled={loading}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los módulos</SelectItem>
              <Separator className="my-1" />
              {MODULOS_LOG.map((modulo) => {
                const cfg = MODULO_CONFIG[modulo];
                return (
                  <SelectItem key={modulo} value={modulo}>
                    {cfg.label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Fecha inicio */}
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">Desde</Label>
          <Input
            type="date"
            value={filters.fechaInicio}
            onChange={(e) => onUpdate('fechaInicio', e.target.value)}
            className="h-9 text-sm"
            disabled={loading}
            max={filters.fechaFin || undefined}
          />
        </div>

        {/* Fecha fin */}
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">Hasta</Label>
          <Input
            type="date"
            value={filters.fechaFin}
            onChange={(e) => onUpdate('fechaFin', e.target.value)}
            className="h-9 text-sm"
            disabled={loading}
            min={filters.fechaInicio || undefined}
          />
        </div>
      </div>

      {/* Active filter chips */}
      {activeFiltersCount > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {filters.accion && (
            <FilterChip
              label={`Acción: ${ACCION_CONFIG[filters.accion].label}`}
              onRemove={() => onUpdate('accion', '')}
            />
          )}
          {filters.modulo && (
            <FilterChip
              label={`Módulo: ${MODULO_CONFIG[filters.modulo].label}`}
              onRemove={() => onUpdate('modulo', '')}
            />
          )}
          {filters.fechaInicio && (
            <FilterChip
              label={`Desde: ${filters.fechaInicio}`}
              onRemove={() => onUpdate('fechaInicio', '')}
            />
          )}
          {filters.fechaFin && (
            <FilterChip
              label={`Hasta: ${filters.fechaFin}`}
              onRemove={() => onUpdate('fechaFin', '')}
            />
          )}
          {filters.busqueda && (
            <FilterChip
              label={`"${filters.busqueda}"`}
              onRemove={() => onUpdate('busqueda', '')}
            />
          )}
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 rounded-full text-muted-foreground transition-colors hover:text-foreground"
        aria-label={`Quitar filtro ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}