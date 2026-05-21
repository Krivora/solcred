"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

interface ProgramaBadgeProps {
    activo: boolean;
    className?: string;
}

export function ProgramaBadge({ activo, className }: ProgramaBadgeProps) {
    return (
        <Badge
            className={cn(
                "text-xs font-medium",
                activo
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800"
                    : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
                className
            )}
            variant="outline"
        >
            <span
                className={cn(
                    "mr-1.5 inline-block h-1.5 w-1.5 rounded-full",
                    activo ? "bg-emerald-500" : "bg-slate-400"
                )}
            />
            {activo ? "Activo" : "Inactivo"}
        </Badge>
    );
}

interface TipoPersonaBadgeProps {
    permitePersonaFisica: boolean;
    permitePersonaMoral: boolean;
}

export function TipoPersonaBadge({
    permitePersonaFisica,
    permitePersonaMoral,
}: TipoPersonaBadgeProps) {
    if (permitePersonaFisica && permitePersonaMoral) {
        return (
            <Badge variant="secondary" className="text-xs">
                Física y Moral
            </Badge>
        );
    }
    if (permitePersonaFisica) {
        return (
            <Badge variant="secondary" className="text-xs">
                Persona Física
            </Badge>
        );
    }
    return (
        <Badge variant="secondary" className="text-xs">
            Persona Moral
        </Badge>
    );
}