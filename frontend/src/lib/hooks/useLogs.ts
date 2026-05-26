'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { getLogs, getResumenLogs, getLogById } from '@/lib/api/logs';
import type {
  LogAuditoria,
  LogFilters,
  LogsPaginados,
  ResumenLogs,
} from '@/lib/types/logs.types';

const DEFAULT_FILTERS: LogFilters = {
  accion: '',
  modulo: '',
  usuarioId: '',
  fechaInicio: '',
  fechaFin: '',
  busqueda: '',
};

const DEFAULT_LIMITE = 20;

export function useLogs() {
  const [logs, setLogs] = useState<LogAuditoria[]>([]);
  const [resumen, setResumen] = useState<ResumenLogs | null>(null);
  const [paginacion, setPaginacion] = useState({
    pagina: 1,
    limite: DEFAULT_LIMITE,
    total: 0,
    totalPaginas: 0,
  });
  const [filters, setFilters] = useState<LogFilters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(false);
  const [loadingResumen, setLoadingResumen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<LogAuditoria | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Guardar filters en ref para evitar closures stale ──
  const filtersRef = useRef<LogFilters>(DEFAULT_FILTERS);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // ── Fetch logs ─────────────────────────────────────────
  const fetchLogs = useCallback(async (page = 1, overrideFilters?: LogFilters) => {
    setLoading(true);
    setError(null);

    const currentFilters = overrideFilters ?? filtersRef.current;

    try {
      const params = {
        pagina: page,
        limite: DEFAULT_LIMITE,
        ...(currentFilters.accion      && { accion: currentFilters.accion }),
        ...(currentFilters.modulo      && { modulo: currentFilters.modulo }),
        ...(currentFilters.usuarioId   && { usuarioId: currentFilters.usuarioId }),
        ...(currentFilters.fechaInicio && {
          fechaInicio: new Date(currentFilters.fechaInicio).toISOString(),
        }),
        ...(currentFilters.fechaFin && {
          fechaFin: new Date(currentFilters.fechaFin + 'T23:59:59').toISOString(),
        }),
      };

      const data: LogsPaginados = await getLogs(params);

      setLogs(data.logs);
      setPaginacion({
        pagina: data.pagina,
        limite: data.limite,
        total: data.total,
        totalPaginas: data.totalPaginas,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar logs';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []); // sin dependencias — lee filters desde ref

  // ── Fetch resumen ──────────────────────────────────────
  const fetchResumen = useCallback(async () => {
    setLoadingResumen(true);
    try {
      const data = await getResumenLogs();
      setResumen(data);
    } catch {
      // Silencioso
    } finally {
      setLoadingResumen(false);
    }
  }, []);

  // ── Fetch log detalle ──────────────────────────────────
  const fetchLogById = useCallback(async (id: string) => {
    setLoadingDetail(true);
    try {
      const data = await getLogById(id);
      setSelectedLog(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar detalle';
      setError(msg);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  // ── Actualizar filtro ──────────────────────────────────
  const updateFilter = useCallback(
    <K extends keyof LogFilters>(key: K, value: LogFilters[K]) => {
      setFilters((prev) => {
        const next = { ...prev, [key]: value };
        filtersRef.current = next;

        if (key === 'busqueda') {
          if (debounceTimer.current) clearTimeout(debounceTimer.current);
          debounceTimer.current = setTimeout(() => {
            fetchLogs(1, next);
          }, 400);
        } else {
          fetchLogs(1, next);
        }

        return next;
      });
    },
    [fetchLogs],
  );

  // ── Reset filtros ──────────────────────────────────────
  const resetFilters = useCallback(() => {
    filtersRef.current = DEFAULT_FILTERS;
    setFilters(DEFAULT_FILTERS);
    fetchLogs(1, DEFAULT_FILTERS);
  }, [fetchLogs]);

  // ── Paginación — ahora lee filters desde ref ───────────
  const goToPage = useCallback(
    (page: number) => {
      fetchLogs(page);
    },
    [fetchLogs],
  );

  // ── Refrescar ──────────────────────────────────────────
  const refresh = useCallback(() => {
    fetchLogs(paginacion.pagina);
    fetchResumen();
  }, [fetchLogs, fetchResumen, paginacion.pagina]);

  // ── Carga inicial ──────────────────────────────────────
  useEffect(() => {
    fetchLogs(1);
    fetchResumen();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    logs,
    resumen,
    paginacion,
    filters,
    selectedLog,
    loading,
    loadingResumen,
    loadingDetail,
    error,
    updateFilter,
    resetFilters,
    goToPage,
    refresh,
    fetchLogById,
    setSelectedLog,
  };
}