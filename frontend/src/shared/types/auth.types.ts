import type { Rol, TipoPersona, TipoUsuario } from './domain.enums';
export type { Rol, TipoPersona, TipoUsuario };
export type RolAplicacion = Rol | 'CLIENTE';

export interface PersonalInfo {
  id: string;
  rol: Rol;
  departamento?: string | null;
  activo: boolean;
}

export interface Usuario {
  id: string;
  correo: string;
  tipoUsuario: TipoUsuario;
  tipoPersona: TipoPersona;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  curp?: string;
  rfc?: string;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
  // ── FIX: rol ya no es plano, viene anidado. null si es CLIENTE ─────────
  personal: PersonalInfo | null;
}

export interface LoginCredentials {
  correo: string;
  contrasena: string;
}

export interface RegisterCredentials {
  correo: string;
  contrasena: string;
  tipoPersona: TipoPersona;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  curp?: string;
  rfc?: string;
}

// El backend retorna en data: { usuario, token }
export interface LoginResponseData {
  usuario: Pick<Usuario,'id' | 'correo' | 'nombre' | 'apellidoPaterno' | 'tipoUsuario' | 'personal'>;
  token: string;
}

// Helper para obtener el rol efectivo (CLIENTE si no tiene Personal)
export const obtenerRolEfectivo = (usuario: Pick<Usuario, 'personal'>): RolAplicacion =>
  usuario.personal?.activo ? usuario.personal.rol : 'CLIENTE';

