"use client";

import { useState } from "react";
import { ShieldOff } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import type { Usuario } from "@/features/settings/types/usuario.types";

interface UsuarioRevocarAccesoDialogProps {
  usuario: Usuario | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmar: (id: string) => Promise<boolean>;
}

export function UsuarioRevocarAccesoDialog({
  usuario,
  open,
  onOpenChange,
  onConfirmar,
}: UsuarioRevocarAccesoDialogProps) {
  const [procesando, setProcesando] = useState(false);

  if (!usuario) return null;

  const handleConfirmar = async () => {
    setProcesando(true);
    const ok = await onConfirmar(usuario.id);
    setProcesando(false);
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-destructive/10 mb-2">
            <ShieldOff className="h-4 w-4 text-destructive" />
          </div>
          <DialogTitle>Revocar acceso de personal</DialogTitle>
          <DialogDescription className="pt-1.5">
            <strong className="text-foreground font-medium">
              {usuario.nombre} {usuario.apellidoPaterno}
            </strong>{" "}
            perderá su rol de{" "}
            <strong className="text-foreground font-medium">
              {usuario.personal?.rol ?? "personal"}
            </strong>{" "}
            y regresará a ser un usuario CLIENTE. Su historial de asignaciones y
            actividad se conserva, pero ya no podrá acceder a las funciones internas
            del sistema.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={procesando}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirmar}
            disabled={procesando}
          >
            {procesando ? "Revocando…" : "Revocar acceso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}