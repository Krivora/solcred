// src/shared/components/layout/sidebar/UserFooter.tsx
"use client";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { useAuthStore } from "@/shared/lib/store/auth.store";

export function UserFooter({ collapsed }: { collapsed: boolean }) {
    const { usuario } = useAuthStore();
    if (!usuario) return null;

    const initials = `${usuario.nombre[0]}${usuario.apellidoPaterno[0]}`.toUpperCase();
    const fullName = `${usuario.nombre} ${usuario.apellidoPaterno}`;
    const email = usuario.correo;
    if (collapsed) {
        return (
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
        );
    }

    return (
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sidebar-primary/10 text-sidebar-primary text-[11px] font-semibold">
                {initials}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-xs font-medium text-sidebar-foreground">
                    {fullName}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                    {email}
                </p>
            </div>
        </div>
    );
}