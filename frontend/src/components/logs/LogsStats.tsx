'use client';

import {
  Activity,
  AlertTriangle,
  LogIn,
  Plus,
  Pencil,
  Trash2,
  Users,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ResumenLogs } from '@/lib/types/logs.types';

interface LogsStatsProps {
  resumen: ResumenLogs | null;
  loading: boolean;
}

interface StatCard {
  label: string;
  value: number | string;
  icon: React.ElementType;
  description: string;
  colorClass: string;
  bgClass: string;
}

export function LogsStats({ resumen, loading }: LogsStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-4">
              <Skeleton className="mb-3 h-8 w-8 rounded-lg" />
              <Skeleton className="mb-1 h-7 w-16" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!resumen) return null;

  const cards: StatCard[] = [
    {
      label: 'Total acciones',
      value: resumen.totalAcciones.toLocaleString('es-MX'),
      icon: Activity,
      description: `Últimas ${resumen.ultimasHoras}h`,
      colorClass: 'text-primary',
      bgClass: 'bg-primary/10',
    },
    {
      label: 'Usuarios activos',
      value: resumen.usuariosActivos,
      icon: Users,
      description: 'En el período',
      colorClass: 'text-sky-600 dark:text-sky-400',
      bgClass: 'bg-sky-100 dark:bg-sky-950',
    },
    {
      label: 'Registros creados',
      value: resumen.porAccion?.CREAR ?? 0,
      icon: Plus,
      description: 'Nuevos recursos',
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      bgClass: 'bg-emerald-100 dark:bg-emerald-950',
    },
    {
      label: 'Modificaciones',
      value: (resumen.porAccion?.ACTUALIZAR ?? 0) + (resumen.porAccion?.ELIMINAR ?? 0),
      icon: Pencil,
      description: 'Ediciones + eliminaciones',
      colorClass: 'text-amber-600 dark:text-amber-400',
      bgClass: 'bg-amber-100 dark:bg-amber-950',
    },
    {
      label: 'Errores',
      value: resumen.erroresRecientes,
      icon: AlertTriangle,
      description: 'Requieren atención',
      colorClass: 'text-rose-600 dark:text-rose-400',
      bgClass: 'bg-rose-100 dark:bg-rose-950',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, description, colorClass, bgClass }: StatCard) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className={`mb-3 inline-flex rounded-lg p-2 ${bgClass}`}>
          <Icon className={`h-4 w-4 ${colorClass}`} />
        </div>
        <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}