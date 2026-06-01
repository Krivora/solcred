"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import type { Usuario } from "@/lib/types/usuario.types";

interface UsuarioDesactivarDialogProps {
  usuario: Usuario | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmar: (id: string) => Promise<boolean>;
}

export function UsuarioDesactivarDialog({
  usuario,
  open,
  onOpenChange,
  onConfirmar,
}: UsuarioDesactivarDialogProps) {
  const [procesando, setProcesando] = useState(false);

  const handleConfirmar = async () => {
    if (!usuario) return;
    setProcesando(true);
    const ok = await onConfirmar(usuario.id);
    setProcesando(false);
    if (ok) onOpenChange(false);
  };

  if (!usuario) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <DialogTitle>Desactivar usuario</DialogTitle>
          </div>
          <DialogDescription>
            ¿Estás seguro de que deseas desactivar a{" "}
            <span className="font-medium text-foreground">
              {usuario.nombre} {usuario.apellidoPaterno}
            </span>
            ? El usuario no podrá acceder al sistema hasta que sea reactivado. Esta acción puede revertirse.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={procesando}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmar}
            disabled={procesando}
          >
            {procesando ? "Desactivando..." : "Sí, desactivar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}