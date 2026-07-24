'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Usuario, RolAplicacion } from '../types/auth.types';
import { obtenerRolEfectivo } from '../types/auth.types';
import { setCookie, deleteCookie } from '../utils/cookies';

// ── FIX: rol ya no es campo plano de Usuario, ahora viene de "personal" ────
type UsuarioBasico = Pick <Usuario, 'id' | 'correo' | 'nombre' | 'apellidoPaterno' | 'tipoUsuario' | 'personal'>;

interface AuthStore {
  usuario: UsuarioBasico | null;
  token: string | null;
  rol: RolAplicacion | null; // ── NUEVO: rol efectivo, calculado una sola vez ──
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
        const rolEfectivo = obtenerRolEfectivo(usuario); // ── FIX ──

        // Cookies para que el middleware (server) pueda validar sesión y rol
        setCookie('sc_token', token);
        setCookie('sc_role', rolEfectivo); // ── FIX ──
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
        if (state) state.isLoading = false;
      },
    },
  ),
);