"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/cn";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import type { NavItem } from "@/shared/config/nav.config";

export function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
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