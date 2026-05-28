"use client";

// src/components/layout/Sidebar.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/lib/store/auth.store";
import { getNavForRole, settingsNavItem, type NavItem } from "@/lib/config/nav.config";
import {
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Rol } from "@/lib/types/auth.types";
import { useState } from "react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const ROLE_CONFIG: Record<string, { label: string; className: string }> = {
  ADMIN: {
    label: "Admin",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  },
  ANALISTA: {
    label: "Analista",
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  },
  CLIENTE: {
    label: "Cliente",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
};

// ─── NavLink (leaf, sin hijos) ────────────────────────────────────────────────
function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const isActive = item.exact
    ? pathname === item.href
    : pathname === item.href || (item.href !== undefined && pathname.startsWith(item.href + "/"));
  const Icon = item.icon;

  const inner = (
    <Link
      href={item.href!}
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
        <span className="truncate text-sm leading-normal">{item.label}</span>
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

// ─── NavGroup (ítem con hijos) ────────────────────────────────────────────────
function NavGroup({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const isAnyChildActive = item.children?.some(
    (c) => c.href && (pathname === c.href || pathname.startsWith(c.href + "/"))
  );
  const [open, setOpen] = useState(!!isAnyChildActive);
  const Icon = item.icon;

  // Colapsado: mostrar hijos como tooltips individuales
  if (collapsed) {
    return (
      <div className="space-y-0.5">
        {item.children?.map((child) => (
          <NavLink key={child.href} item={child} collapsed={collapsed} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "group flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 transition-all duration-150",
          isAnyChildActive
            ? "text-sidebar-foreground"
            : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4 shrink-0",
            isAnyChildActive
              ? "text-sidebar-foreground"
              : "text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground"
          )}
        />
        <span className="flex-1 truncate text-sm leading-normal text-left">
          {item.label}
        </span>
        <ChevronDown
          className={cn(
            "h-3 w-3 shrink-0 transition-transform duration-200 text-sidebar-foreground/30",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="ml-6 mt-0.5 space-y-0.5 border-l border-sidebar-border/50 pl-2">
          {item.children?.map((child) => (
            <NavLink key={child.href} item={child} collapsed={false} />
          ))}
        </div>
      )}
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
  const fullName = usuario
    ? `${usuario.nombre} ${usuario.apellidoPaterno}`
    : "";

  const navItems = role ? getNavForRole(role) : [];
  const showSettings = role && settingsNavItem.roles.includes(role);

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
        <div className="flex-1 space-y-0.5">
          {navItems.map((item) =>
            item.children && item.children.length > 0 ? (
              <NavGroup key={item.label} item={item} collapsed={collapsed} />
            ) : (
              <NavLink key={item.href} item={item} collapsed={collapsed} />
            )
          )}
        </div>

        {/* ── Gestión del Sistema — fijo al fondo del nav ── */}
        {showSettings && (
          <div className="mt-auto pt-2">
            {!collapsed && (
              <div className="mb-1 px-2">
                <Separator className="opacity-40" />
              </div>
            )}
            <NavLink item={settingsNavItem} collapsed={collapsed} />
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