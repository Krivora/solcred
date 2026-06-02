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
import { crearTipoDocumento } from "@/features/programas/api/programas";
import { toast } from "@/shared/lib/utils/toast";
import type { TipoDocumento } from "@/features/programas/types/programa.types";

interface Props {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onGuardar?: (data: { nombre: string; descripcion?: string }) => Promise<void>;
    onSuccess?: (tipo: TipoDocumento) => void;
}

export function TipoDocumentoDialog({ open, onOpenChange, onGuardar, onSuccess }: Props) {
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [errorNombre, setErrorNombre] = useState("");

    const reset = () => { setNombre(""); setDescripcion(""); setErrorNombre(""); };

    const handleGuardar = async () => {
        if (!nombre.trim()) { setErrorNombre("El nombre es requerido"); return; }

        setGuardando(true);
        try {
            if (onGuardar) {
                await onGuardar({ nombre: nombre.trim(), descripcion: descripcion.trim() || undefined });
            } else if (onSuccess) {
                const nuevo = await crearTipoDocumento({
                    nombre: nombre.trim(),
                    descripcion: descripcion.trim() || undefined,
                });
                onSuccess(nuevo);
            }
           toast.success("Tipo de documento creado", "El tipo de documento se ha creado correctamente");
            reset();
            onOpenChange(false);
        } catch (e: unknown) {
            toast.error("Error al guardar", e instanceof Error ? e.message : "Ocurrió un error inesperado, intenta de nuevo");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Nuevo tipo de documento</DialogTitle>
                    <DialogDescription>
                        Se agregará al catálogo global y podrás asignarlo a cualquier programa.
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
                        Guardar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}