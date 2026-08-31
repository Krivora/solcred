import { apiAuth } from '@/shared/api/client';
import type {
  LogAuditoria,
  LogsPaginados,
  LogsQueryParams,
  ResumenLogs,
} from '@/features/settings/types/logs.types';

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

function buildQueryString(params: LogsQueryParams): string {
  const query = new URLSearchParams();

  if (params.accion)      query.set('accion', params.accion);
  if (params.modulo)      query.set('modulo', params.modulo);
  if (params.usuarioId)   query.set('usuarioId', params.usuarioId);
  if (params.fechaInicio) query.set('fechaInicio', params.fechaInicio);
  if (params.fechaFin)    query.set('fechaFin', params.fechaFin);
  if (params.page)        query.set('page', String(params.page));
  if (params.pageSize)    query.set('pageSize', String(params.pageSize));

  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

// ─────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────

/**
 * Lista logs con filtros y paginación.
 * Solo accesible para ADMIN.
 */
export async function getLogs(params: LogsQueryParams = {}): Promise<LogsPaginados> {
  const qs = buildQueryString(params);
  return apiAuth<LogsPaginados>(`/admin/logs${qs}`);
}

/**
 * Resumen estadístico de actividad.
 * Solo accesible para ADMIN.
 */
export async function getResumenLogs(): Promise<ResumenLogs> {
  return apiAuth<ResumenLogs>('/admin/logs/resumen');
}

/**
 * Ver un log específico por ID.
 * Solo accesible para ADMIN.
 */
export async function getLogById(id: string): Promise<LogAuditoria> {
  return apiAuth<LogAuditoria>(`/admin/logs/${id}`);
}