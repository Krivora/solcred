import { useEffect, useState, useCallback } from 'react'
import { authApi } from '@/features/auth/api/auth.api'
import { useAuthStore } from '@/shared/stores/auth.store'
import type { Usuario } from '@/shared/types/auth.types'

interface UsePerfilUsuarioReturn {
  usuario: Usuario | null
  isLoading: boolean
  error: string | null
}

export function usePerfilUsuario(enabled: boolean): UsePerfilUsuarioReturn {
  const token = useAuthStore((s) => s.token)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPerfil = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    setError(null)
    try {
      const usuario = await authApi.perfil(token) // ya no se destructura
      setUsuario(usuario)
    } catch (err) {
      console.error('Error al obtener perfil:', err)
      setError('No se pudo cargar tu información de perfil.')
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    // No dispara nada hasta que 'enabled' sea true (llegamos al step correcto),
    // y evita refetch si ya se cargó una vez.
    if (enabled && !usuario) {
      fetchPerfil()
    }
  }, [enabled, usuario, fetchPerfil])

  return { usuario, isLoading, error }
}