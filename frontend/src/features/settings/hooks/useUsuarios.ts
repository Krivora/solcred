"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usuarioToast } from "@/shared/lib/toaster";
import { usuariosApi } from "@/features/settings/api/usuarios.api";
import { usuarioKeys } from "@/features/settings/lib/settings.keys";
import type {
  Usuario,
  UsuarioFiltros,
  ActualizarUsuarioDto,
  CambiarRolDto,
} from "@/features/settings/types/usuario.types";
import { obtenerRolEfectivo } from "@/shared/types/auth.types";

export function useUsuarios() {
  const qc = useQueryClient();

  const {
    data: usuarios = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: usuarioKeys.list(),
    queryFn: usuariosApi.listar,
  });

  const invalidar = () => qc.invalidateQueries({ queryKey: usuarioKeys.all });

  const actualizarMut = useMutation({
    mutationFn: ({ id, datos }: { id: string; datos: ActualizarUsuarioDto }) =>
      usuariosApi.actualizar(id, datos),
    onSuccess: () => {
      usuarioToast.actualizado();
      invalidar();
    },
    onError: () => usuarioToast.actualizarError(),
  });

  const cambiarRolMut = useMutation({
    mutationFn: ({ id, datos }: { id: string; datos: CambiarRolDto }) =>
      usuariosApi.cambiarRol(id, datos),
    onSuccess: () => {
      usuarioToast.rolActualizado();
      invalidar();
    },
    onError: () => usuarioToast.cambiarRolError(),
  });

  const desactivarMut = useMutation({
    mutationFn: (id: string) => usuariosApi.desactivar(id),
    onSuccess: () => {
      usuarioToast.desactivado();
      invalidar();
    },
    onError: () => usuarioToast.desactivarError(),
  });

  const revocarAccesoMut = useMutation({
    mutationFn: (id: string) => usuariosApi.revocarAcceso(id),
    onSuccess: () => {
      usuarioToast.accesoRevocado();
      invalidar();
    },
    onError: () => usuarioToast.revocarAccesoError(),
  });

  const actualizar = async (id: string, datos: ActualizarUsuarioDto): Promise<boolean> => {
    try {
      await actualizarMut.mutateAsync({ id, datos });
      return true;
    } catch {
      return false;
    }
  };

  const cambiarRol = async (id: string, datos: CambiarRolDto): Promise<boolean> => {
    try {
      await cambiarRolMut.mutateAsync({ id, datos });
      return true;
    } catch {
      return false;
    }
  };

  const desactivar = async (id: string): Promise<boolean> => {
    try {
      await desactivarMut.mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  };

  const revocarAcceso = async (id: string): Promise<boolean> => {
    try {
      await revocarAccesoMut.mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  };

  return {
    usuarios,
    isLoading,
    error: isError ? "No se pudieron cargar los usuarios" : null,
    recargar: invalidar,
    actualizar,
    cambiarRol,
    revocarAcceso,
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
    if (filtros.rol && filtros.rol !== "TODOS" && obtenerRolEfectivo(usuario) !== filtros.rol) {
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
