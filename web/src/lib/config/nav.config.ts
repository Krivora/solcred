// src/lib/config/nav.config.ts
import {
  LayoutDashboard,
  FileText,
  Clock,
  Briefcase,
  Users,
  Settings,
  FolderCheck,
  UserCheck,
  ClipboardList,
  Building2,
  FileBadge,
  ShieldCheck,
} from "lucide-react";
import { Rol } from "@/lib/types/auth.types";

export interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: NavItem[];
  roles: Rol[];
  badge?: string;
}

export const navConfig: NavItem[] = [
  // ── Dashboard general
  {
    label: "Inicio",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "ANALISTA", "CLIENTE"],
  },

  // ── Departamento de Promoción
  {
    label: "Promoción",
    icon: Briefcase,
    roles: ["ADMIN", "ANALISTA"],
    children: [
      {
        label: "Todas las Solicitudes",
        href: "/dashboard/promocion/solicitudes",
        icon: FileText,
        roles: ["ADMIN"], // Jefe de Promoción = ADMIN por ahora
      },
      {
        label: "Pendientes de Aprobación",
        href: "/dashboard/promocion/pendientes",
        icon: Clock,
        roles: ["ADMIN"],
      },
      {
        label: "Mis Casos",
        href: "/dashboard/promocion/mis-casos",
        icon: FolderCheck,
        roles: ["ADMIN", "ANALISTA"],
      },
    ],
  },

  // ── Financiamiento
  {
    label: "Financiamiento",
    icon: ClipboardList,
    roles: ["ADMIN", "ANALISTA"],
    children: [
      {
        label: "Mesa de Control",
        href: "/dashboard/financiamiento/mesa-control",
        icon: ShieldCheck,
        roles: ["ADMIN", "ANALISTA"],
      },
      {
        label: "Asignación a Analistas",
        href: "/dashboard/financiamiento/asignacion",
        icon: UserCheck,
        roles: ["ADMIN"],
      },
      {
        label: "Mis Casos",
        href: "/dashboard/financiamiento/mis-casos",
        icon: FolderCheck,
        roles: ["ANALISTA"],
      },
      {
        label: "Comité de Crédito",
        href: "/dashboard/financiamiento/comite",
        icon: Users,
        roles: ["ADMIN"],
      },
    ],
  },

  // ── Portal del cliente
  {
    label: "Mis Solicitudes",
    href: "/dashboard/solicitudes",
    icon: FileText,
    roles: ["CLIENTE"],
  },
  {
    label: "Nueva Solicitud",
    href: "/dashboard/solicitudes/nueva",
    icon: FileBadge,
    roles: ["CLIENTE"],
  },

  // ── Gestión del Sistema (Admin)
  {
    label: "Gestión del Sistema",
    icon: Settings,
    roles: ["ADMIN"],
    children: [
      {
        label: "Programas de Crédito",
        href: "/dashboard/admin/programas",
        icon: Building2,
        roles: ["ADMIN"],
      },
      {
        label: "Documentos por Programa",
        href: "/dashboard/admin/documentos",
        icon: FileBadge,
        roles: ["ADMIN"],
      },
      {
        label: "Usuarios",
        href: "/dashboard/admin/usuarios",
        icon: Users,
        roles: ["ADMIN"],
      },
      {
        label: "Logs de Auditoría",
        href: "/dashboard/admin/logs",
        icon: ClipboardList,
        roles: ["ADMIN"],
      },
    ],
  },
];

export function getNavForRole(role: Rol): NavItem[] {
  return navConfig
    .filter((item) => item.roles.includes(role))
    .map((item) => ({
      ...item,
      children: item.children?.filter((child) => child.roles.includes(role)),
    }));
}