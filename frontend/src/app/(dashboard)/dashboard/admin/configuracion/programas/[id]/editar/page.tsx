"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ProgramaForm } from "@/components/admin/programas/ProgramaForm";
import { getPrograma } from "@/lib/api/admin/programas";
import type { Programa } from "@/lib/types/programa.types";
import { DocumentosPrograma } from "@/components/admin/programas/DocumentosPrograma";

export default function EditarProgramaPage() {
    const { id } = useParams<{ id: string }>();
    const [programa, setPrograma] = useState<Programa | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const cargarPrograma = useCallback(() => {
        return getPrograma(id)
            .then(setPrograma)
            .catch(() => setError("No se pudo cargar el programa."));
    }, [id]);

    useEffect(() => {
        cargarPrograma().finally(() => setLoading(false));
    }, [cargarPrograma]);
    return (    
        <div className="mx-auto max-w-8xl space-y-6">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" asChild>
                    <Link href={`/dashboard/admin/configuracion/programas/${id}`}>
                        <ChevronLeft className="h-4 w-4" />
                        Detalle del programa
                    </Link>
                </Button>
            </div>

            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Editar Programa</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Modifica la configuración del programa de financiamiento.
                </p>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-40 rounded-xl" />
                    ))}
                </div>
            ) : error ? (
                <p className="text-sm text-destructive">{error}</p>
            ) : programa ? (
                <>
                    <ProgramaForm programa={programa} />
                    <DocumentosPrograma
                        key={programa.id}                              // solo remonta si cambia el programa
                        programaId={programa.id}
                        documentos={programa.documentosRequeridos ?? []}
                        onCambio={() => {}}
                    />
                </>
            ) : null}
        </div>
    );
}