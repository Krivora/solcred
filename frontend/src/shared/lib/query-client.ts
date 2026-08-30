import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,        // 30s antes de considerar los datos "viejos"
      gcTime: 5 * 60_000,       // 5min en cache antes de eliminarse si nadie los usa
      refetchOnWindowFocus: false, // evita refetch molesto al cambiar de pestaña del navegador
      retry: 1,
    },
  },
})