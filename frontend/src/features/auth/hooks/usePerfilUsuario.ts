'use client'

import { useQuery } from '@tanstack/react-query'
import { authApi } from '@/features/auth/api/auth.api'
import { useAuthStore } from '@/shared/stores/auth.store'
import type { Usuario } from '@/shared/types/auth.types'

interface UsePerfilUsuarioReturn {
  usuario: Usuario | null
  isLoading: boolean
  error: string | null
}

/**
 * Perfil del usuario autenticado. `enabled` retrasa la petición hasta que
 * el consumidor la necesita (p. ej. al llegar al step que precarga datos).
 */
export function usePerfilUsuario(enabled: boolean): UsePerfilUsuarioReturn {
  const token = useAuthStore((s) => s.token)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['auth', 'perfil'],
    queryFn: () => authApi.perfil(),
    enabled: enabled && !!token,
    staleTime: Infinity, // el perfil no cambia dentro de una sesión
  })

  return {
    usuario: data ?? null,
    isLoading,
    error: isError ? 'No se pudo cargar tu información de perfil.' : null,
  }
}
