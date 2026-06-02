"use client";

import { useState } from "react";
import { Users } from "lucide-react";

import { UsuariosStats } from "@/features/usuarios/components/UsuariosStats";
import { UsuariosTable } from "@/features/usuarios/components/UsuariosTable";
import { UsuarioDetalleSheet } from "@/features/usuarios/components/UsuarioDetalleSheet";
import { UsuarioRolDialog } from "@/features/usuarios/components/UsuarioRolDialog";
import { UsuarioDesactivarDialog } from "@/features/usuarios/components/UsuarioDesactivarDialog";
import { useUsuarios } from "@/features/usuarios/hooks/useUsuarios";
import type { Usuario } from "@/features/usuarios/types/usuario.types";
import type { ActualizarUsuarioForm, CambiarRolForm } from "@/features/usuarios/schema/usuario.schemas";
import { PageHeader, RefreshAction } from "@/shared/components/ui/PageHeader";

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
      <PageHeader
        title="Gestión de Usuarios"
        description="Administra los usuarios registrados en el sistema"
        backHref="/dashboard/admin/configuracion"
      />

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