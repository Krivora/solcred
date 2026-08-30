"use client";
import Link from "next/link";
import {
    Building2,
    ArrowRight, MoreHorizontal,
    CheckCircle2, XCircle,

} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

import type { Programa } from "@/features/settings/types/programa.types";

interface ProgramaCardProps {
    programa: Programa;
    onToggleActivo?: (id: string, activo: boolean) => void;
    isToggling?: boolean;
}
/* ─── Status badge ─────────────────────────────────────────────────────── */
function StatusBadge({ activo }: { activo: boolean }) {
    return (
        <span className={[
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
            activo
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-muted text-muted-foreground",
        ].join(" ")}>
            {activo
                ? <CheckCircle2 className="h-3 w-3" />
                : <XCircle className="h-3 w-3" />}
            {activo ? "Activo" : "Inactivo"}
        </span>
    );
}

/* ─── Persona badges ───────────────────────────────────────────────────── */
function PersonaBadges({ pf, pm }: { pf: boolean; pm: boolean }) {
    return (
        <div className="flex gap-1.5 flex-wrap">
            {pf && (
                <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/8 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    PF
                </span>
            )}
            {pm && (
                <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/8 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    PM
                </span>
            )}
        </div>
    );
}
const fmt = (n: number) =>
    new Intl.NumberFormat("es-MX", {
        style: "currency", currency: "MXN", maximumFractionDigits: 0,
    }).format(n);

const fmtCompact = (n: number) => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
    return fmt(n);
};
export function ProgramaCard({ programa, onToggleActivo, isToggling }: ProgramaCardProps) {
    return (
        <div className="group flex flex-col rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md overflow-hidden">
            {/* Top accent strip */}
            <div className={["h-1 w-full transition-colors", programa.activo ? "bg-primary" : "bg-muted"].join(" ")} />

            <div className="flex flex-col gap-4 p-5 flex-1">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Building2 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-foreground leading-tight">
                                {programa.nombre}
                            </h3>
                            <PersonaBadges pf={programa.permitePersonaFisica} pm={programa.permitePersonaMoral} />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <StatusBadge activo={programa.activo} />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost" size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                    aria-label="Opciones del programa"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/admin/configuracion/programas/${programa.id}`}>Ver detalle</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/admin/configuracion/programas/${programa.id}/editar`}>Editar</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    disabled={isToggling}
                                    onClick={() => onToggleActivo?.(programa.id, programa.activo)}
                                    className={programa.activo ? "text-destructive focus:text-destructive" : ""}
                                    >
                                    {programa.activo ? "Desactivar" : "Activar"}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Descripción */}
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed flex-1">
                    {programa.descripcion}
                </p>

                {/* KPIs */}
                <div className="grid grid-cols-3 divide-x divide-border rounded-lg border border-border bg-muted/30 overflow-hidden">
                    <div className="flex flex-col items-center py-2.5 px-1 text-center">
                        <p className="text-[11px] font-medium text-muted-foreground mb-0.5">Monto</p>
                        <p className="text-xs font-bold text-foreground">{fmtCompact(programa.montoMinimo)}</p>
                        <p className="text-[10px] text-muted-foreground">– {fmtCompact(programa.montoMaximo)}</p>
                    </div>
                    <div className="flex flex-col items-center py-2.5 px-1 text-center">
                        <p className="text-[11px] font-medium text-muted-foreground mb-0.5">Plazo</p>
                        <p className="text-xs font-bold text-foreground">{programa.plazoMinimoMeses}</p>
                        <p className="text-[10px] text-muted-foreground">– {programa.plazoMaximoMeses} m</p>
                    </div>
                    <div className="flex flex-col items-center py-2.5 px-1 text-center">
                        <p className="text-[11px] font-medium text-muted-foreground mb-0.5">Tasa A.</p>
                        <p className="text-xs font-bold text-foreground">{programa.tasaAnual}%</p>
                        <p className="text-[10px] text-muted-foreground">anual</p>
                    </div>
                </div>

                {/* Tags */}
                {programa.aval && (
                    <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/8 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                            Aval requerido
                        </span>
                    </div>
                )}
            </div>

            <Separator />

            {/* Footer CTA */}
            <div className="flex items-center justify-between gap-2 px-5 py-3 bg-muted/20">
                <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground px-2" asChild>
                    <Link href={`/dashboard/admin/configuracion/programas/${programa.id}/editar`}>Editar</Link>
                </Button>
                <Button size="sm" className="h-7 text-xs gap-1" asChild>
                    <Link href={`/dashboard/admin/configuracion/programas/${programa.id}`}>
                        Ver <ArrowRight className="h-3 w-3" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}