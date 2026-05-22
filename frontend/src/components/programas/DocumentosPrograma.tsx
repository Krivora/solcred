"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, FileText, Loader2, FileBadge2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TipoDocumentoDialog } from "@/components/documentos/TipoDocumentoDialog";
import {
    getTiposDocumento, agregarDocumento,
    quitarDocumento, crearTipoDocumento,
} from "@/lib/api/programas";
import type { ProgramaDocumento, TipoDocumento, AplicaA } from "@/lib/types/programa.types";

interface Props {
    programaId: string;
    documentos: ProgramaDocumento[];
    onCambio: () => void;
}

export function DocumentosPrograma({ programaId, documentos, onCambio }: Props) {
    const [tiposDisponibles, setTiposDisponibles] = useState<TipoDocumento[]>([]);
    const [loadingTipos, setLoadingTipos] = useState(true);
    const [tipoSeleccionado, setTipoSeleccionado] = useState("");
    const [esObligatorio, setEsObligatorio] = useState(true);
    const [aplicaA, setAplicaA] = useState<AplicaA>(null);
    const [agregando, setAgregando] = useState(false);
    const [quitando, setQuitando] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const cargarTipos = async () => {
        setLoadingTipos(true);
        try {
            const data = await getTiposDocumento();
            setTiposDisponibles(data);
        } finally {
            setLoadingTipos(false);
        }
    };

    useEffect(() => { cargarTipos(); }, []);

    const asignados = new Set(documentos.map((d) => d.tipoDocumentoId));
    const disponibles = tiposDisponibles.filter((t) => !asignados.has(t.id));

    const handleAgregar = async () => {
        if (!tipoSeleccionado) return;
        setAgregando(true);
        try {
            await agregarDocumento(programaId, {
                tipoDocumentoId: tipoSeleccionado,
                esObligatorio,
                aplicaA: aplicaA ?? null,
            });
            setTipoSeleccionado("");
            setEsObligatorio(true);
            setAplicaA(null);
            onCambio();
        } finally {
            setAgregando(false);
        }
    };

    const handleQuitar = async (tipoDocumentoId: string) => {
        setQuitando(tipoDocumentoId);
        try {
            await quitarDocumento(programaId, tipoDocumentoId);
            onCambio();
        } finally {
            setQuitando(null);
        }
    };

    const handleNuevoTipo = async (data: { nombre: string; descripcion?: string }) => {
        const nuevo = await crearTipoDocumento(data);
        await cargarTipos();
        setTipoSeleccionado(nuevo.id);
        setDialogOpen(false);
    };

    return (
        <>
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <FileText className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold">Documentos Requeridos</h3>
                            <p className="text-xs text-muted-foreground">
                                {documentos.length
                                    ? `${documentos.length} documento(s) asignado(s)`
                                    : "Sin documentos asignados aún"}
                            </p>
                        </div>
                    </div>
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setDialogOpen(true)}>
                        <Plus className="h-3.5 w-3.5" />
                        Nuevo tipo
                    </Button>
                </div>

                {/* Lista asignados */}
                {documentos.length > 0 ? (
                    <div className="rounded-lg border divide-y">
                        {documentos.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between px-3 py-2.5">
                                <div className="flex items-center gap-2">
                                    <FileBadge2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    <span className="text-sm font-medium">{doc.tipoDocumento.nombre}</span>
                                    <div className="flex gap-1">
                                        <Badge
                                            variant={doc.esObligatorio ? "default" : "secondary"}
                                            className="text-xs h-5"
                                        >
                                            {doc.esObligatorio ? "Obligatorio" : "Opcional"}
                                        </Badge>
                                        {doc.aplicaA && (
                                            <Badge variant="outline" className="text-xs h-5">
                                                {doc.aplicaA === "FISICA" ? "Física" : "Moral"}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    disabled={quitando === doc.tipoDocumentoId}
                                    onClick={() => handleQuitar(doc.tipoDocumentoId)}
                                >
                                    {quitando === doc.tipoDocumentoId
                                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        : <Trash2 className="h-3.5 w-3.5" />}
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-8 text-center">
                        <FileBadge2 className="h-8 w-8 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">Sin documentos asignados</p>
                    </div>
                )}

                <Separator />

                {/* Form agregar */}
                <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Agregar documento
                    </p>

                    <Select
                        value={tipoSeleccionado}
                        onValueChange={setTipoSeleccionado}
                        disabled={loadingTipos || disponibles.length === 0}
                    >
                        <SelectTrigger className="h-9">
                            <SelectValue placeholder={
                                loadingTipos ? "Cargando..." :
                                disponibles.length === 0 ? "Todos los tipos ya están asignados" :
                                "Seleccionar tipo de documento"
                            } />
                        </SelectTrigger>
                        <SelectContent>
                            {disponibles.map((t) => (
                                <SelectItem key={t.id} value={t.id}>
                                    {t.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="flex flex-wrap items-center gap-5">
                        <div className="flex items-center gap-2">
                            <Switch
                                id="sw-obligatorio"
                                checked={esObligatorio}
                                onCheckedChange={setEsObligatorio}
                            />
                            <Label htmlFor="sw-obligatorio" className="text-sm cursor-pointer">
                                Obligatorio
                            </Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Label className="text-sm text-muted-foreground">Aplica a:</Label>
                            <Select
                                value={aplicaA ?? "AMBOS"}
                                onValueChange={(v) => setAplicaA(v === "AMBOS" ? null : v as AplicaA)}
                            >
                                <SelectTrigger className="h-8 w-[140px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AMBOS">Ambos</SelectItem>
                                    <SelectItem value="FISICA">Persona Física</SelectItem>
                                    <SelectItem value="MORAL">Persona Moral</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Button
                        size="sm"
                        disabled={!tipoSeleccionado || agregando}
                        onClick={handleAgregar}
                        className="gap-1.5"
                    >
                        {agregando
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Plus className="h-3.5 w-3.5" />}
                        Agregar
                    </Button>
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