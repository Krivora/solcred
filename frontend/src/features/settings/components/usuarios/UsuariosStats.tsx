import { Users, ShieldCheck, BarChart2, UserX } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { Usuario } from "@/features/settings/types/usuario.types";
import { obtenerRolEfectivo } from "@/shared/types/auth.types";
interface UsuariosStatsProps {
  usuarios: Usuario[];
  isLoading: boolean;
}

export function UsuariosStats({ usuarios = [], isLoading }: UsuariosStatsProps) {

  const stats = {
    total: usuarios.length,
    activos: usuarios.filter((u) => u.activo).length,
    admins: usuarios.filter((u) => obtenerRolEfectivo(u) === "ADMIN").length, // ── FIX ──
    inactivos: usuarios.filter((u) => !u.activo).length,
  };

  const items = [
    { label: "Total Usuarios", value: stats.total, icon: Users, color: "text-ink-subtle" },
    { label: "Activos", value: stats.activos, icon: BarChart2, color: "text-ok-ink" },
    { label: "Administradores", value: stats.admins, icon: ShieldCheck, color: "text-brand-ink" },
    { label: "Inactivos", value: stats.inactivos, icon: UserX, color: "text-ink-subtle" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-4 flex items-center gap-3">
            <item.icon className={`size-4 shrink-0 ${item.color}`} />
            <div>
              {isLoading ? (
                <Skeleton className="h-6 w-10 mb-1" />
              ) : (
                <p className="text-title tabular-nums text-ink leading-none">
                  {item.value}
                </p>
              )}
              <p className="text-caption text-ink-muted mt-0.5">{item.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}