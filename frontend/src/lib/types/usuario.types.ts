export type Rol = "ADMIN" | "ANALISTA" | "CLIENTE";
export type TipoPersona = "FISICA" | "MORAL";

export interface Usuario {
  id: string;
  correo: string;
  rol: Rol;
  tipoPersona: TipoPersona;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  curp?: string | null;
  rfc?: string | null;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

export interface UsuarioFiltros {
  busqueda?: string;
  rol?: Rol | "TODOS";
  tipoPersona?: TipoPersona | "TODOS";
  activo?: boolean | "TODOS";
}

export interface ActualizarUsuarioDto {
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  correo?: string;
  curp?: string;
  rfc?: string;
  tipoPersona?: TipoPersona;
}

export interface CambiarRolDto {
  rol: Rol;
}

export type UsuariosResponse = Usuario[];
export type UsuarioResponse = Usuario;