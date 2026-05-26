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
  // Relación opcional si el backend popula el usuario
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
  fechaInicio?: string; // ISO date
  fechaFin?: string;   // ISO date
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

export interface ResumenLogs {
  totalAcciones: number;
  porAccion: Record<AccionLog, number>;
  porModulo: Record<ModuloLog, number>;
  ultimasHoras: number; // periodo del resumen
  usuariosActivos: number;
  erroresRecientes: number;
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
  busqueda: string; // búsqueda libre en descripción
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