"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
} from "@/shared/components/ui/dialog";
import { crearTipoDocumento } from "@/features/settings/api/programas.api";
import { programaToast } from "@/shared/lib/toaster";
import type { TipoDocumento } from "@/features/settings/types/programa.types";

interface Props {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    /** Si viene, el diálogo entra en modo edición y precarga sus datos. */
    tipo?: TipoDocumento | null;
    /** Modo edición: el padre persiste el cambio. */
    onEditar?: (id: string, data: { nombre?: string; descripcion?: string | null }) => Promise<boolean>;
    /** Modo alta: el padre persiste la creación. */
    onGuardar?: (data: { nombre: string; descripcion?: string }) => Promise<void>;
    /** Modo alta: el diálogo persiste y avisa al padre. */
    onSuccess?: (tipo: TipoDocumento) => void;
}

export function TipoDocumentoDialog({ open, onOpenChange, tipo, onEditar, onGuardar, onSuccess }: Props) {
    const esEdicion = !!tipo;
    const [nombre, setNombre] = useState(tipo?.nombre ?? "");
    const [descripcion, setDescripcion] = useState(tipo?.descripcion ?? "");
    const [guardando, setGuardando] = useState(false);
    const [errorNombre, setErrorNombre] = useState("");

    const reset = () => { setNombre(tipo?.nombre ?? ""); setDescripcion(tipo?.descripcion ?? ""); setErrorNombre(""); };

    const handleGuardar = async () => {
        if (!nombre.trim()) { setErrorNombre("El nombre es requerido"); return; }

        setGuardando(true);
        try {
            if (esEdicion && onEditar) {
                const ok = await onEditar(tipo!.id, {
                    nombre: nombre.trim(),
                    descripcion: descripcion.trim() || null,
                });
                if (!ok) return; // el hook ya mostró el error
            } else if (onGuardar) {
                await onGuardar({ nombre: nombre.trim(), descripcion: descripcion.trim() || undefined });
            } else if (onSuccess) {
                const nuevo = await crearTipoDocumento({
                    nombre: nombre.trim(),
                    descripcion: descripcion.trim() || undefined,
                });
                onSuccess(nuevo);
                programaToast.tipoDocumentoCreado();
            }
            onOpenChange(false);
        } catch (e: unknown) {
            programaToast.tipoDocumentoError(e instanceof Error ? e.message : undefined);
        } finally {
            setGuardando(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {esEdicion ? "Editar tipo de documento" : "Nuevo tipo de documento"}
                    </DialogTitle>
                    <DialogDescription>
                        {esEdicion
                            ? "Los cambios aplican al catálogo global y a todos los programas que lo usan."
                            : "Se agregará al catálogo global y podrás asignarlo a cualquier programa."}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="td-nombre">Nombre *</Label>
                        <Input
                            id="td-nombre"
                            placeholder="Ej: INE, CURP, Acta constitutiva"
                            value={nombre}
                            onChange={(e) => { setNombre(e.target.value); setErrorNombre(""); }}
                            onKeyDown={(e) => e.key === "Enter" && handleGuardar()}
                        />
                        {errorNombre && <p className="text-xs text-destructive">{errorNombre}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="td-desc">
                            Descripción <span className="text-muted-foreground font-normal">(opcional)</span>
                        </Label>
                        <Textarea
                            id="td-desc"
                            placeholder="Descripción breve del documento..."
                            rows={3}
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }} disabled={guardando}>
                        Cancelar
                    </Button>
                    <Button onClick={handleGuardar} disabled={guardando}>
                        {guardando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {esEdicion ? "Guardar cambios" : "Guardar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
