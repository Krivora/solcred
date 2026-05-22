// src/lib/config/nav.config.ts
import {
  LayoutDashboard,
  FileText,
  Clock,
  Briefcase,
  Users,
  Settings,
  FolderKanban,
  UserCheck,
  ClipboardList,
  Building2,
  FileBadge2,
  ShieldCheck,
  BookOpen,
  AlertCircle,
  MessageSquarePlus,
  TicketCheck,
  LifeBuoy,
  BadgeDollarSign,
  FilePlus2,
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
  // ── Inicio
  {
    label: "Inicio",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "ANALISTA", "CLIENTE"],
  },

  // ── Solicitudes (Cliente)
  {
    label: "Mis Solicitudes",
    href: "/dashboard/solicitudes",
    icon: FileText,
    roles: ["CLIENTE"],
  },
  {
    label: "Nueva Solicitud",
    href: "/dashboard/solicitudes/nueva",
    icon: FilePlus2,
    roles: ["CLIENTE"],
  },

  // ── Promoción (Admin / Analista)
  {
    label: "Promoción",
    icon: Briefcase,
    roles: ["ADMIN", "ANALISTA"],
    children: [
      {
        label: "Solicitudes",
        href: "/dashboard/promocion/solicitudes",
        icon: FileText,
        roles: ["ADMIN"],
      },
      {
        label: "Aprobación",
        href: "/dashboard/promocion/aprobacion",
        icon: Clock,
        roles: ["ADMIN"],
      },
      {
        label: "Mis Casos",
        href: "/dashboard/promocion/mis-casos",
        icon: FolderKanban,
        roles: ["ADMIN", "ANALISTA"],
      },
    ],
  },

  // ── Financiamiento (Admin / Analista)
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

  // ── Administración (Admin)
  {
    label: "Gestión del Sistema",
    icon: Settings,
    roles: ["ADMIN"],
    children: [
      {
        label: "Programas",
        href: "/dashboard/admin/programas",
        icon: Building2,
        roles: ["ADMIN"],
      },
      {
        label: "Documentos",
        href: "/dashboard/admin/documentos",
        icon: FileBadge2,
        roles: ["ADMIN"],
      },
      {
        label: "Usuarios",
        href: "/dashboard/admin/usuarios",
        icon: Users,
        roles: ["ADMIN"],
      },
      {
        label: "Auditoría",
        href: "/dashboard/admin/logs",
        icon: ClipboardList,
        roles: ["ADMIN"],
      },
    ],
  },

  // ── Soporte (Todos)
  {
    label: "Soporte",
    icon: LifeBuoy,
    roles: ["ADMIN", "ANALISTA", "CLIENTE"],
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

export function getNavForRole(role: Rol): NavItem[] {
  return navConfig
    .filter((item) => item.roles.includes(role))
    .map((item) => ({
      ...item,
      children: item.children?.filter((child) => child.roles.includes(role)),
    }));
}