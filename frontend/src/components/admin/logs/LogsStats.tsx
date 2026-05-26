'use client';

import { Activity, AlertTriangle, Plus, Pencil, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { ResumenLogs } from '@/lib/types/logs.types';
import { getConteoAccion } from '@/lib/types/logs.types';

interface LogsStatsProps {
  resumen: ResumenLogs | null;
  loading: boolean;
}

interface StatCard {
  label: string;
  value: number | string;
  icon: React.ElementType;
  description: string;
  tokenClass: string;
  isAlert?: boolean;
}

export function LogsStats({ resumen, loading }: LogsStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!resumen) return null;

  const creados    = getConteoAccion(resumen.accionesPorDia, 'CREAR');
  const editados   = getConteoAccion(resumen.accionesPorDia, 'ACTUALIZAR');
  const eliminados = getConteoAccion(resumen.accionesPorDia, 'ELIMINAR');

  const cards: StatCard[] = [
    {
      label: 'Total acciones',
      value: resumen.totalAcciones.toLocaleString('es-MX'),
      icon: Activity,
      description: 'En el período',
      tokenClass: 'primary',
    },
    {
      label: 'Módulos activos',
      value: resumen.accionesPorModulo.length,
      icon: Users,
      description: `${resumen.accionesPorModulo.map((m) => m.modulo).join(', ')}`,
      tokenClass: 'chart-2',
    },
    {
      label: 'Creados',
      value: creados,
      icon: Plus,
      description: 'Nuevos recursos',
      tokenClass: 'chart-3',
    },
    {
      label: 'Modificaciones',
      value: editados + eliminados,
      icon: Pencil,
      description: `${editados} edits · ${eliminados} eliminaciones`,
      tokenClass: 'chart-1',
    },
    {
      label: 'Errores',
      value: resumen.totalErrores,
      icon: AlertTriangle,
      description: 'Requieren atención',
      tokenClass: 'destructive',
      isAlert: resumen.totalErrores > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────

function StatCard({ label, value, icon: Icon, description, tokenClass, isAlert }: StatCard) {
  const cssVar = `var(--${tokenClass})`;

  return (
    <div
      className={`
        group relative overflow-hidden rounded-xl border bg-card px-4 py-3
        transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md
        ${isAlert ? 'border-destructive/40' : 'border-border'}
      `}
    >
      {/* Accent bar top */}
      <div
        className="absolute inset-x-0 top-0 h-0.5 opacity-60"
        style={{ background: cssVar }}
      />

      {/* Icon + value row */}
      <div className="flex items-start justify-between gap-2">
        <div
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
          style={{ background: `color-mix(in oklch, ${cssVar} 12%, transparent)` }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: cssVar }} />
        </div>

        <p
          className="text-2xl font-bold tabular-nums tracking-tight"
          style={{ color: cssVar }}
        >
          {value}
        </p>
      </div>

      {/* Labels */}
      <div className="mt-2">
        <p className="text-xs font-semibold leading-tight text-foreground">{label}</p>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground" title={description}>
          {description}
        </p>
      </div>

      {/* Alert pulse dot — solo cuando hay errores */}
      {isAlert && (
        <span className="absolute right-3 top-3 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border bg-card px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="mt-0.5 h-7 w-7 rounded-lg" />
        <Skeleton className="h-7 w-12" />
      </div>
      <div className="mt-2 space-y-1.5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}