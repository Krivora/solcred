import { apiRequest } from '@/shared/lib/client';
import type {
  LoginCredentials,
  LoginResponseData,
  RegisterCredentials,
  Usuario,
} from '@/shared/lib/types/auth.types';

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

  perfil: (token: string) =>
    apiRequest<{ usuario: Usuario }>('/auth/perfil', { token }),
};