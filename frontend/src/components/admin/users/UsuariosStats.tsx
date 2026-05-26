import { Users, ShieldCheck, BarChart2, UserX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Usuario } from "@/lib/types/usuario.types";

interface UsuariosStatsProps {
  usuarios: Usuario[];
  isLoading: boolean;
}

export function UsuariosStats({ usuarios = [], isLoading }: UsuariosStatsProps) {
  const stats = {
    total: usuarios.length,
    activos: usuarios.filter((u) => u.activo).length,
    admins: usuarios.filter((u) => u.rol === "ADMIN").length,
    inactivos: usuarios.filter((u) => !u.activo).length,
  };

  const items = [
    {
      label: "Total Usuarios",
      value: stats.total,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Activos",
      value: stats.activos,
      icon: BarChart2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Administradores",
      value: stats.admins,
      icon: ShieldCheck,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Inactivos",
      value: stats.inactivos,
      icon: UserX,
      color: "text-gray-500",
      bg: "bg-gray-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`rounded-lg p-2 ${item.bg}`}>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
            <div>
              {isLoading ? (
                <Skeleton className="h-6 w-10 mb-1" />
              ) : (
                <p className="text-xl font-bold text-foreground leading-none">
                  {item.value}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">{item.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}