// src/shared/components/layout/sidebar/Sidebar.tsx
"use client";

import { cn } from "@/shared/lib/utils/cn";
import { useAuthStore } from "@/shared/lib/store/auth.store";
import { getNavForRole, settingsNavItem } from "@/shared/config/nav.config";
import { Separator } from "@/shared/components/ui/separator";
import { Rol } from "@/shared/lib/types/auth.types";
import { BrandMenu } from "./BrandMenu";
import { NavLink } from "./NavLink";
import { NavGroup } from "./NavGroup";
import { UserFooter } from "./UserFooter";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { usuario } = useAuthStore();
  const role = usuario?.rol as Rol | undefined;

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
      <BrandMenu collapsed={collapsed} onToggleSidebar={onToggle} />

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

      <div className="shrink-0 border-t border-sidebar-border px-2 py-2">
        <UserFooter collapsed={collapsed} />
      </div>
    </aside>
  );
}