import { apiAuth, apiRequest } from '@/shared/api/client';
import type {
  LoginCredentials,
  LoginResponseData,
  RegisterCredentials,
  Usuario,
} from '@/shared/types/auth.types';

export const authApi = {
  login: (credentials: LoginCredentials) =>
    apiRequest<LoginResponseData>('/auth/login', {
      method: 'POST',
      body: credentials,
    }),

  registro: (credentials: RegisterCredentials) =>
    apiRequest<{ usuario: Usuario }>('/auth/registro', {
      method: 'POST',
      body: credentials,
    }),

  perfil: () => apiAuth<Usuario>('/auth/perfil'),

  /** Rota el refresh token (cookie httpOnly) y devuelve un access token nuevo. */
  refresh: () =>
    apiRequest<LoginResponseData>('/auth/refresh', { method: 'POST' }),

  /** Revoca la sesión de refresh en el servidor. Best-effort. */
  logout: () => apiRequest<null>('/auth/logout', { method: 'POST' }),
};
