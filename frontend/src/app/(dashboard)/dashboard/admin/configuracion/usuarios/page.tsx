"use client";

import { useState } from "react";
import { Users } from "lucide-react";

import { UsuariosStats } from "@/features/settings/components/usuarios/UsuariosStats";
import { UsuariosTable } from "@/features/settings/components/usuarios/UsuariosTable";
import { UsuarioDetalleSheet } from "@/features/settings/components/usuarios/UsuarioDetalleSheet";
import { UsuarioRolDialog } from "@/features/settings/components/usuarios/UsuarioRolDialog";
import { UsuarioDesactivarDialog } from "@/features/settings/components/usuarios/UsuarioDesactivarDialog";
import { useUsuarios } from "@/features/settings/hooks/useUsuarios";
import type { Usuario } from "@/features/settings/types/usuario.types";
import type { ActualizarUsuarioForm, CambiarRolForm } from "@/features/settings/schema/usuario.schemas";
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