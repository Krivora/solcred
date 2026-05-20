"use client";

// src/components/layout/Sidebar.tsx
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { getNavForRole, NavItem } from "@/lib/config/nav.config";
import { useAuthStore } from "@/lib/store/auth.store";
import { ChevronRight, LogOut, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  // Auto-expand if current path matches a child
  const isChildActive = item.children?.some(
    (child) => child.href && pathname.startsWith(child.href)
  );
  const [open, setOpen] = useState(!!isChildActive);

  const isActive = item.href ? pathname === item.href : false;
  const Icon = item.icon;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
            "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isChildActive &&
              "bg-sidebar-accent/50 text-sidebar-accent-foreground",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? item.label : undefined}
        >
          <Icon
            className={cn(
              "shrink-0 transition-colors",
              collapsed ? "h-5 w-5" : "h-4 w-4",
              isChildActive && "text-primary"
            )}
          />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
                  open && "rotate-90"
                )}
              />
            </>
          )}
        </button>

        {/* Children */}
        {!collapsed && open && (
          <div className="ml-3 mt-0.5 border-l border-sidebar-border/50 pl-3 space-y-0.5">
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

  return (
    <Link
      href={item.href!}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive &&
          "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
        collapsed && "justify-center px-2"
      )}
      title={collapsed ? item.label : undefined}
    >
      <Icon
        className={cn(
          "shrink-0 transition-colors",
          collapsed ? "h-5 w-5" : "h-4 w-4",
          isActive && "text-primary"
        )}
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && isActive && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
      )}
    </Link>
  );
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  ADMIN: { label: "Administrador", color: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  ANALISTA: { label: "Analista", color: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  CLIENTE: { label: "Cliente", color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
};

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { usuario, logout } = useAuthStore();
  const navItems = usuario ? getNavForRole(usuario.rol) : [];
  const roleInfo = usuario ? ROLE_LABELS[usuario.rol] : null;
  const initials = usuario
    ? `${usuario.nombre[0]}${usuario.apellidoPaterno[0]}`.toUpperCase()
    : "?";

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out",
        collapsed ? "w-[60px]" : "w-[240px]"
      )}
    >
      {/* Logo / Brand */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-sidebar-border px-4",
          collapsed ? "justify-center" : "gap-3"
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
          SC
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">
              SolCred
            </p>
            <p className="text-[10px] text-sidebar-foreground/50 truncate">
              Gestión de Crédito
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-0.5">
        {navItems.map((item) => (
          <NavItemComponent key={item.label} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border p-2 space-y-1">
        {/* User info */}
        {!collapsed && usuario && (
          <div className="flex items-center gap-3 rounded-lg px-3 py-2 mb-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-sidebar-foreground truncate">
                {usuario.nombre} {usuario.apellidoPaterno}
              </p>
              {roleInfo && (
                <span
                  className={cn(
                    "inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                    roleInfo.color
                  )}
                >
                  {roleInfo.label}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn(
            "w-full text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent",
            collapsed ? "justify-center px-0" : "justify-start gap-3 px-3"
          )}
        >
          <ChevronRight
            className={cn(
              "h-4 w-4 shrink-0 transition-transform duration-300",
              !collapsed && "rotate-180"
            )}
          />
          {!collapsed && <span className="text-xs">Colapsar</span>}
        </Button>

        {/* Logout */}
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className={cn(
            "w-full text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10",
            collapsed ? "justify-center px-0" : "justify-start gap-3 px-3"
          )}
          title={collapsed ? "Cerrar sesión" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="text-xs">Cerrar sesión</span>}
        </Button>
      </div>
    </aside>
  );
}