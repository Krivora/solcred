// src/lib/config/nav.config.ts
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Users,
  FileCheck,
  FolderKanban,
  ClipboardClock,
  UserCheck,
  ShieldCheck,
  FolderInput,
  Inbox,
  TicketCheck,
  LifeBuoy,
  BadgeDollarSign,
  FileSpreadsheet,
  Settings2,
} from "lucide-react";
import { RolAplicacion } from "@/shared/types/auth.types";

export interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: NavItem[];
  roles: RolAplicacion[];
  badge?: string;
  exact?: boolean;
}

const NAV_BASE: NavItem[] = [
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
    roles: ["ADMIN", "GESTOR", "ENCARGADO_PROMOCION"],
    children: [
      {
        label: "Solicitudes",
        href: "/dashboard/admin/promocion/solicitudes",
        icon: FileText,
        roles: ["ADMIN", "ENCARGADO_PROMOCION"],
      },
      {
        label: "Asignacion",
        href: "/dashboard/admin/promocion/asignacion",
        icon: FolderInput,
        roles: ["ADMIN", "ENCARGADO_PROMOCION"],
      },
      {
        label: "Aprobación",
        href: "/dashboard/admin/promocion/aprobacion",
        icon: FileCheck,
        roles: ["ADMIN", "ENCARGADO_PROMOCION"],
      },
      {
        label: "Mis Casos",
        href: "/dashboard/admin/promocion/mis-casos",
        icon: FolderKanban,
        roles: ["GESTOR"],
      },
      {
        label: "Historico",
        href: "/dashboard/admin/promocion/historico",
        icon: ClipboardClock,
        roles: ["ADMIN", "GESTOR", "ENCARGADO_PROMOCION"],
      },
    ],
  },
  {
    label: "Financiamiento",
    icon: BadgeDollarSign,
    roles: ["ADMIN", "ANALISTA", "SUPERVISOR", "ENCARGADO_FINANCIAMIENTO", "MESA_CONTROL"],
    children: [
      {
        label: "Mesa de Control",
        href: "/dashboard/financiamiento/mesa-control",
        icon: ShieldCheck,
        roles: ["ADMIN", "SUPERVISOR", "MESA_CONTROL"],
      },
      {
        label: "Asignación",
        href: "/dashboard/financiamiento/asignacion",
        icon: UserCheck,
        roles: ["ADMIN", "ENCARGADO_FINANCIAMIENTO"],
      },
      {
        label: "Mis Casos",
        href: "/dashboard/financiamiento/mis-casos",
        icon: FolderKanban,
        roles: ["ANALISTA"],
      },
      {
        label: "Validación",
        href: "/dashboard/financiamiento/validacion",
        icon: ClipboardClock,
        roles: ["ADMIN", "SUPERVISOR", "ENCARGADO_FINANCIAMIENTO"],
      },
      {
        label: "Comité de Crédito",
        href: "/dashboard/financiamiento/comite",
        icon: Users,
        roles: ["ADMIN", "SUPERVISOR", "ENCARGADO_FINANCIAMIENTO"],
      },
    ],
  },
  {
    label: "Reportes",
    href: "/dashboard/admin/reportes",
    icon: FileSpreadsheet,
    roles: ["ADMIN"],
    exact: true,
  },
  {
    label: "Soporte",
    icon: LifeBuoy,
    roles: [
      "ADMIN", "GESTOR", "ANALISTA", "SUPERVISOR",
      "ENCARGADO_PROMOCION", "ENCARGADO_FINANCIAMIENTO", "MESA_CONTROL",
      "SOPORTE", "CLIENTE",
    ],
    children: [
      {
        // Cola completa de tickets — staff.
        label: "Tickets",
        href: "/dashboard/soporte/tickets",
        icon: Inbox,
        roles: ["ADMIN"], // + SUPERVISOR por la derivación conSupervisor
      },
      {
        // Los propios de cada usuario + creación de nuevos. Todos.
        label: "Mis Tickets",
        href: "/dashboard/soporte/mis-tickets",
        icon: TicketCheck,
        roles: [
          "ADMIN", "GESTOR", "ANALISTA", "SUPERVISOR",
          "ENCARGADO_PROMOCION", "ENCARGADO_FINANCIAMIENTO", "MESA_CONTROL",
          "SOPORTE", "CLIENTE",
        ],
      },
    ],
  },
];

// El rol SUPERVISOR es "ADMIN de solo lectura": ve exactamente lo mismo que un
// administrador. En vez de repetir "SUPERVISOR" en cada item, se deriva: donde
// pueda entrar ADMIN, también entra SUPERVISOR (el backend le bloquea las
// acciones de escritura).
function conSupervisor(items: NavItem[]): NavItem[] {
  return items.map((item) => ({
    ...item,
    roles:
      item.roles.includes("ADMIN") && !item.roles.includes("SUPERVISOR")
        ? [...item.roles, "SUPERVISOR"]
        : item.roles,
    children: item.children ? conSupervisor(item.children) : undefined,
  }));
}

export const navConfig: NavItem[] = conSupervisor(NAV_BASE);

// Ítem separado para el fondo del sidebar (ADMIN + SUPERVISOR en solo lectura)
export const settingsNavItem: NavItem = {
  label: "Gestión del Sistema",
  href: "/dashboard/admin/configuracion",
  icon: Settings2,
  roles: ["ADMIN", "SUPERVISOR"],
};

export function getNavForRole(role: RolAplicacion): NavItem[] {
  return navConfig
    .filter((item) => item.roles.includes(role))
    .map((item) => ({
      ...item,
      children: item.children?.filter((child) => child.roles.includes(role)),
    }));
}