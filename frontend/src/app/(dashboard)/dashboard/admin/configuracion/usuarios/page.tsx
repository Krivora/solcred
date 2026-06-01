"use client";

import { useState } from "react";
import { Users } from "lucide-react";

import { UsuariosStats } from "@/features/usuarios/components/UsuariosStats";
import { UsuariosTable } from "@/features/usuarios/components/UsuariosTable";
import { UsuarioDetalleSheet } from "@/features/usuarios/components/UsuarioDetalleSheet";
import { UsuarioRolDialog } from "@/features/usuarios/components/UsuarioRolDialog";
import { UsuarioDesactivarDialog } from "@/features/usuarios/components/UsuarioDesactivarDialog";
import { useUsuarios } from "@/lib/hooks/useUsuarios";
import type { Usuario } from "@/lib/types/usuario.types";
import type { ActualizarUsuarioForm, CambiarRolForm } from "@/lib/schemas/usuario.schemas";

export default function UsuariosPage() {
  const { usuarios, isLoading, recargar, actualizar, cambiarRol, desactivar } =
    useUsuarios();

  const [usuarioDetalle, setUsuarioDetalle] = useState<Usuario | null>(null);
  const [usuarioRol, setUsuarioRol] = useState<Usuario | null>(null);
  const [usuarioDesactivar, setUsuarioDesactivar] = useState<Usuario | null>(null);

  const handleGuardar = async (id: string, datos: ActualizarUsuarioForm): Promise<boolean> => {
    return actualizar(id, datos);
  };

  const handleCambiarRol = async (id: string, datos: CambiarRolForm): Promise<boolean> => {
    return cambiarRol(id, datos);
  };

  const handleDesactivar = async (id: string): Promise<boolean> => {
    return desactivar(id);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Gestión de Usuarios
            </h1>
            <p className="text-sm text-muted-foreground">
              Administra los usuarios registrados en el sistema
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <UsuariosStats usuarios={usuarios} isLoading={isLoading} />

      {/* Tabla */}
      <UsuariosTable
        usuarios={usuarios}
        isLoading={isLoading}
        onVerDetalle={setUsuarioDetalle}
        onCambiarRol={setUsuarioRol}
        onDesactivar={setUsuarioDesactivar}
        onRecargar={recargar}
      />

      {/* Sheet detalle / edición */}
      <UsuarioDetalleSheet
        usuario={usuarioDetalle}
        open={!!usuarioDetalle}
        onOpenChange={(open) => !open && setUsuarioDetalle(null)}
        onGuardar={handleGuardar}
      />

      {/* Dialog cambiar rol */}
      <UsuarioRolDialog
        usuario={usuarioRol}
        open={!!usuarioRol}
        onOpenChange={(open) => !open && setUsuarioRol(null)}
        onConfirmar={handleCambiarRol}
      />

      {/* Dialog desactivar */}
      <UsuarioDesactivarDialog
        usuario={usuarioDesactivar}
        open={!!usuarioDesactivar}
        onOpenChange={(open) => !open && setUsuarioDesactivar(null)}
        onConfirmar={handleDesactivar}
      />
    </div>
  );
}