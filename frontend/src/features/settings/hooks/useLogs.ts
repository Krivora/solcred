'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { getLogs, getResumenLogs, getLogById } from '@/features/settings/api/logs.api';
import { logKeys } from '@/features/settings/lib/settings.keys';
import type {
  LogAuditoria,
  LogFilters,
  LogsQueryParams,
} from '@/features/settings/types/logs.types';

const DEFAULT_FILTERS: LogFilters = {
  accion: '',
  modulo: '',
  usuarioId: '',
  fechaInicio: '',
  fechaFin: '',
  busqueda: '',
};

const DEFAULT_PAGE_SIZE = 20;

// `busqueda` es solo un chip de UI: el backend no lo recibe, así que no entra
// en la query key (cambiarlo no dispara refetch).
function toQueryParams(filters: LogFilters, page: number): LogsQueryParams {
  return {
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    ...(filters.accion && { accion: filters.accion }),
    ...(filters.modulo && { modulo: filters.modulo }),
    ...(filters.usuarioId && { usuarioId: filters.usuarioId }),
    ...(filters.fechaInicio && {
      fechaInicio: new Date(filters.fechaInicio).toISOString(),
    }),
    ...(filters.fechaFin && {
      fechaFin: new Date(filters.fechaFin + 'T23:59:59').toISOString(),
    }),
  };
}

export function useLogs() {
  const qc = useQueryClient();

  const [pagina, setPagina] = useState(1);
  const [filters, setFilters] = useState<LogFilters>(DEFAULT_FILTERS);
  const [selectedLog, setSelectedLog] = useState<LogAuditoria | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const queryParams = useMemo(() => toQueryParams(filters, pagina), [filters, pagina]);

  const {
    data,
    isFetching,
    isError,
    error: queryError,
  } = useQuery({
    queryKey: logKeys.list(queryParams),
    queryFn: () => getLogs(queryParams),
    placeholderData: keepPreviousData,
  });

  const { data: resumen = null, isLoading: loadingResumen } = useQuery({
    queryKey: logKeys.resumen(),
    queryFn: getResumenLogs,
  });

  const paginacion = {
    page: data?.pagination.page ?? pagina,
    pageSize: data?.pagination.pageSize ?? DEFAULT_PAGE_SIZE,
    total: data?.pagination.total ?? 0,
    totalPages: data?.pagination.totalPages ?? 0,
  };

  const updateFilter = useCallback(
    <K extends keyof LogFilters>(key: K, value: LogFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setPagina(1);
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPagina(1);
  }, []);

  const goToPage = useCallback((page: number) => setPagina(page), []);

  const refresh = useCallback(() => {
    qc.invalidateQueries({ queryKey: logKeys.all });
  }, [qc]);

  const fetchLogById = useCallback(
    async (id: string) => {
      setLoadingDetail(true);
      try {
        const log = await qc.fetchQuery({
          queryKey: logKeys.detail(id),
          queryFn: () => getLogById(id),
        });
        setSelectedLog(log);
      } finally {
        setLoadingDetail(false);
      }
    },
    [qc],
  );

  return {
    logs: data?.data ?? [],
    resumen,
    paginacion,
    filters,
    selectedLog,
    loading: isFetching,
    loadingResumen,
    loadingDetail,
    error: isError ? ((queryError as Error)?.message ?? 'Error al cargar logs') : null,
    updateFilter,
    resetFilters,
    goToPage,
    refresh,
    fetchLogById,
    setSelectedLog,
  };
}
