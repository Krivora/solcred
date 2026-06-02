"use client";

import { useEffect, useState } from "react";
import {
    Trash2, FileText, Loader2, FileBadge2,
    ShieldCheck, Users, CheckCircle2, Circle, Search,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import { TipoDocumentoDialog } from "@/features/programas/components/TipoDocumentoDialog";
import {
    getTiposDocumento, agregarDocumento,
    quitarDocumento, crearTipoDocumento,
} from "../api/programas";
import type { ProgramaDocumento, TipoDocumento, AplicaA } from "../types/programa.types";
import { cn } from "@/shared/lib/utils/cn";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function AplicaBadge({ aplicaA }: { aplicaA: AplicaA }) {
    if (!aplicaA) return null;

    const config = {
        FISICA: { label: "Física",  className: "bg-primary/10 text-primary" },
        MORAL:  { label: "Moral",   className: "bg-primary/10 text-primary" },
        AMBOS:  { label: "Ambos",   className: "bg-primary/10 text-primary" },
    } as const;

    const { label, className } = config[aplicaA];

    return (
        <span className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            className
        )}>
            <Users className="h-2.5 w-2.5" />
            {label}
        </span>
    );
}

function ObligatorioBadge({ esObligatorio }: { esObligatorio: boolean }) {
    return (
        <span className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            esObligatorio
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
        )}>
            {esObligatorio
                ? <><ShieldCheck className="h-2.5 w-2.5" /> Obligatorio</>
                : <><Circle className="h-2.5 w-2.5" /> Opcional</>
            }
        </span>
    );
}

// ─────────────────────────────────────────────────────────────
// Lista de documentos
// ─────────────────────────────────────────────────────────────

function ListaDocumentos({
    documentos,
    onQuitar,
    quitando,
}: {
    documentos: ProgramaDocumento[];
    onQuitar?: (tipoDocumentoId: string) => void;
    quitando?: string | null;
}) {
    const [busqueda, setBusqueda] = useState("");

    const filtrados = busqueda.trim()
        ? documentos.filter(d =>
            d.tipoDocumento.nombre.toLowerCase().includes(busqueda.toLowerCase())
        )
        : documentos;

    if (documentos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-muted/20 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <FileBadge2 className="h-5 w-5 text-muted-foreground/50" />
                </div>
                <div>
                    <p className="text-sm font-medium text-foreground/70">Sin documentos asignados</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Agrega documentos requeridos desde el panel inferior</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {documentos.length > 4 && (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        placeholder="Buscar documento..."
                        className="h-8 pl-8 text-xs bg-muted/30 border-border/50"
                    />
                </div>
            )}

            <div className="space-y-1.5">
                {filtrados.length === 0 && (
                    <p className="py-4 text-center text-xs text-muted-foreground">Sin resultados para {busqueda}</p>
                )}
                {filtrados.map((doc, i) => (
                    <div
                        key={doc.id}
                        className={cn(
                            "group flex items-center gap-3 rounded-lg border border-border/50 bg-background px-3 py-2.5",
                            "transition-all duration-150 hover:border-border hover:bg-muted/20",
                            "animate-in fade-in-0 slide-in-from-top-1",
                        )}
                        style={{ animationDelay: `${i * 30}ms`, animationFillMode: "both" }}
                    >
                        {/* Índice */}
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                            {i + 1}
                        </span>

                        {/* Nombre */}
                        <div className="flex flex-1 flex-wrap items-center gap-1.5 min-w-0">
                            <span className="text-sm font-medium text-foreground truncate">
                                {doc.tipoDocumento.nombre}
                            </span>
                            <ObligatorioBadge esObligatorio={doc.esObligatorio} />
                            <AplicaBadge aplicaA={doc.aplicaA} />
                        </div>

                        {/* Quitar */}
                        {onQuitar && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity",
                                    "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                                    quitando === doc.tipoDocumentoId && "opacity-100"
                                )}
                                disabled={quitando === doc.tipoDocumentoId}
                                onClick={() => onQuitar(doc.tipoDocumentoId)}
                                aria-label={`Quitar ${doc.tipoDocumento.nombre}`}
                            >
                                {quitando === doc.tipoDocumentoId
                                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    : <Trash2 className="h-3.5 w-3.5" />}
                            </Button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

interface EditableProps {
    programaId: string;
    documentos: ProgramaDocumento[];
    onCambio: () => void;
}

export function DocumentosPrograma({ programaId, documentos: documentosProp, onCambio }: EditableProps) {
    const [documentos, setDocumentos] = useState<ProgramaDocumento[]>(documentosProp);
    const [tiposDisponibles, setTiposDisponibles] = useState<TipoDocumento[]>([]);
    const [loadingTipos, setLoadingTipos] = useState(true);
    const [tipoSeleccionado, setTipoSeleccionado] = useState("");
    const [esObligatorio, setEsObligatorio] = useState(true);
    const [aplicaA, setAplicaA] = useState<AplicaA>("AMBOS");
    const [agregando, setAgregando] = useState(false);
    const [quitando, setQuitando] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const cargarTipos = async () => {
        setLoadingTipos(true);
        try {
            const tipos = await getTiposDocumento();
            setTiposDisponibles(tipos);
        } catch (err) {
            console.error("Error cargando tipos de documento:", err); // 👈
        } finally {
            setLoadingTipos(false);
        }
    };
    useEffect(() => { cargarTipos(); }, []);
    const asignados = new Set(documentos.map(d => d.tipoDocumentoId));
    const disponibles = tiposDisponibles.filter(t => !asignados.has(t.id));
    const obligatorios = documentos.filter(d => d.esObligatorio).length;
    const opcionales = documentos.length - obligatorios;
    const handleAgregar = async () => {
        if (!tipoSeleccionado) return;
        setAgregando(true);
        try {
            await agregarDocumento(programaId, {
                tipoDocumentoId: tipoSeleccionado,
                esObligatorio,
                aplicaA,
            });
            const tipo = tiposDisponibles.find(t => t.id === tipoSeleccionado);
            if (tipo) {
                setDocumentos(prev => [...prev, {
                    id: crypto.randomUUID(),
                    programaId,
                    tipoDocumentoId: tipoSeleccionado,
                    esObligatorio,
                    aplicaA: aplicaA,
                    tipoDocumento: tipo,
                }]);
            }
            setTipoSeleccionado("");
            setEsObligatorio(true);
            setAplicaA("AMBOS");
            onCambio();
        } finally { setAgregando(false); }
    };
    const handleQuitar = async (tipoDocumentoId: string) => {
        setQuitando(tipoDocumentoId);
        try {
            await quitarDocumento(programaId, tipoDocumentoId);
            setDocumentos(prev => prev.filter(d => d.tipoDocumentoId !== tipoDocumentoId));
            onCambio();
        } finally { setQuitando(null); }
    };
    const handleNuevoTipo = async (data: { nombre: string; descripcion?: string }) => {
        const nuevo = await crearTipoDocumento(data);
        await cargarTipos();
        setTipoSeleccionado(nuevo.id);
        setDialogOpen(false);
    };
    return (
        <>
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="border-b border-border/60 bg-muted/20 px-5 py-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <FileText className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold leading-none">Documentos Requeridos</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {documentos.length
                                        ? `${documentos.length} asignado(s)`
                                        : "Sin documentos asignados aún"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            {documentos.length > 0 && (
                                <div className="hidden sm:flex gap-1.5">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                                        <ShieldCheck className="h-2.5 w-2.5" />
                                        {obligatorios} oblig.
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                        <Circle className="h-2.5 w-2.5" />
                                        {opcionales} opc.
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Fila 2: Formulario agregar en línea */}
                    <div className="flex flex-wrap items-center gap-2">
                        <Select
                            value={tipoSeleccionado}
                            onValueChange={setTipoSeleccionado}
                            disabled={loadingTipos || disponibles.length === 0}
                        >
                            <SelectTrigger className="h-8 w-80 bg-background text-xs border-border/70">
                                <SelectValue placeholder={
                                    loadingTipos ? "Cargando tipos..." :
                                    disponibles.length === 0 ? "Todos asignados" :
                                    "Seleccionar documento…"
                                } />
                            </SelectTrigger>
                            <SelectContent>
                                {disponibles.map(t => (
                                    <SelectItem key={t.id} value={t.id} className="text-sm">
                                        {t.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Switch obligatorio */}
                        <div className="flex items-center gap-1.5 rounded-md border border-border/60 bg-background px-2.5 h-8">
                            <Switch
                                id="sw-obligatorio"
                                checked={esObligatorio}
                                onCheckedChange={setEsObligatorio}
                                className="scale-[0.8]"
                            />
                            <Label htmlFor="sw-obligatorio" className="text-xs font-medium cursor-pointer whitespace-nowrap text-muted-foreground">
                                Obligatorio
                            </Label>
                        </div>

                        {/* Aplica a */}
                        <Select
                            value={aplicaA ?? "AMBOS"}
                            onValueChange={v => setAplicaA(v as AplicaA)}
                        >
                            <SelectTrigger className="h-8 w-30 bg-background text-xs border-border/70">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="AMBOS">Ambos</SelectItem>
                                <SelectItem value="FISICA">P. Física</SelectItem>
                                <SelectItem value="MORAL">P. Moral</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Botón */}
                        <Button
                            size="sm"
                            className="h-8 gap-1.5 text-xs shrink-0"
                            disabled={!tipoSeleccionado || agregando}
                            onClick={handleAgregar}
                        >
                            {agregando
                                ? <Loader2 className="h-3 w-3 animate-spin" />
                                : <CheckCircle2 className="h-3 w-3" />}
                            Agregar
                        </Button>
                    </div>
                </div>
                {/* ── Lista ──────────────────────────────────────────── */}
                <div className="p-5">
                    <ListaDocumentos
                        documentos={documentos}
                        onQuitar={handleQuitar}
                        quitando={quitando}
                    />
                </div>
            </div>
            <TipoDocumentoDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onGuardar={handleNuevoTipo}
            />
        </>
    );
}