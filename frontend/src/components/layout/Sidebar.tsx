"use client";

// src/components/layout/Sidebar.tsx
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { getNavForRole, NavItem } from "@/lib/config/nav.config";
import { useAuthStore } from "@/lib/store/auth.store";
import { ChevronRight, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

function NavItemComponent({
  item,
  collapsed,
  depth = 0,
}: {
  item: NavItem;
  collapsed: boolean;
  depth?: number;
}) {
  const pathname = usePathname();
  const hasChildren = item.children && item.children.length > 0;
  const isChildActive = item.children?.some(
    (child) => child.href && pathname.startsWith(child.href)
  );
  const [open, setOpen] = useState(!!isChildActive);
  const isActive = item.href ? pathname === item.href : false;
  const Icon = item.icon;

  const itemContent = (
    <>
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-all duration-200",
          isActive
            ? "text-sidebar-primary-foreground"
            : isChildActive
            ? "bg-sidebar-primary/10 text-sidebar-primary"
            : "text-sidebar-foreground/50 group-hover:bg-sidebar-accent group-hover:text-sidebar-accent-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      {!collapsed && (
        <span
          className={cn(
            "flex-1 w-0 truncate text-left text-sm leading-none transition-colors",
           isActive
            ? "font-medium text-sidebar-primary-foreground"
            : isChildActive
            ? "font-medium text-sidebar-primary"
            : "font-normal text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground"
          )}
        >
          {item.label}
        </span>
      )}
      {!collapsed && item.badge && (
        <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-[10px]">
          {item.badge}
        </Badge>
      )}
    </>
  );

  if (hasChildren) {
    const trigger = (
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "group flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 transition-all duration-150",
          "hover:bg-sidebar-accent",
          isChildActive && "bg-sidebar-accent/60",
          collapsed && "justify-center"
        )}
      >
        {itemContent}
        {!collapsed && (
          <ChevronRight
            className={cn(
              "ml-1 h-3.5 w-3.5 shrink-0 text-sidebar-foreground/30 transition-transform duration-200",
              open && "rotate-90"
            )}
          />
        )}
      </button>
    );

    return (
      <div>
        {collapsed ? (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>{trigger}</TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                {item.label}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          trigger
        )}

        {!collapsed && open && (
          <div className="ml-1 mt-0.5 space-y-0.5 border-l border-sidebar-border/50 pl-3">
            {item.children!.map((child) => (
              <NavItemComponent
                key={child.label}
                item={child}
                collapsed={false}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const link = (
    <Link
      href={item.href!}
      className={cn(
        "group flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-all duration-150",
        isActive
          ? "bg-sidebar-primary hover:bg-sidebar-primary/90"
          : "hover:bg-sidebar-accent",
        collapsed && "justify-center"
      )}
    >
      {itemContent}
    </Link>
  );

  return collapsed ? (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          {item.label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    link
  );
}

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

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { usuario, logout } = useAuthStore();
  const navItems = usuario ? getNavForRole(usuario.rol) : [];
  const roleConfig = usuario ? ROLE_CONFIG[usuario.rol] : null;

  const initials = usuario
    ? `${usuario.nombre[0]}${usuario.apellidoPaterno[0]}`.toUpperCase()
    : "?";

  const fullName = usuario
    ? `${usuario.nombre} ${usuario.apellidoPaterno}`
    : "";

  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col bg-sidebar border-r border-sidebar-border",
        "transition-[width] duration-300 ease-in-out will-change-[width]",
        collapsed ? "w-[60px]" : "w-[232px]"
      )}
    >
      {/* ── Brand ── */}
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-sidebar-border",
          collapsed ? "justify-center px-3" : "gap-2.5 px-4"
        )}
      >
        <div
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
            "bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold tracking-tight shadow-sm"
          )}
        >
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
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3">
        <div className="space-y-0.5">
          {navItems.map((item, i) => {
            const prevItem = navItems[i - 1];
            const showSeparator =
              i > 0 &&
              !collapsed &&
              prevItem &&
              prevItem.href !== undefined &&
              item.children;

            return (
              <div key={item.label}>
                {showSeparator && (
                  <div className="my-2 px-2">
                    <Separator className="opacity-40" />
                  </div>
                )}
                <NavItemComponent item={item} collapsed={collapsed} />
              </div>
            );
          })}
        </div>
      </nav>

      {/* ── Footer ── */}
      <div className="shrink-0 border-t border-sidebar-border px-2 py-2 space-y-1">
        {/* User pill */}
        {!collapsed && usuario && (
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2 mb-1">
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                "bg-sidebar-primary/10 text-sidebar-primary text-[11px] font-semibold"
              )}
            >
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