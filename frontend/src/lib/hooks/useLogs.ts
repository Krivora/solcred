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

// ─────────────────────────────────────────
// HOOK PRINCIPAL
// ─────────────────────────────────────────

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

  // Debounce para búsqueda libre
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch logs ────────────────────────────────────────────
  const fetchLogs = useCallback(
    async (page = 1, currentFilters = filters) => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          pagina: page,
          limite: DEFAULT_LIMITE,
          ...(currentFilters.accion      && { accion: currentFilters.accion }),
          ...(currentFilters.modulo      && { modulo: currentFilters.modulo }),
          ...(currentFilters.usuarioId   && { usuarioId: currentFilters.usuarioId }),
          ...(currentFilters.fechaInicio && { fechaInicio: new Date(currentFilters.fechaInicio).toISOString() }),
          ...(currentFilters.fechaFin    && { fechaFin: new Date(currentFilters.fechaFin + 'T23:59:59').toISOString() }),
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
    },
    [filters],
  );

  // ── Fetch resumen ─────────────────────────────────────────
  const fetchResumen = useCallback(async () => {
    setLoadingResumen(true);
    try {
      const data = await getResumenLogs();
      setResumen(data);
    } catch {
      // Silencioso — el resumen es secundario
    } finally {
      setLoadingResumen(false);
    }
  }, []);

  // ── Fetch log detalle ─────────────────────────────────────
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

  // ── Actualizar filtro con debounce para búsqueda ──────────
  const updateFilter = useCallback(
    <K extends keyof LogFilters>(key: K, value: LogFilters[K]) => {
      setFilters((prev) => {
        const next = { ...prev, [key]: value };

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

  // ── Reset filtros ─────────────────────────────────────────
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    fetchLogs(1, DEFAULT_FILTERS);
  }, [fetchLogs]);

  // ── Paginación ────────────────────────────────────────────
  const goToPage = useCallback(
    (page: number) => {
      fetchLogs(page);
    },
    [fetchLogs],
  );

  // ── Refrescar ─────────────────────────────────────────────
  const refresh = useCallback(() => {
    fetchLogs(paginacion.pagina);
    fetchResumen();
  }, [fetchLogs, fetchResumen, paginacion.pagina]);

  // ── Carga inicial ─────────────────────────────────────────
  useEffect(() => {
    fetchLogs(1);
    fetchResumen();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // Data
    logs,
    resumen,
    paginacion,
    filters,
    selectedLog,
    // Estados
    loading,
    loadingResumen,
    loadingDetail,
    error,
    // Acciones
    updateFilter,
    resetFilters,
    goToPage,
    refresh,
    fetchLogById,
    setSelectedLog,
  };
}