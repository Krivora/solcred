"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    ChevronLeft,
    Pencil,
    Banknote,
    Clock,
    Percent,
    ClipboardList,
    User,
    BadgeCheck,
    DollarSign,
    ShieldCheck,
    Building2,
    LineChart,
    Landmark,
} from "lucide-react";
import type { ElementType } from "react";

import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Separator } from "@/shared/components/ui/separator";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/shared/components/ui/card";

import { usePrograma } from "@/features/settings/hooks/useProgramas";
import { useEsSoloLectura } from "@/shared/lib/permisos";
import { ProgramaBadge, TipoPersonaBadge } from "@/features/settings/components/programas/ProgramaBadge";
import { DocumentosPrograma } from "@/features/settings/components/programas/DocumentosPrograma";
import { ORDEN_SECCIONES } from "@/features/settings/components/programas/form/SeccionesSelector";
import {
    SECCION_LABELS,
    REQUERIMIENTO_LABELS,
    type Requerimiento,
    type SeccionSolicitud,
} from "@/features/settings/types/programa.types";
import { cn } from "@/shared/lib/cn";

const fmt = (n: number) =>
    new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 0,
    }).format(n);

const SECCION_ICONS: Record<SeccionSolicitud, ElementType> = {
    SOLICITANTE: User,
    AVAL: BadgeCheck,
    CREDITO: DollarSign,
    GARANTIA: ShieldCheck,
    NEGOCIO: Building2,
    MERCADO: LineChart,
    BANCARIOS: Landmark,
};

const REQUERIMIENTO_COLOR: Record<Requerimiento, string> = {
    OBLIGATORIO: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    OPCIONAL: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    NO_REQUIERE: "bg-muted text-muted-foreground",
};

export default function DetalleProgramaPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const soloLectura = useEsSoloLectura();
    const { programa, loading, isError, toggling, toggle, recargar } = usePrograma(id);

    useEffect(() => {
        if (isError) router.push("/dashboard/admin/configuracion/programas");
    }, [isError, router]);

    const handleToggle = () => toggle();

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

    const getRequerimiento = (seccion: SeccionSolicitud): Requerimiento =>
        programa.secciones?.find((s) => s.seccion === seccion)?.requerimiento ??
        "NO_REQUIERE";

    return (
        <div className="mx-auto max-w-8xl space-y-6">
            {/* ── Breadcrumb ───────────────────────────────────── */}
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" asChild>
                <Link href="/dashboard/admin/configuracion/programas">
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
                {!soloLectura && (
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
                            <Link href={`/dashboard/admin/configuracion/programas/${programa.id}/editar`}>
                                <Pencil className="mr-2 h-3.5 w-3.5" />
                                Editar
                            </Link>
                        </Button>
                    </div>
                )}
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

                {/* ── Secciones de la solicitud ─────────────── */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <ClipboardList className="h-4 w-4 text-primary" />
                            Secciones de la Solicitud
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y">
                        {ORDEN_SECCIONES.map((seccion) => {
                            const Icon = SECCION_ICONS[seccion];
                            const requerimiento = getRequerimiento(seccion);
                            const activa = requerimiento !== "NO_REQUIERE";

                            return (
                                <div
                                    key={seccion}
                                    className="flex items-center justify-between py-2.5"
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className={cn(
                                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
                                            activa ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                                        )}>
                                            <Icon className="h-3.5 w-3.5" />
                                        </div>
                                        <span className={cn(
                                            "text-sm truncate",
                                            activa ? "text-foreground" : "text-muted-foreground"
                                        )}>
                                            {SECCION_LABELS[seccion]}
                                        </span>
                                    </div>
                                    <span className={cn(
                                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                                        REQUERIMIENTO_COLOR[requerimiento]
                                    )}>
                                        {REQUERIMIENTO_LABELS[requerimiento]}
                                    </span>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* ── Documentos requeridos ─────────────────── */}
                <div className="md:col-span-2">
                    <DocumentosPrograma
                        programaId={programa.id}
                        documentos={programa.documentosRequeridos ?? []}
                        onCambio={recargar}
                    />
                </div>
            </div>
        </div>
    );
}