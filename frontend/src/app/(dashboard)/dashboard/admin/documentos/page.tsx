"use client";

// src/app/(dashboard)/dashboard/admin/documentos/page.tsx

import { useEffect, useState } from "react";
import { FileBadge2, Plus, Search, FileText, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TipoDocumentoDialog } from "@/components/documentos/TipoDocumentoDialog";
import { getTiposDocumento, crearTipoDocumento } from "@/lib/api/programas";
import type { TipoDocumento } from "@/lib/types/programa.types";

export default function DocumentosPage() {
    const [tipos, setTipos] = useState<TipoDocumento[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        fetchTipos();
    }, []);

    async function fetchTipos() {
        setLoading(true);
        try {
            const data = await getTiposDocumento();
            setTipos(data);
        } catch {
            // handle silently — toast could go here
        } finally {
            setLoading(false);
        }
    }

    function handleCreated(tipo: TipoDocumento) {
        setTipos((prev) => [tipo, ...prev]);
    }

    const filtered = tipos.filter((t) =>
        t.nombre.toLowerCase().includes(search.toLowerCase()) ||
        (t.descripcion ?? "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FileBadge2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">Tipos de documento</h1>
                        <p className="text-sm text-muted-foreground">
                            Catálogo global de documentos requeridos por los programas
                        </p>
                    </div>
                </div>
                <Button onClick={() => setDialogOpen(true)} size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nuevo tipo
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total de tipos</CardDescription>
                        <CardTitle className="text-3xl">
                            {loading ? <Skeleton className="h-9 w-12" /> : tipos.length}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">Documentos registrados en el catálogo</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nombre o descripción…"
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* List */}
            {loading ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-lg" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <EmptyState hasSearch={search.length > 0} onNew={() => setDialogOpen(true)} />
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {filtered.map((tipo) => (
                        <TipoDocumentoCard key={tipo.id} tipo={tipo} />
                    ))}
                </div>
            )}

            <TipoDocumentoDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSuccess={handleCreated}
            />
        </div>
    );
}

// ── Sub-components ────────────────────────────────────────────

function TipoDocumentoCard({ tipo }: { tipo: TipoDocumento }) {
    return (
        <Card className="group transition-shadow hover:shadow-md">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary">
                        <FileText className="h-4 w-4 text-secondary-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-medium">{tipo.nombre}</p>
                            <Badge variant="secondary" className="shrink-0 text-xs gap-1">
                                <Tag className="h-2.5 w-2.5" />
                                Doc
                            </Badge>
                        </div>
                        {tipo.descripcion ? (
                            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                                {tipo.descripcion}
                            </p>
                        ) : (
                            <p className="mt-0.5 text-xs text-muted-foreground/50 italic">
                                Sin descripción
                            </p>
                        )}
                        {tipo.creadoEn && (
                            <p className="mt-2 text-[11px] text-muted-foreground/60">
                                Creado:{" "}
                                {new Date(tipo.creadoEn).toLocaleDateString("es-MX", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function EmptyState({
    hasSearch,
    onNew,
}: {
    hasSearch: boolean;
    onNew: () => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <FileBadge2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-sm font-medium">
                {hasSearch ? "Sin resultados" : "Sin tipos de documento"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
                {hasSearch
                    ? "Intenta con otro término de búsqueda."
                    : "Agrega el primer tipo de documento al catálogo."}
            </p>
            {!hasSearch && (
                <Button onClick={onNew} size="sm" className="mt-4 gap-2">
                    <Plus className="h-4 w-4" />
                    Nuevo tipo
                </Button>
            )}
        </div>
    );
}