"use client";

// src/components/layout/Sidebar.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/lib/store/auth.store";
import {
  LayoutDashboard,
  FileText,
  FilePlus2,
  Clock,
  FolderKanban,
  ShieldCheck,
  UserCheck,
  Users,
  Settings2,
  TicketCheck,
  MessageSquarePlus,
  AlertCircle,
  BookOpen,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Rol } from "@/lib/types/auth.types";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: Rol[];
}

interface NavSection {
  title?: string; // undefined = sin label (sección principal)
  items: NavItem[];
  roles: Rol[];
}

// ─── Configuración de secciones planas ───────────────────────────────────────
const navSections: NavSection[] = [
  // Sin título — acceso general
  {
    items: [
      { label: "Inicio", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "ANALISTA", "CLIENTE"] },
    ],
    roles: ["ADMIN", "ANALISTA", "CLIENTE"],
  },

  // Cliente — Solicitudes
  {
    title: "Solicitudes",
    items: [
      { label: "Mis Solicitudes", href: "/dashboard/solicitudes", icon: FileText, roles: ["CLIENTE"] },
      { label: "Nueva Solicitud", href: "/dashboard/solicitudes/nueva", icon: FilePlus2, roles: ["CLIENTE"] },
    ],
    roles: ["CLIENTE"],
  },

  // Admin / Analista — Promoción
  {
    title: "Promoción",
    items: [
      { label: "Solicitudes", href: "/dashboard/promocion/solicitudes", icon: FileText, roles: ["ADMIN"] },
      { label: "Aprobación", href: "/dashboard/promocion/aprobacion", icon: Clock, roles: ["ADMIN"] },
      { label: "Mis Casos", href: "/dashboard/promocion/mis-casos", icon: FolderKanban, roles: ["ADMIN", "ANALISTA"] },
    ],
    roles: ["ADMIN", "ANALISTA"],
  },

  // Admin / Analista — Financiamiento
  {
    title: "Financiamiento",
    items: [
      { label: "Mesa de Control", href: "/dashboard/financiamiento/mesa-control", icon: ShieldCheck, roles: ["ADMIN", "ANALISTA"] },
      { label: "Asignación", href: "/dashboard/financiamiento/asignacion", icon: UserCheck, roles: ["ADMIN"] },
      { label: "Mis Casos", href: "/dashboard/financiamiento/mis-casos", icon: FolderKanban, roles: ["ANALISTA"] },
      { label: "Comité de Crédito", href: "/dashboard/financiamiento/comite", icon: Users, roles: ["ADMIN"] },
    ],
    roles: ["ADMIN", "ANALISTA"],
  },

  // Todos — Soporte
  {
    title: "Soporte",
    items: [
      { label: "Mis Tickets", href: "/dashboard/soporte/tickets", icon: TicketCheck, roles: ["ADMIN", "ANALISTA", "CLIENTE"] },
      { label: "Nuevo Ticket", href: "/dashboard/soporte/nuevo", icon: MessageSquarePlus, roles: ["ADMIN", "ANALISTA", "CLIENTE"] },
      { label: "Reportar Problema", href: "/dashboard/soporte/reporte", icon: AlertCircle, roles: ["ADMIN", "ANALISTA", "CLIENTE"] },
      { label: "Base de Conocimiento", href: "/dashboard/soporte/conocimiento", icon: BookOpen, roles: ["ADMIN", "ANALISTA", "CLIENTE"] },
    ],
    roles: ["ADMIN", "ANALISTA", "CLIENTE"],
  },
];

// Ítem fijo de Gestión del Sistema (solo ADMIN)
const settingsItem: NavItem = {
  label: "Gestión del Sistema",
  href: "/dashboard/admin/configuracion",
  icon: Settings2,
  roles: ["ADMIN"],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const ROLE_CONFIG: Record<string, { label: string; className: string }> = {
  ADMIN: {
    label: "Admin",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  },
  ANALISTA: {
    label: "Analista",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  },
  CLIENTE: {
    label: "Cliente",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
};

// ─── NavLink ─────────────────────────────────────────────────────────────────
function NavLink({
  item,
  collapsed,
}: {
  item: NavItem;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;

  const inner = (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-all duration-150",
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        collapsed && "justify-center"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          isActive
            ? "text-sidebar-primary-foreground"
            : "text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground"
        )}
      />
      {!collapsed && (
        <span className="truncate text-sm leading-none">{item.label}</span>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{inner}</TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            {item.label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return inner;
}

// ─── SectionLabel ─────────────────────────────────────────────────────────────
function SectionLabel({ title, collapsed }: { title: string; collapsed: boolean }) {
  if (collapsed) {
    return (
      <div className="my-1.5 flex justify-center">
        <div className="h-px w-5 bg-sidebar-border/60" />
      </div>
    );
  }

  return (
    <div className="mb-1 mt-3 px-2">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30 select-none">
        {title}
      </span>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { usuario, clearAuth: logout } = useAuthStore();
  const role = usuario?.rol as Rol | undefined;

  const roleConfig = role ? ROLE_CONFIG[role] : null;
  const initials = usuario
    ? `${usuario.nombre[0]}${usuario.apellidoPaterno[0]}`.toUpperCase()
    : "?";
  const fullName = usuario ? `${usuario.nombre} ${usuario.apellidoPaterno}` : "";

  // Filtra secciones y sus ítems según el rol
  const visibleSections = navSections
    .filter((s) => role && s.roles.includes(role))
    .map((s) => ({
      ...s,
      items: s.items.filter((i) => role && i.roles.includes(role)),
    }))
    .filter((s) => s.items.length > 0);

  const showSettings = role && settingsItem.roles.includes(role);

  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col bg-sidebar border-r border-sidebar-border",
        "transition-[width] duration-300 ease-in-out will-change-[width]",
        collapsed ? "w-15" : "w-58"
      )}
    >
      {/* ── Brand ── */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-sidebar-border",
          collapsed ? "justify-center px-3" : "gap-2.5 px-4"
        )}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold tracking-tight shadow-sm">
          SC
        </div>
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-sidebar-foreground tracking-tight">
              SolCred
            </p>
            <p className="truncate text-[10px] text-sidebar-foreground/50">
              Gestión de crédito
            </p>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 flex flex-col">
        {/* Secciones principales */}
        <div className="flex-1 space-y-0.5">
          {visibleSections.map((section, idx) => (
            <div key={idx}>
              {section.title && (
                <SectionLabel title={section.title} collapsed={collapsed} />
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink key={item.href} item={item} collapsed={collapsed} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Gestión del Sistema — fijo al fondo del nav ── */}
        {showSettings && (
          <div className="mt-auto pt-2">
            {!collapsed && (
              <div className="mb-1 px-2">
                <Separator className="opacity-40" />
              </div>
            )}
            <NavLink item={settingsItem} collapsed={collapsed} />
          </div>
        )}
      </nav>

      {/* ── Footer ── */}
      <div className="shrink-0 border-t border-sidebar-border px-2 py-2 space-y-1">
        {/* User pill */}
        {!collapsed && usuario && (
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2 mb-1">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sidebar-primary/10 text-sidebar-primary text-[11px] font-semibold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-sidebar-foreground leading-tight">
                {fullName}
              </p>
              {roleConfig && (
                <span
                  className={cn(
                    "mt-0.5 inline-block rounded-sm px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
                    roleConfig.className
                  )}
                >
                  {roleConfig.label}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Collapsed avatar */}
        {collapsed && usuario && (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-center py-1">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sidebar-primary/10 text-sidebar-primary text-[11px] font-semibold">
                    {initials}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                {fullName}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Toggle collapse */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn(
            "w-full h-8 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent",
            collapsed ? "justify-center px-0" : "justify-start gap-2.5 px-2"
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4 shrink-0" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4 shrink-0" />
              <span className="text-xs text-left">Colapsar panel</span>
            </>
          )}
        </Button>

        {/* Logout */}
        {collapsed ? (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="w-full h-8 justify-center px-0 text-sidebar-foreground/50 hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                Cerrar sesión
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full h-8 justify-start gap-2.5 px-2 text-sidebar-foreground/50 hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="text-xs text-left">Cerrar sesión</span>
          </Button>
        )}
      </div>
    </aside>
  );
}