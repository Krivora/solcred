// src/shared/components/layout/sidebar/NavGroup.tsx
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/utils/cn";
import { NavLink } from "./NavLink";
import type { NavItem } from "@/shared/config/nav.config";

export function NavGroup({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
    const pathname = usePathname();
    const isAnyChildActive = item.children?.some(
        (c) => c.href && (pathname === c.href || pathname.startsWith(c.href + "/"))
    );
    const [open, setOpen] = useState(!!isAnyChildActive);
    const Icon = item.icon;

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