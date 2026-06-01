"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "@/lib/utils/toast";
import { usuariosApi } from "@/lib/api/admin/usuarios";
import type {
  Usuario,
  UsuarioFiltros,
  ActualizarUsuarioDto,
  CambiarRolDto,
} from "@/lib/types/usuario.types";

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await usuariosApi.listar();
      setUsuarios(data);
    } catch (err) {
      setError("No se pudieron cargar los usuarios");
      toast.error("Error al cargar usuarios",);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const actualizar = useCallback(
    async (id: string, datos: ActualizarUsuarioDto): Promise<boolean> => {
      try {
        const usuario = await usuariosApi.actualizar(id, datos);
        setUsuarios((prev) => prev.map((u) => (u.id === id ? usuario : u)));
        toast.success("Usuario actualizado correctamente");
        return true;
      } catch {
        toast.error("Error al actualizar el usuario");
        return false;
      }
    },
    []
  );

  const cambiarRol = useCallback(
    async (id: string, datos: CambiarRolDto): Promise<boolean> => {
      try {
        const usuario = await usuariosApi.cambiarRol(id, datos);
        setUsuarios((prev) => prev.map((u) => (u.id === id ? usuario : u)));
        toast.success("Rol actualizado correctamente");
        return true;
      } catch {
        toast.error("Error al cambiar el rol");
        return false;
      }
    },
    []
  );

  const desactivar = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const usuario = await usuariosApi.desactivar(id);
        setUsuarios((prev) => prev.map((u) => (u.id === id ? usuario : u)));
        toast.success("Usuario desactivado");
        return true;
      } catch {
        toast.error("Error al desactivar el usuario");
        return false;
      }
    },
    []
  );

  return {
    usuarios,
    isLoading,
    error,
    recargar: cargar,
    actualizar,
    cambiarRol,
    desactivar,
  };
}

export function useUsuariosFiltrados(
  usuarios: Usuario[],
  filtros: UsuarioFiltros
) {
  return usuarios.filter((usuario) => {
    const nombreCompleto =
      `${usuario.nombre} ${usuario.apellidoPaterno} ${usuario.apellidoMaterno}`.toLowerCase();
    const busqueda = filtros.busqueda?.toLowerCase() ?? "";

    if (
      busqueda &&
      !nombreCompleto.includes(busqueda) &&
      !usuario.correo.toLowerCase().includes(busqueda)
    ) {
      return false;
    }
    if (filtros.rol && filtros.rol !== "TODOS" && usuario.rol !== filtros.rol) {
      return false;
    }
    if (
      filtros.tipoPersona &&
      filtros.tipoPersona !== "TODOS" &&
      usuario.tipoPersona !== filtros.tipoPersona
    ) {
      return false;
    }
    if (
      filtros.activo !== undefined &&
      filtros.activo !== "TODOS" &&
      usuario.activo !== filtros.activo
    ) {
      return false;
    }
    return true;
  });
}