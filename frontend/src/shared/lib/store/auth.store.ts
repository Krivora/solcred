'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Usuario } from '../types/auth.types';
import { setCookie, deleteCookie } from '../utils/cookies';

type UsuarioBasico = Pick<Usuario, 'id' | 'correo' | 'rol'>;

interface AuthStore {
  usuario: UsuarioBasico | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (usuario: UsuarioBasico, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      usuario: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (usuario, token) => {
        // Cookies para que el middleware (server) pueda validar sesión y rol
        setCookie('sc_token', token);
        setCookie('sc_role', usuario.rol);
        set({ usuario, token, isAuthenticated: true });
      },

      clearAuth: () => {
        deleteCookie('sc_token');
        deleteCookie('sc_role');
        set({ usuario: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'solcred-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        usuario: state.usuario,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.isLoading = false;
      },
    },
  ),
);