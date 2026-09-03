'use client';

import { Search, SlidersHorizontal, X, RotateCcw, CalendarRange } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import type { LogFilters } from '@/features/settings/types/logs.types';
import { ACCIONES_LOG, MODULOS_LOG } from '@/features/settings/types/logs.types';
import { ACCION_CONFIG, MODULO_CONFIG } from '@/shared/config/logs.config';

interface LogsFiltersProps {
  filters: LogFilters;
  onUpdate: <K extends keyof LogFilters>(key: K, value: LogFilters[K]) => void;
  onReset: () => void;
  loading?: boolean;
}

// Punto de color de cada acción, derivado de su `variant` semántico.
const ACCION_DOT: Record<string, string> = {
  default: 'bg-brand',
  success: 'bg-brand',
  info: 'bg-info',
  warning: 'bg-warn',
  destructive: 'bg-danger',
  secondary: 'bg-ink-subtle',
};

function getAccionDot(variant: string): string {
  return ACCION_DOT[variant] ?? 'bg-ink-subtle';
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
    <div className="space-y-3">
      {/* Card principal */}
      <div className="rounded-xl border bg-card shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Filtros</span>
            {activeFiltersCount > 0 && (
              <Badge className="h-5 min-w-[20px] rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
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
              className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-destructive"
            >
              <RotateCcw className="h-3 w-3" />
              Limpiar
            </Button>
          )}
        </div>

        <div className="p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto_auto]">

            {/* Búsqueda */}
            <div className="sm:col-span-2 lg:col-span-2">
              <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Búsqueda
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Buscar en descripción..."
                  value={filters.busqueda}
                  onChange={(e) => onUpdate('busqueda', e.target.value)}
                  className="h-9 pl-9 pr-8 text-sm"
                  disabled={loading}
                />
                {filters.busqueda && (
                  <button
                    onClick={() => onUpdate('busqueda', '')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Limpiar búsqueda"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Acción */}
            <div>
              <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Acción
              </Label>
              <Select
                value={filters.accion || 'all'}
                onValueChange={(v) =>
                  onUpdate('accion', v === 'all' ? '' : (v as LogFilters['accion']))
                }
                disabled={loading}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las acciones</SelectItem>
                  <div className="my-1 h-px bg-border" />
                  {ACCIONES_LOG.map((accion) => {
                    const cfg = ACCION_CONFIG[accion];
                    return (
                      <SelectItem key={accion} value={accion}>
                        <span className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full shrink-0 ${getAccionDot(cfg.variant)}`} />
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
              <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Módulo
              </Label>
              <Select
                value={filters.modulo || 'all'}
                onValueChange={(v) =>
                  onUpdate('modulo', v === 'all' ? '' : (v as LogFilters['modulo']))
                }
                disabled={loading}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los módulos</SelectItem>
                  <div className="my-1 h-px bg-border" />
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

            {/* Rango de fechas */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <CalendarRange className="h-3.5 w-3.5" />
                Rango de fechas
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={filters.fechaInicio}
                  onChange={(e) => onUpdate('fechaInicio', e.target.value)}
                  className="h-9 text-sm"
                  disabled={loading}
                  max={filters.fechaFin || undefined}
                  aria-label="Fecha inicio"
                />
                <span className="shrink-0 text-xs text-muted-foreground">—</span>
                <Input
                  type="date"
                  value={filters.fechaFin}
                  onChange={(e) => onUpdate('fechaFin', e.target.value)}
                  className="h-9 text-sm"
                  disabled={loading}
                  min={filters.fechaInicio || undefined}
                  aria-label="Fecha fin"
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Chips de filtros activos — separados del card para no agrandar el panel */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Activos:</span>

          {filters.busqueda && (
            <FilterChip
              label={`"${filters.busqueda}"`}
              onRemove={() => onUpdate('busqueda', '')}
            />
          )}
          {filters.accion && (
            <FilterChip
              label={ACCION_CONFIG[filters.accion].label}
              onRemove={() => onUpdate('accion', '')}
            />
          )}
          {filters.modulo && (
            <FilterChip
              label={MODULO_CONFIG[filters.modulo].label}
              onRemove={() => onUpdate('modulo', '')}
            />
          )}
          {(filters.fechaInicio || filters.fechaFin) && (
            <FilterChip
              label={
                filters.fechaInicio && filters.fechaFin
                  ? `${filters.fechaInicio} → ${filters.fechaFin}`
                  : filters.fechaInicio
                  ? `Desde ${filters.fechaInicio}`
                  : `Hasta ${filters.fechaFin}`
              }
              onRemove={() => {
                onUpdate('fechaInicio', '');
                onUpdate('fechaFin', '');
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground transition-colors hover:border-muted-foreground/40">
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        aria-label={`Quitar filtro ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}