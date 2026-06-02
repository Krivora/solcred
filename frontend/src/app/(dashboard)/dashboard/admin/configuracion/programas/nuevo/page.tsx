"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ProgramaForm } from "@/features/programas/components/ProgramaForm";

export default function NuevoProgramaPage() {
    return (
        // h-full para ocupar todo el main sin restricción de ancho
        <div className="mx-auto max-w-8xl space-y-6">
            {/* ── Encabezado de página ─────────────────────── */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <Link
                        href="/dashboard/admin/configuracion/programas"
                        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-card text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-foreground">
                            Nuevo Programa
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Configura los parámetros del nuevo programa de financiamiento.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Form ocupa todo el ancho restante ───────── */}
            <ProgramaForm />
        </div>
    );
}