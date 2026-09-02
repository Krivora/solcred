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
  Paleta disponible (globals.css):
  primary / primary-foreground
  secondary / secondary-foreground
  muted / muted-foreground
  accent / accent-foreground
  destructive / destructive-foreground
  border · foreground
  chart-1 (azul principal) · chart-2 (azul claro) · chart-3 (azul medio)
  chart-4 (azul grisáceo) · chart-5 (azul muy claro)

  Estrategia de diferenciación semántica:
  CREAR     → primary   (acción constructiva principal)
  ACTUALIZAR→ chart-2   (variante informativa de la paleta)
  ELIMINAR  → destructive
  CONSULTAR → muted     (acción neutra, sin énfasis)
  LOGIN     → chart-3   (acceso — positivo pero distinto a crear)
  LOGOUT    → chart-4   (salida — neutro-oscuro)
  ERROR     → destructive con mayor peso visual que ELIMINAR
*/

export const ACCION_CONFIG: Record<AccionLog, AccionConfig> = {
  CREAR: {
    label: 'Crear',
    variant: 'success',
    className: 'bg-primary/10 text-primary border-primary/30',
    icon: 'Plus',
  },
  ACTUALIZAR: {
    label: 'Actualizar',
    variant: 'info',
    className: 'bg-[color:var(--chart-2)]/10 text-[color:var(--chart-2)] border-[color:var(--chart-2)]/30',
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
    className: 'bg-muted text-muted-foreground border-border',
    icon: 'Eye',
  },
  LOGIN: {
    label: 'Login',
    variant: 'default',
    className: 'bg-[color:var(--chart-3)]/10 text-[color:var(--chart-3)] border-[color:var(--chart-3)]/30',
    icon: 'LogIn',
  },
  LOGOUT: {
    label: 'Logout',
    variant: 'warning',
    className: 'bg-[color:var(--chart-4)]/15 text-foreground border-[color:var(--chart-4)]/30',
    icon: 'LogOut',
  },
  ERROR: {
    label: 'Error',
    variant: 'destructive',
    className: 'bg-destructive/20 text-destructive border-destructive/50',
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
  Los 5 módulos se diferencian usando los 5 chart tokens de la paleta.
  chart-1 (azul principal) · chart-2 · chart-3 · chart-4 · chart-5
  Todos usan el mismo patrón: fondo /10, texto directo, borde /30.
  Funciona en light y dark sin variantes adicionales porque los tokens
  ya cambian con el tema en globals.css.
*/

export const MODULO_CONFIG: Record<ModuloLog, ModuloConfig> = {
  AUTH: {
    label: 'Auth',
    className: 'bg-[color:var(--chart-1)]/10 text-[color:var(--chart-1)] border-[color:var(--chart-1)]/30',
    icon: 'Shield',
  },
  USUARIOS: {
    label: 'Usuarios',
    className: 'bg-[color:var(--chart-2)]/10 text-[color:var(--chart-2)] border-[color:var(--chart-2)]/30',
    icon: 'Users',
  },
  PROGRAMAS: {
    label: 'Programas',
    className: 'bg-[color:var(--chart-3)]/10 text-[color:var(--chart-3)] border-[color:var(--chart-3)]/30',
    icon: 'BookOpen',
  },
  SOLICITUDES: {
    label: 'Solicitudes',
    className: 'bg-[color:var(--chart-4)]/10 text-[color:var(--chart-4)] border-[color:var(--chart-4)]/30',
    icon: 'FileText',
  },
  DOCUMENTOS: {
    label: 'Documentos',
    className: 'bg-[color:var(--chart-5)]/10 text-[color:var(--chart-5)] border-[color:var(--chart-5)]/30',
    icon: 'Paperclip',
  },
  SOPORTE: {
    label: 'Soporte',
    className: 'bg-[color:var(--chart-1)]/10 text-[color:var(--chart-1)] border-[color:var(--chart-1)]/30',
    icon: 'LifeBuoy',
  },
  CRM: {
    label: 'CRM',
    className: 'bg-[color:var(--chart-2)]/10 text-[color:var(--chart-2)] border-[color:var(--chart-2)]/30',
    icon: 'MessagesSquare',
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