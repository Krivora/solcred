"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    ChevronLeft,
    Pencil,
    Banknote,
    Clock,
    Percent,
    FileText,
    CheckCircle2,
    XCircle,
    ShieldCheck,
    UserCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { getPrograma, activarPrograma, desactivarPrograma } from "@/lib/api/programas";
import { ProgramaBadge, TipoPersonaBadge } from "@/components/programas/ProgramaBadge";
import { DocumentosPrograma } from "@/components/programas/DocumentosPrograma";
import type { Programa } from "@/lib/types/programa.types";

const fmt = (n: number) =>
    new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 0,
    }).format(n);

function BoolRow({ label, value }: { label: string; value: boolean }) {
    return (
        <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-muted-foreground">{label}</span>
            {value ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
                <XCircle className="h-4 w-4 text-muted-foreground/40" />
            )}
        </div>
    );
}

export default function DetalleProgramaPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [programa, setPrograma] = useState<Programa | null>(null);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(false);

    const cargar = async () => {
        try {
            const data = await getPrograma(id);
            setPrograma(data);
        } catch {
            router.push("/dashboard/admin/programas");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargar();
    }, [id]);

    const handleToggle = async () => {
        if (!programa) return;
        setToggling(true);
        try {
            if (programa.activo) {
                await desactivarPrograma(programa.id);
            } else {
                await activarPrograma(programa.id);
            }
            await cargar();
        } finally {
            setToggling(false);
        }
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-8xl space-y-6">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-6 w-64" />
                <div className="grid gap-4 md:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-40 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (!programa) return null;

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            {/* ── Breadcrumb ───────────────────────────────────── */}
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" asChild>
                <Link href="/dashboard/admin/programas">
                    <ChevronLeft className="h-4 w-4" />
                    Programas
                </Link>
            </Button>

            {/* ── Header ───────────────────────────────────────── */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-2xl font-semibold tracking-tight">{programa.nombre}</h1>
                        <ProgramaBadge activo={programa.activo} />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        <TipoPersonaBadge
                            permitePersonaFisica={programa.permitePersonaFisica}
                            permitePersonaMoral={programa.permitePersonaMoral}
                        />
                    </div>
                </div>
                <div className="flex shrink-0 gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={toggling}
                        onClick={handleToggle}
                    >
                        {programa.activo ? "Desactivar" : "Activar"}
                    </Button>
                    <Button size="sm" asChild>
                        <Link href={`/dashboard/admin/programas/${programa.id}/editar`}>
                            <Pencil className="mr-2 h-3.5 w-3.5" />
                            Editar
                        </Link>
                    </Button>
                </div>
            </div>

            {/* ── Descripción ──────────────────────────────────── */}
            <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                <p className="text-sm">{programa.descripcion}</p>
                {programa.objetivo && (
                    <>
                        <Separator />
                        <p className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">Objetivo: </span>
                            {programa.objetivo}
                        </p>
                    </>
                )}
            </div>

            {/* ── Métricas ─────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                    { icon: Banknote, label: "Monto mín.", value: fmt(programa.montoMinimo) },
                    { icon: Banknote, label: "Monto máx.", value: fmt(programa.montoMaximo) },
                    { icon: Clock, label: "Plazo mín.", value: `${programa.plazoMinimoMeses} meses` },
                    { icon: Clock, label: "Plazo máx.", value: `${programa.plazoMaximoMeses} meses` },
                ].map((m) => (
                    <div key={m.label} className="rounded-lg border bg-card p-3">
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <m.icon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{m.label}</span>
                        </div>
                        <p className="text-sm font-semibold">{m.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* ── Tasas ─────────────────────────────────── */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Percent className="h-4 w-4 text-primary" />
                            Tasas de Interés
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y">
                        {[
                            { label: "Tasa ordinaria", value: `${programa.tasaOrdinaria}%` },
                            { label: "Tasa moratoria", value: `${programa.tasaMoratoria}%` },
                            { label: "Tasa anual", value: `${programa.tasaAnual}%` },
                        ].map((t) => (
                            <div key={t.label} className="flex justify-between py-2.5 text-sm">
                                <span className="text-muted-foreground">{t.label}</span>
                                <span className="font-medium">{t.value}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* ── Garantías y Aval ──────────────────────── */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            Garantías y Aval
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y">
                        <BoolRow label="Aval obligatorio" value={programa.avalObligatorio} />
                        <BoolRow label="Aval opcional" value={programa.avalOpcional} />
                        <BoolRow label="Garantía obligatoria" value={programa.garantiaObligatoria} />
                        <BoolRow label="Garantía opcional" value={programa.garantiaOpcional} />
                    </CardContent>
                </Card>

                {/* ── Información Requerida ─────────────────── */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-primary" />
                            Información Requerida
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y">
                        <BoolRow label="Requiere CURP" value={programa.requiereCurp} />
                        <BoolRow label="Requiere RFC" value={programa.requiereRfc} />
                        <BoolRow
                            label="Datos financieros completos"
                            value={programa.datosFinancierosCompletos}
                        />
                    </CardContent>
                </Card>

                {/* ── Documentos requeridos ─────────────────── */}
                <div className="md:col-span-2">
                    <DocumentosPrograma
                        programaId={programa.id}
                        documentos={programa.documentos ?? []}
                        onCambio={cargar}
                    />
                </div>
            </div>
        </div>
    );
}