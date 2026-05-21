"use client";

import Link from "next/link";
import { Building2, ArrowRight, Banknote, Clock } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ProgramaBadge, TipoPersonaBadge } from "./ProgramaBadge";
import type { Programa } from "@/lib/types/programa.types";

interface ProgramaCardProps {
    programa: Programa;
    onToggleActivo?: (id: string, activo: boolean) => void;
    isToggling?: boolean;
}

const fmt = (n: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);

export function ProgramaCard({ programa, onToggleActivo, isToggling }: ProgramaCardProps) {
    return (
        <Card className="group flex flex-col overflow-hidden transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="truncate font-semibold leading-tight text-foreground">
                            {programa.nombre}
                        </h3>
                    </div>
                    <ProgramaBadge activo={programa.activo} className="shrink-0" />
                </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-4 flex-1">
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {programa.descripcion}
                </p>

                <div className="grid grid-cols-2 gap-3">
                    {/* Monto */}
                    <div className="rounded-lg bg-muted/50 p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground font-medium">Monto</span>
                        </div>
                        <p className="text-xs font-semibold text-foreground">{fmt(programa.montoMinimo)}</p>
                        <p className="text-xs text-muted-foreground">hasta {fmt(programa.montoMaximo)}</p>
                    </div>

                    {/* Plazo */}
                    <div className="rounded-lg bg-muted/50 p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground font-medium">Plazo</span>
                        </div>
                        <p className="text-xs font-semibold text-foreground">{programa.plazoMinimoMeses} meses</p>
                        <p className="text-xs text-muted-foreground">hasta {programa.plazoMaximoMeses} meses</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                    <TipoPersonaBadge
                        permitePersonaFisica={programa.permitePersonaFisica}
                        permitePersonaMoral={programa.permitePersonaMoral}
                    />
                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {programa.tasaAnual}% T.A.
                    </span>
                    {programa.avalObligatorio && (
                        <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            Aval requerido
                        </span>
                    )}
                </div>
            </CardContent>

            <Separator />

            <CardFooter className="flex justify-between gap-2 pt-3 pb-3">
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground"
                    disabled={isToggling}
                    onClick={() => onToggleActivo?.(programa.id, programa.activo)}
                >
                    {programa.activo ? "Desactivar" : "Activar"}
                </Button>
                <div className="flex gap-1.5">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/admin/programas/${programa.id}/editar`}>
                            Editar
                        </Link>
                    </Button>
                    <Button size="sm" asChild>
                        <Link href={`/dashboard/admin/programas/${programa.id}`}>
                            Ver <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}