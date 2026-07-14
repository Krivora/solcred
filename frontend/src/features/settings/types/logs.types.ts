// ─────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────

export type AccionLog =
  | 'CREAR'
  | 'ACTUALIZAR'
  | 'ELIMINAR'
  | 'CONSULTAR'
  | 'LOGIN'
  | 'LOGOUT'
  | 'ERROR';

export type ModuloLog =
  | 'AUTH'
  | 'USUARIOS'
  | 'PROGRAMAS'
  | 'SOLICITUDES'
  | 'DOCUMENTOS';

// ─────────────────────────────────────────
// MODELS
// ─────────────────────────────────────────

export interface LogAuditoria {
  id: string;
  accion: AccionLog;
  modulo: ModuloLog;
  descripcion: string;
  entidadId?: string | null;
  usuarioId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown> | null;
  creadoEn: string; // ISO date string
  usuario?: {
    id: string;
    correo: string;
    nombre: string;
    apellidoPaterno: string;
    rol: string;
  } | null;
}

// ─────────────────────────────────────────
// API REQUESTS / RESPONSES
// ─────────────────────────────────────────

export interface LogsQueryParams {
  accion?: AccionLog;
  modulo?: ModuloLog;
  usuarioId?: string;
  fechaInicio?: string;
  fechaFin?: string;
  pagina?: number;
  limite?: number;
}

export interface LogsPaginados {
  logs: LogAuditoria[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

// Shapes que devuelve Prisma groupBy en el backend
export interface AccionCount {
  _count: { accion: number };
  accion: AccionLog;
}

export interface ModuloCount {
  _count: { modulo: number };
  modulo: ModuloLog;
}

// Alineado con la respuesta real del endpoint GET /api/logs/resumen
export interface ResumenLogs {
  totalAcciones: number;
  totalErrores: number;
  accionesPorDia: AccionCount[];     // agrupa por tipo de acción
  accionesPorModulo: ModuloCount[];  // agrupa por módulo
}

// ─────────────────────────────────────────
// HELPERS DE LECTURA
// ─────────────────────────────────────────

/** Extrae el conteo de una acción concreta del array groupBy */
export function getConteoAccion(
  accionesPorDia: AccionCount[],
  accion: AccionLog,
): number {
  return accionesPorDia.find((a) => a.accion === accion)?._count.accion ?? 0;
}

/** Extrae el conteo de un módulo concreto del array groupBy */
export function getConteoModulo(
  accionesPorModulo: ModuloCount[],
  modulo: ModuloLog,
): number {
  return accionesPorModulo.find((m) => m.modulo === modulo)?._count.modulo ?? 0;
}

// ─────────────────────────────────────────
// UI HELPERS
// ─────────────────────────────────────────

export interface LogFilters {
  accion: AccionLog | '';
  modulo: ModuloLog | '';
  usuarioId: string;
  fechaInicio: string;
  fechaFin: string;
  busqueda: string;
}

export const ACCIONES_LOG: AccionLog[] = [
  'CREAR',
  'ACTUALIZAR',
  'ELIMINAR',
  'CONSULTAR',
  'LOGIN',
  'LOGOUT',
  'ERROR',
];

export const MODULOS_LOG: ModuloLog[] = [
  'AUTH',
  'USUARIOS',
  'PROGRAMAS',
  'SOLICITUDES',
  'DOCUMENTOS',
];