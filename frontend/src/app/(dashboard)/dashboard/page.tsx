"use client";

// src/app/(dashboard)/dashboard/page.tsx
import { useAuthStore } from "@/shared/lib/store/auth.store";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Users,
  Building2,
  ActivitySquare,
} from "lucide-react";

const ROLE_WELCOME: Record<string, string> = {
  ADMIN: "Panel de Administración",
  ANALISTA: "Panel de Análisis",
  CLIENTE: "Mi Portal de Crédito",
};

interface StatCard {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  color: string;
}

const ADMIN_STATS: StatCard[] = [
  { label: "Total Solicitudes", value: "—", sub: "este mes", icon: FileText, color: "text-blue-500" },
  { label: "Pendientes", value: "—", sub: "por revisar", icon: Clock, color: "text-amber-500" },
  { label: "Aprobadas", value: "—", sub: "este mes", icon: CheckCircle2, color: "text-emerald-500" },
  { label: "Rechazadas", value: "—", sub: "este mes", icon: XCircle, color: "text-red-500" },
  { label: "Usuarios Activos", value: "—", sub: "registrados", icon: Users, color: "text-purple-500" },
  { label: "Programas", value: "—", sub: "activos", icon: Building2, color: "text-indigo-500" },
];

const ANALISTA_STATS: StatCard[] = [
  { label: "Mis Casos", value: "—", sub: "asignados", icon: FileText, color: "text-blue-500" },
  { label: "En Revisión", value: "—", sub: "en proceso", icon: ActivitySquare, color: "text-amber-500" },
  { label: "Completados", value: "—", sub: "este mes", icon: CheckCircle2, color: "text-emerald-500" },
  { label: "En Mesa", value: "—", sub: "por revisar", icon: Clock, color: "text-purple-500" },
];

const CLIENTE_STATS: StatCard[] = [
  { label: "Mis Solicitudes", value: "—", sub: "total", icon: FileText, color: "text-blue-500" },
  { label: "En Proceso", value: "—", sub: "activas", icon: TrendingUp, color: "text-amber-500" },
  { label: "Aprobadas", value: "—", sub: "historial", icon: CheckCircle2, color: "text-emerald-500" },
  { label: "Borradores", value: "—", sub: "por enviar", icon: Clock, color: "text-muted-foreground" },
];

const STATS_BY_ROLE: Record<string, StatCard[]> = {
  ADMIN: ADMIN_STATS,
  ANALISTA: ANALISTA_STATS,
  CLIENTE: CLIENTE_STATS,
};

export default function DashboardPage() {
  const { usuario } = useAuthStore();
  const stats = usuario ? (STATS_BY_ROLE[usuario.rol] ?? []) : [];
  const welcomeTitle = usuario ? ROLE_WELCOME[usuario.rol] : "Dashboard";

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          {welcomeTitle}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Bienvenido,{" "}
          <span className="font-medium text-foreground">
            {usuario?.nombre} {usuario?.apellidoPaterno}
          </span>
          . Aquí está el resumen de tu actividad.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {stat.label}
                </p>
                <div className="rounded-lg bg-muted p-1.5">
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Placeholder recent activity */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Actividad Reciente
        </h3>
        <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
          <ActivitySquare className="h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            No hay actividad reciente
          </p>
          <p className="text-xs text-muted-foreground/60">
            Los datos aparecerán aquí una vez que conectes con el backend
          </p>
        </div>
      </div>
    </div>
  );
}