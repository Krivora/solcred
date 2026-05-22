"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgramaForm } from "@/components/programas/ProgramaForm";
import { getPrograma } from "@/lib/api/programas";
import type { Programa } from "@/lib/types/programa.types";
import { DocumentosPrograma } from "@/components/programas/DocumentosPrograma";

export default function EditarProgramaPage() {
    const { id } = useParams<{ id: string }>();
    const [programa, setPrograma] = useState<Programa | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getPrograma(id)
            .then(setPrograma)
            .catch(() => setError("No se pudo cargar el programa."))
            .finally(() => setLoading(false));
    }, [id]);

    return (
        <div className="mx-auto max-w-8xl space-y-6">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" asChild>
                    <Link href={`/dashboard/admin/programas/${id}`}>
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
                <ProgramaForm programa={programa} />
                
            ) : null}
            {programa && (
                <DocumentosPrograma
                    programaId={programa.id}
                    documentos={programa.documentos ?? []}
                    onCambio={() => getPrograma(id).then(setPrograma)}
                />
            )}
        </div>
    );
}