'use client';

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  Monitor,
  RefreshCw,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import type { LogAuditoria } from '../types/logs.types';
import {
  ACCION_CONFIG,
  MODULO_CONFIG,
  formatRelativeTime,
  formatFullDate,
} from '@/shared/config/logs.config';

interface LogsTableProps {
  logs: LogAuditoria[];
  loading: boolean;
  paginacion: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
  onPageChange: (page: number) => void;
  onViewDetail: (log: LogAuditoria) => void;
  onRefresh: () => void;
}

export function LogsTable({
  logs,
  loading,
  paginacion,
  onPageChange,
  onViewDetail,
  onRefresh,
}: LogsTableProps) {
  const { pagina, total, totalPaginas, limite } = paginacion;
  const desde = (pagina - 1) * limite + 1;
  const hasta = Math.min(pagina * limite, total);

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Table header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">Registros</span>
          {total > 0 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {total.toLocaleString('es-MX')}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="h-7 gap-1.5 text-xs"
          aria-label="Actualizar tabla"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Fecha
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Acción
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Módulo
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Descripción
              </th>
              <th className="hidden px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:table-cell">
                Usuario
              </th>
              <th className="hidden px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground xl:table-cell">
                IP
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Ver
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              : logs.length === 0
              ? <EmptyRow />
              : logs.map((log) => (
                  <LogRow key={log.id} log={log} onViewDetail={onViewDetail} />
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && total > 0 && (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Mostrando <span className="font-medium text-foreground">{desde}–{hasta}</span> de{' '}
            <span className="font-medium text-foreground">{total.toLocaleString('es-MX')}</span> registros
          </p>
          <div className="flex items-center gap-1">
            <PaginationButton
              onClick={() => onPageChange(1)}
              disabled={pagina === 1}
              aria-label="Primera página"
            >
              <ChevronsLeft className="h-4 w-4" />
            </PaginationButton>
            <PaginationButton
              onClick={() => onPageChange(pagina - 1)}
              disabled={pagina === 1}
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </PaginationButton>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {getPageNumbers(pagina, totalPaginas).map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-xs text-muted-foreground">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => onPageChange(p as number)}
                    className={`flex h-7 w-7 items-center justify-center rounded text-xs font-medium transition-colors ${
                      p === pagina
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}
            </div>

            <PaginationButton
              onClick={() => onPageChange(pagina + 1)}
              disabled={pagina === totalPaginas}
              aria-label="Página siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </PaginationButton>
            <PaginationButton
              onClick={() => onPageChange(totalPaginas)}
              disabled={pagina === totalPaginas}
              aria-label="Última página"
            >
              <ChevronsRight className="h-4 w-4" />
            </PaginationButton>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// LOG ROW
// ─────────────────────────────────────────

function LogRow({
  log,
  onViewDetail,
}: {
  log: LogAuditoria;
  onViewDetail: (log: LogAuditoria) => void;
}) {
  const accionCfg = ACCION_CONFIG[log.accion];
  const moduloCfg = MODULO_CONFIG[log.modulo];

  // Get icon component dynamically
  const AccionIcon = (LucideIcons as Record<string, React.ElementType>)[accionCfg.icon] as React.ElementType;
  const ModuloIcon = (LucideIcons as Record<string, React.ElementType>)[moduloCfg.icon] as React.ElementType;

  return (
    <TooltipProvider delayDuration={300}>
      <tr className="group transition-colors hover:bg-muted/30">
        {/* Fecha */}
        <td className="whitespace-nowrap px-4 py-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-default text-xs text-muted-foreground">
                {formatRelativeTime(log.creadoEn)}
              </span>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {formatFullDate(log.creadoEn)}
            </TooltipContent>
          </Tooltip>
        </td>

        {/* Acción */}
        <td className="px-4 py-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${accionCfg.className}`}
          >
            {AccionIcon && <AccionIcon className="h-3 w-3" />}
            {accionCfg.label}
          </span>
        </td>

        {/* Módulo */}
        <td className="px-4 py-3">
          <span
            className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium ${moduloCfg.className}`}
          >
            {ModuloIcon && <ModuloIcon className="h-3 w-3" />}
            {moduloCfg.label}
          </span>
        </td>

        {/* Descripción */}
        <td className="max-w-xs px-4 py-3">
          <p className="truncate text-sm text-foreground" title={log.descripcion}>
            {log.descripcion}
          </p>
          {log.entidadId && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              ID: {log.entidadId}
            </p>
          )}
        </td>

        {/* Usuario */}
        <td className="hidden px-4 py-3 lg:table-cell">
          {log.usuario ? (
            <div>
              <p className="text-sm font-medium text-foreground">
                {log.usuario.nombre} {log.usuario.apellidoPaterno}
              </p>
              <p className="text-xs text-muted-foreground">{log.usuario.correo}</p>
            </div>
          ) : log.usuarioId ? (
            <span className="font-mono text-xs text-muted-foreground">
              {log.usuarioId.slice(0, 8)}…
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/50">—</span>
          )}
        </td>

        {/* IP */}
        <td className="hidden px-4 py-3 xl:table-cell">
          {log.ip ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Monitor className="h-3 w-3" />
              {log.ip}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/50">—</span>
          )}
        </td>

        {/* Ver detalle */}
        <td className="px-4 py-3 text-right">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={() => onViewDetail(log)}
            aria-label="Ver detalle del log"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </td>
      </tr>
    </TooltipProvider>
  );
}

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

function EmptyRow() {
  return (
    <tr>
      <td colSpan={7} className="px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">No se encontraron registros</p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Intenta cambiar los filtros para ver más resultados
        </p>
      </td>
    </tr>
  );
}

function PaginationButton({
  children,
  onClick,
  disabled,
  'aria-label': ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  'aria-label': string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('...');
  pages.push(total);

  return pages;
}