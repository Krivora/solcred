export type Rol = 'ADMIN' | 'ANALISTA' | 'CLIENTE';
export type TipoPersona = 'FISICA' | 'MORAL';

export interface Usuario {
  id: string;
  correo: string;
  rol: Rol;
  tipoPersona: TipoPersona;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  curp?: string;
  rfc?: string;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
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
// usuario solo trae id, correo, rol en el login
export interface LoginResponseData {
  usuario: Pick<Usuario, 'id' | 'correo' | 'rol'>;
  token: string;
}