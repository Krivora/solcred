'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Usuario, Rol } from '../types/auth.types';

// El login solo retorna id, correo, rol
// El resto de campos del usuario se pueden obtener del perfil
// Guardamos lo que tenemos y lo completamos después si es necesario
type UsuarioBasico = Pick<Usuario, 'id' | 'correo' | 'rol'>;

interface AuthStore {
  usuario: UsuarioBasico | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (usuario: UsuarioBasico, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      usuario: null,
      token: null,
      isAuthenticated: false,

      setAuth: (usuario, token) =>
        set({
          usuario,
          token,
          isAuthenticated: true,
        }),

      clearAuth: () =>
        set({
          usuario: null,
          token: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'solcred-auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        usuario: state.usuario,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);