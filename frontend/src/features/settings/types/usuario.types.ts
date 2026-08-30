import type { Rol, RolAplicacion } from "@/shared/types/auth.types";

export type TipoPersona = "FISICA" | "MORAL";

export interface PersonalInfo {
  id: string;
  rol: Rol;
  departamento?: string | null;
  extension?: string | null;
  activo: boolean;
  fechaIngreso: string;
}

export interface Usuario {
  id: string;
  correo: string;
  tipoUsuario: "CLIENTE" | "PERSONAL";
  tipoPersona: TipoPersona;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  curp?: string | null;
  rfc?: string | null;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
  // ── FIX: rol ya no es plano, se anida vía personal. null si es CLIENTE ──
  personal: PersonalInfo | null;
}

export interface UsuarioFiltros {
  busqueda?: string;
  rol?: RolAplicacion | "TODOS"; // ── FIX ──
  tipoPersona?: TipoPersona | "TODOS";
  activo?: boolean | "TODOS";
}

export interface ActualizarUsuarioDto {
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  curp?: string;
  rfc?: string;
  tipoPersona?: TipoPersona;
}

// ── FIX: cambiarRol solo asigna roles de staff, nunca CLIENTE ────────────
export interface CambiarRolDto {
  rol: Rol;
}

export type UsuariosResponse = Usuario[];
export type UsuarioResponse = Usuario;