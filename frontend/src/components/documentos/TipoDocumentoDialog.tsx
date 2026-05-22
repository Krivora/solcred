"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

interface Props {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onGuardar: (data: { nombre: string; descripcion?: string }) => Promise<void>;
}

export function TipoDocumentoDialog({ open, onOpenChange, onGuardar }: Props) {
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");

    const reset = () => { setNombre(""); setDescripcion(""); setError(""); };

    const handleGuardar = async () => {
        if (!nombre.trim()) { setError("El nombre es requerido"); return; }
        setGuardando(true);
        try {
            await onGuardar({ nombre: nombre.trim(), descripcion: descripcion.trim() || undefined });
            reset();
        } catch (e: any) {
            setError(e?.message ?? "Error al guardar");
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
                            onChange={(e) => { setNombre(e.target.value); setError(""); }}
                        />
                        {error && <p className="text-xs text-destructive">{error}</p>}
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