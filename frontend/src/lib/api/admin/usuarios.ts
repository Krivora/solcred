import { apiAuth } from "../client";
import type {
  UsuariosResponse,
  UsuarioResponse,
  ActualizarUsuarioDto,
  CambiarRolDto,
} from "@/lib/types/usuario.types";

export const usuariosApi = {
  listar: (): Promise<UsuariosResponse> =>
    apiAuth("/admin/usuarios"),

  obtenerPorId: (id: string): Promise<UsuarioResponse> =>
    apiAuth(`/admin/usuarios/${id}`),

  actualizar: (id: string, datos: ActualizarUsuarioDto): Promise<UsuarioResponse> =>
    apiAuth(`/admin/usuarios/${id}`, { method: "PUT", body: datos }),

  cambiarRol: (id: string, datos: CambiarRolDto): Promise<UsuarioResponse> =>
    apiAuth(`/admin/usuarios/${id}/rol`, { method: "PATCH", body: datos }),

  desactivar: (id: string): Promise<UsuarioResponse> =>
    apiAuth(`/admin/usuarios/${id}/desactivar`, { method: "PATCH", body: {} }),
};