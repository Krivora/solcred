import type { AccionLog, ModuloLog } from '@/features/settings/types/logs.types';

// ─────────────────────────────────────────
// ACCIÓN — color, ícono, label
// ─────────────────────────────────────────

export type AccionConfig = {
  label: string;
  variant: 'default' | 'success' | 'warning' | 'destructive' | 'secondary' | 'info';
  className: string;
  icon: string; // nombre Lucide
};

/*
  Desde Fase 3 del rediseño, acción y módulo usan los tokens categóricos
  (`--cat-1..6`), no `--chart-*` (que eran el mismo tono y hacían los badges
  indistinguibles). Los 6 categóricos tienen L/C emparejados: se leen como
  familia y se distinguen al escanear.

  CREAR     → primary        (acción constructiva principal)
  ACTUALIZAR→ info           (cambio, informativo)
  ELIMINAR  → destructive
  CONSULTAR → muted          (acción neutra)
  LOGIN     → cat-4 (verde)  (acceso)
  LOGOUT    → cat-3 (cian)   (salida)
  ERROR     → destructive con mayor peso que ELIMINAR
*/

export const ACCION_CONFIG: Record<AccionLog, AccionConfig> = {
  CREAR: {
    label: 'Crear',
    variant: 'success',
    className: 'bg-brand-surface text-brand-ink border-brand/25',
    icon: 'Plus',
  },
  ACTUALIZAR: {
    label: 'Actualizar',
    variant: 'info',
    className: 'bg-info-surface text-info-ink border-info/25',
    icon: 'Pencil',
  },
  ELIMINAR: {
    label: 'Eliminar',
    variant: 'destructive',
    className: 'bg-destructive/10 text-destructive border-destructive/30',
    icon: 'Trash2',
  },
  CONSULTAR: {
    label: 'Consultar',
    variant: 'secondary',
    className: 'bg-surface-sunken text-ink-muted border-hairline',
    icon: 'Eye',
  },
  LOGIN: {
    label: 'Login',
    variant: 'default',
    className: 'bg-cat-4-surface text-cat-4 border-cat-4/25',
    icon: 'LogIn',
  },
  LOGOUT: {
    label: 'Logout',
    variant: 'warning',
    className: 'bg-cat-3-surface text-cat-3 border-cat-3/25',
    icon: 'LogOut',
  },
  ERROR: {
    label: 'Error',
    variant: 'destructive',
    className: 'bg-danger-surface text-danger-ink border-danger/40',
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

/*
  Cada módulo → un categórico distinto (`--cat-N-surface` de fondo, `--cat-N`
  de texto). L/C emparejados: se distinguen sin gritar. Mismo patrón en claro
  y oscuro porque los tokens ya se invierten en `.dark`.
*/

export const MODULO_CONFIG: Record<ModuloLog, ModuloConfig> = {
  AUTH: { label: 'Auth', className: 'bg-cat-2-surface text-cat-2 border-cat-2/25', icon: 'Shield' },
  USUARIOS: { label: 'Usuarios', className: 'bg-cat-1-surface text-cat-1 border-cat-1/25', icon: 'Users' },
  PROGRAMAS: { label: 'Programas', className: 'bg-cat-3-surface text-cat-3 border-cat-3/25', icon: 'BookOpen' },
  SOLICITUDES: { label: 'Solicitudes', className: 'bg-cat-5-surface text-cat-5 border-cat-5/25', icon: 'FileText' },
  DOCUMENTOS: { label: 'Documentos', className: 'bg-cat-4-surface text-cat-4 border-cat-4/25', icon: 'Paperclip' },
  SOPORTE: { label: 'Soporte', className: 'bg-cat-6-surface text-cat-6 border-cat-6/25', icon: 'LifeBuoy' },
  CRM: { label: 'CRM', className: 'bg-brand-surface text-brand-ink border-brand/25', icon: 'MessagesSquare' },
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