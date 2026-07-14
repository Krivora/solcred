// src/shared/components/layout/sidebar/Sidebar.tsx
"use client";

import { cn } from "@/shared/lib/utils/cn";
import { useAuthStore } from "@/shared/lib/store/auth.store";
import { getNavForRole, settingsNavItem } from "@/shared/config/nav.config";
import { Separator } from "@/shared/components/ui/separator";
import { Rol } from "@/shared/lib/types/auth.types";
import { Sheet, SheetContent } from "@/shared/components/ui/sheet";
import { BrandMenu } from "./BrandMenu";
import { NavLink } from "./NavLink";
import { NavGroup } from "./NavGroup";
import { UserFooter } from "./UserFooter";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

function SidebarContent({
  collapsed,
  onToggle,
  isMobile = false,
}: {
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}) {
  const { usuario } = useAuthStore();
  const role = usuario?.rol as Rol | undefined;

  const navItems = role ? getNavForRole(role) : [];
  const showSettings = role && settingsNavItem.roles.includes(role);

  // En mobile el sidebar nunca está "colapsado" visualmente (siempre expandido dentro del sheet)
  const effectiveCollapsed = isMobile ? false : collapsed;

  return (
    <>
      <BrandMenu collapsed={effectiveCollapsed} onToggleSidebar={onToggle} />

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 flex flex-col">
        <div className="flex-1 space-y-0.5">
          {navItems.map((item) =>
            item.children && item.children.length > 0 ? (
              <NavGroup key={item.label} item={item} collapsed={effectiveCollapsed} />
            ) : (
              <NavLink key={item.href} item={item} collapsed={effectiveCollapsed} />
            )
          )}
        </div>

        {showSettings && (
          <div className="mt-auto pt-2">
            {!effectiveCollapsed && (
              <div className="mb-1 px-2">
                <Separator className="opacity-40" />
              </div>
            )}
            <NavLink item={settingsNavItem} collapsed={effectiveCollapsed} />
          </div>
        )}
      </nav>

      <div className="shrink-0 border-t border-sidebar-border px-2 py-2">
        <UserFooter collapsed={effectiveCollapsed} />
      </div>
    </>
  );
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileOpenChange }: SidebarProps) {
  return (
    <>
      {/* Desktop: sidebar fijo */}
      <aside
        className={cn(
          "relative hidden lg:flex h-screen flex-col bg-sidebar border-r border-sidebar-border",
          "transition-[width] duration-300 ease-in-out will-change-[width]",
          collapsed ? "w-15" : "w-58"
        )}
      >
        <SidebarContent collapsed={collapsed} onToggle={onToggle} />
      </aside>

      {/* Mobile / Tablet: drawer */}
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent
          side="left"
          className="w-72 p-0 flex flex-col bg-sidebar border-sidebar-border lg:hidden"
        >
          <SidebarContent
            collapsed={false}
            onToggle={() => onMobileOpenChange(false)}
            isMobile
          />
        </SheetContent>
      </Sheet>
    </>
  );
}