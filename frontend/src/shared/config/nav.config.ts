// src/lib/config/nav.config.ts
import {
  LayoutDashboard,
  FileText,
  Clock,
  Briefcase,
  Users,
  FileCheck,
  FolderKanban,
  ClipboardClock,
  UserCheck,
  ShieldCheck,
  BookOpen,
  AlertCircle,
  FolderInput,
  MessageSquarePlus,
  TicketCheck,
  LifeBuoy,
  BadgeDollarSign,
  Settings2,
} from "lucide-react";
import { Rol } from "@/shared/lib/types/auth.types";

export interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: NavItem[];
  roles: Rol[];
  badge?: string;
  exact?: boolean;
}

export const navConfig: NavItem[] = [
  {
    label: "Inicio",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN"],
    exact: true,
  },
  {
    label: "Mis Solicitudes",
    href: "/dashboard/usuarios/solicitudes",
    icon: FileText,
    roles: ["CLIENTE"],
    exact: true,
  },
  {
    label: "Promoción",
    icon: Briefcase,
    roles: ["ADMIN", "GESTOR"],
    children: [
      {
        label: "Solicitudes",
        href: "/dashboard/admin/promocion/solicitudes",
        icon: FileText,
        roles: ["ADMIN"],
      },
      {
        label: "Asignacion",
        href: "/dashboard/admin/promocion/asignacion",
        icon: FolderInput,
        roles: ["ADMIN"],
      },
      {
        label: "Aprobación",
        href: "/dashboard/admin/promocion/aprobacion",
        icon: FileCheck,
        roles: ["ADMIN"],
      },
      {
        label: "Mis Casos",
        href: "/dashboard/admin/promocion/mis-casos",
        icon: FolderKanban,
        roles: ["ADMIN", "GESTOR"],
      },
      {
        label: "Historico",
        href: "/dashboard/admin/promocion/historico",
        icon: ClipboardClock,
        roles: ["ADMIN", "GESTOR"],
      },
    ],
  },
  {
    label: "Financiamiento",
    icon: BadgeDollarSign,
    roles: ["ADMIN", "ANALISTA"],
    children: [
      {
        label: "Mesa de Control",
        href: "/dashboard/financiamiento/mesa-control",
        icon: ShieldCheck,
        roles: ["ADMIN", "ANALISTA"],
      },
      {
        label: "Asignación",
        href: "/dashboard/financiamiento/asignacion",
        icon: UserCheck,
        roles: ["ADMIN"],
      },
      {
        label: "Mis Casos",
        href: "/dashboard/financiamiento/mis-casos",
        icon: FolderKanban,
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
  {
    label: "Soporte",
    icon: LifeBuoy,
    roles: ["ADMIN", "ANALISTA"],
    children: [
      {
        label: "Mis Tickets",
        href: "/dashboard/soporte/tickets",
        icon: TicketCheck,
        roles: ["ADMIN", "ANALISTA", "CLIENTE"],
      },
      {
        label: "Nuevo Ticket",
        href: "/dashboard/soporte/nuevo",
        icon: MessageSquarePlus,
        roles: ["ADMIN", "ANALISTA", "CLIENTE"],
      },
      {
        label: "Reportar Problema",
        href: "/dashboard/soporte/reporte",
        icon: AlertCircle,
        roles: ["ADMIN", "ANALISTA", "CLIENTE"],
      },
      {
        label: "Base de Conocimiento",
        href: "/dashboard/soporte/conocimiento",
        icon: BookOpen,
        roles: ["ADMIN", "ANALISTA", "CLIENTE"],
      },
    ],
  },
];

// Ítem separado para el fondo del sidebar (solo ADMIN)
export const settingsNavItem: NavItem = {
  label: "Gestión del Sistema",
  href: "/dashboard/admin/configuracion",
  icon: Settings2,
  roles: ["ADMIN"],
};

export function getNavForRole(role: Rol): NavItem[] {
  return navConfig
    .filter((item) => item.roles.includes(role))
    .map((item) => ({
      ...item,
      children: item.children?.filter((child) => child.roles.includes(role)),
    }));
}