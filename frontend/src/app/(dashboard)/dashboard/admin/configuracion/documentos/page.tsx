"use client";

import { useState } from "react";
import {
    FileBadge2, Plus, Search, FileText, CalendarDays,
    MoreVertical, Pencil, Trash2, Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { TipoDocumentoDialog } from "@/features/settings/components/programas/TipoDocumentoDialog";
import { useTiposDocumento } from "@/features/settings/hooks/useProgramas";
import { PageHeader } from "@/shared/components/common/PageHeader";
import type { TipoDocumento } from "@/features/settings/types/programa.types";

function TipoCard({
    tipo,
    onEditar,
    onEliminar,
}: {
    tipo: TipoDocumento;
    onEditar: (t: TipoDocumento) => void;
    onEliminar: (t: TipoDocumento) => void;
}) {
    return (
        <div className="group relative flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/40">
            <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
                    <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1 pr-6">
                    <h3 className="text-sm font-semibold text-foreground leading-snug">
                        {tipo.nombre}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                        {tipo.descripcion?.trim() || (
                            <span className="italic text-muted-foreground/50">Sin descripción</span>
                        )}
                    </p>
                </div>
            </div>

            {tipo.creadoEn && (
                <div className="mt-3 flex items-center gap-1.5 border-t border-border/50 pt-2.5 text-[11px] text-muted-foreground/70">
                    <CalendarDays className="h-3 w-3" />
                    Creado el {format(new Date(tipo.creadoEn), "d 'de' MMM, yyyy", { locale: es })}
                </div>
            )}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 h-7 w-7 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
                        aria-label={`Opciones de ${tipo.nombre}`}
                    >
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => onEditar(tipo)} className="gap-2">
                        <Pencil className="h-3.5 w-3.5" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => onEliminar(tipo)}
                        className="gap-2 text-destructive focus:text-destructive"
                    >
                        <Trash2 className="h-3.5 w-3.5" /> Eliminar
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

function CardSkeleton() {
    return (
        <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start gap-3">
                <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                </div>
            </div>
        </div>
    );
}

export default function DocumentosPage() {
    const { tipos, cargando, recargar, actualizar, eliminar, eliminando } = useTiposDocumento();
    const [search, setSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editando, setEditando] = useState<TipoDocumento | null>(null);
    const [porEliminar, setPorEliminar] = useState<TipoDocumento | null>(null);

    const filtered = tipos
        .filter(
            (t) =>
                t.nombre.toLowerCase().includes(search.toLowerCase()) ||
                (t.descripcion ?? "").toLowerCase().includes(search.toLowerCase()),
        )
        .sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }));

    const confirmarEliminar = async () => {
        if (!porEliminar) return;
        const ok = await eliminar(porEliminar.id);
        if (ok) setPorEliminar(null);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Tipos de documento"
                description="Catálogo global de documentos requeridos por los programas"
                backHref="/dashboard/admin/configuracion"
                action={{
                    label: "Nuevo tipo",
                    onClick: () => setDialogOpen(true),
                    icon: <Plus className="h-4 w-4" />,
                    variant: "default",
                }}
            />

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre o descripción…"
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                {!cargando && (
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {filtered.length} {filtered.length === 1 ? "tipo" : "tipos"}
                        {search && ` de ${tipos.length}`}
                    </span>
                )}
            </div>

            {/* Contenido */}
            {cargando ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-muted/20 py-16 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <FileBadge2 className="h-5 w-5 text-muted-foreground/50" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground/70">
                            {search ? `Sin resultados para "${search}"` : "Aún no hay tipos de documento"}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {search
                                ? "Prueba con otro término de búsqueda"
                                : "Crea el primero para poder asignarlo a los programas"}
                        </p>
                    </div>
                    {!search && (
                        <Button size="sm" className="mt-1 gap-2" onClick={() => setDialogOpen(true)}>
                            <Plus className="h-4 w-4" /> Nuevo tipo
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((tipo) => (
                        <TipoCard
                            key={tipo.id}
                            tipo={tipo}
                            onEditar={setEditando}
                            onEliminar={setPorEliminar}
                        />
                    ))}
                </div>
            )}

            {/* Alta */}
            <TipoDocumentoDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSuccess={() => recargar()}
            />

            {/* Edición */}
            <TipoDocumentoDialog
                key={editando?.id ?? "sin-edicion"}
                open={!!editando}
                tipo={editando}
                onEditar={actualizar}
                onOpenChange={(v) => { if (!v) setEditando(null); }}
            />

            {/* Confirmación de borrado */}
            <AlertDialog open={!!porEliminar} onOpenChange={(v) => { if (!v && !eliminando) setPorEliminar(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Eliminar &ldquo;{porEliminar?.nombre}&rdquo;
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Se quitará del catálogo global. Solo es posible si no está asignado a
                            ningún programa ni tiene documentos subidos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={eliminando}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => { e.preventDefault(); confirmarEliminar(); }}
                            disabled={eliminando}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            {eliminando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
