"use client";

import { useEffect, useState } from "react";
import { FileBadge2, Plus, Search, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { TipoDocumentoDialog } from "@/components/documentos/TipoDocumentoDialog";
import { getTiposDocumento } from "@/lib/api/programas";
import type { TipoDocumento } from "@/lib/types/programa.types";

export default function DocumentosPage() {
    const [tipos, setTipos] = useState<TipoDocumento[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => { fetchTipos(); }, []);

    async function fetchTipos() {
        setLoading(true);
        try {
            setTipos(await getTiposDocumento());
        } finally {
            setLoading(false);
        }
    }

    const filtered = tipos
    .filter((t) =>
        t.nombre.toLowerCase().includes(search.toLowerCase()) ||
        (t.descripcion ?? "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
        a.nombre.localeCompare(b.nombre, "es", {
            sensitivity: "base",
        })
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

            {/* Table */}
            <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <TableHead className="w-8 text-center">Id</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead className="text-right">Creado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4}>
                                    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                            <FileBadge2 className="h-5 w-5 text-muted-foreground/50" />
                                        </div>
                                        <p className="text-sm font-medium text-foreground/70">
                                            {search ? `Sin resultados para "${search}"` : "Sin tipos de documento"}
                                        </p>
                                        {!search && (
                                            <Button size="sm" className="gap-2 mt-1" onClick={() => setDialogOpen(true)}>
                                                <Plus className="h-4 w-4" /> Nuevo tipo
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((tipo, i) => (
                                <TableRow key={tipo.id} className="group">
                                    <TableCell className="text-center text-xs text-muted-foreground font-medium">
                                        {i + 1}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                                                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                            </div>
                                            <span className="text-sm font-medium">{tipo.nombre}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                                        {tipo.descripcion ?? <span className="italic text-muted-foreground/50">Sin descripción</span>}
                                    </TableCell>
                                    <TableCell className="text-right text-xs text-muted-foreground">
                                        {tipo.creadoEn
                                            ? new Date(tipo.creadoEn).toLocaleDateString("es-MX", {
                                                year: "numeric", month: "short", day: "numeric",
                                            })
                                            : "—"}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* Footer con conteo */}
                {!loading && filtered.length > 0 && (
                    <div className="border-t border-border bg-muted/20 px-4 py-2.5">
                        <p className="text-xs text-muted-foreground">
                            {filtered.length} tipo{filtered.length !== 1 && "s"} de documento
                            {search && ` · filtrando por "${search}"`}
                        </p>
                    </div>
                )}
            </div>

            <TipoDocumentoDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSuccess={(tipo) => setTipos(prev => [tipo, ...prev])}
            />
        </div>
    );
}