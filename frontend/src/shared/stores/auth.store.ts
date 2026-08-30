'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Usuario, RolAplicacion } from '@/shared/types/auth.types';
import { obtenerRolEfectivo } from '@/shared/types/auth.types';
import { setCookie, deleteCookie } from '@/shared/lib/cookies';

type UsuarioBasico = Pick<Usuario, 'id' | 'correo' | 'nombre' | 'apellidoPaterno' | 'tipoUsuario' | 'personal'>;

interface AuthStore {
  usuario: UsuarioBasico | null;
  token: string | null;
  rol: RolAplicacion | null;
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
      rol: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (usuario, token) => {
        const rolEfectivo = obtenerRolEfectivo(usuario);

        setCookie('sc_token', token);
        setCookie('sc_role', rolEfectivo);
        set({ usuario, token, rol: rolEfectivo, isAuthenticated: true });
      },

      clearAuth: () => {
        deleteCookie('sc_token');
        deleteCookie('sc_role');
        set({ usuario: null, token: null, rol: null, isAuthenticated: false });
      },
    }),
    {
      name: 'solcred-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        usuario: state.usuario,
        token: state.token,
        rol: state.rol,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        // El localStorage sobrevive a un refresh, pero las cookies (leídas
        // por el middleware del servidor) no se restauran solas. Sin esto,
        // cliente y servidor quedan desincronizados y el middleware manda
        // a /login aunque el usuario siga "logueado" en el store.
        if (state.token && state.rol) {
          setCookie('sc_token', state.token);
          setCookie('sc_role', state.rol);
        } else {
          deleteCookie('sc_token');
          deleteCookie('sc_role');
        }

        state.isLoading = false;
      },
    },
  ),
);