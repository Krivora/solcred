import type { AccionLog, ModuloLog } from '@/lib/types/logs.types';

// ─────────────────────────────────────────
// ACCIÓN — color, ícono, label
// ─────────────────────────────────────────

export type AccionConfig = {
  label: string;
  variant: 'default' | 'success' | 'warning' | 'destructive' | 'secondary' | 'info';
  className: string;
  icon: string; // nombre Lucide
};

export const ACCION_CONFIG: Record<AccionLog, AccionConfig> = {
  CREAR: {
    label: 'Crear',
    variant: 'success',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    icon: 'Plus',
  },
  ACTUALIZAR: {
    label: 'Actualizar',
    variant: 'info',
    className: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    icon: 'Pencil',
  },
  ELIMINAR: {
    label: 'Eliminar',
    variant: 'destructive',
    className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
    icon: 'Trash2',
  },
  CONSULTAR: {
    label: 'Consultar',
    variant: 'secondary',
    className: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    icon: 'Eye',
  },
  LOGIN: {
    label: 'Login',
    variant: 'default',
    className: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800',
    icon: 'LogIn',
  },
  LOGOUT: {
    label: 'Logout',
    variant: 'warning',
    className: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
    icon: 'LogOut',
  },
  ERROR: {
    label: 'Error',
    variant: 'destructive',
    className: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
    icon: 'AlertTriangle',
  },
};

// ─────────────────────────────────────────
// MÓDULO — color, ícono, label
// ─────────────────────────────────────────

export type ModuloConfig = {
  label: string;
  className: string;
  icon: string;
};

export const MODULO_CONFIG: Record<ModuloLog, ModuloConfig> = {
  AUTH: {
    label: 'Auth',
    className: 'bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-950/50 dark:text-violet-400',
    icon: 'Shield',
  },
  USUARIOS: {
    label: 'Usuarios',
    className: 'bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-950/50 dark:text-sky-400',
    icon: 'Users',
  },
  PROGRAMAS: {
    label: 'Programas',
    className: 'bg-teal-50 text-teal-600 border-teal-200 dark:bg-teal-950/50 dark:text-teal-400',
    icon: 'BookOpen',
  },
  SOLICITUDES: {
    label: 'Solicitudes',
    className: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/50 dark:text-orange-400',
    icon: 'FileText',
  },
  DOCUMENTOS: {
    label: 'Documentos',
    className: 'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-400',
    icon: 'Paperclip',
  },
};

// ─────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────

export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'hace un momento';
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffHour < 24) return `hace ${diffHour}h`;
  if (diffDay < 7) return `hace ${diffDay}d`;

  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatFullDate(isoDate: string): string {
  return new Date(isoDate).toLocaleString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}