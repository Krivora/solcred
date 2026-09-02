'use client'

import { useQuery } from '@tanstack/react-query'
import { soporteApi } from '@/features/soporte/api/soporte.api'
import { soporteKeys } from '@/features/soporte/lib/soporte.keys'
import type {
  FiltrosMisTickets,
  FiltrosTickets,
} from '@/features/soporte/types/soporte.types'

export function useMisTickets(filtros: FiltrosMisTickets) {
  return useQuery({
    queryKey: soporteKeys.misTickets(filtros),
    queryFn: () => soporteApi.misTickets(filtros),
    placeholderData: (prev) => prev,
  })
}

export function useTicketsListado(filtros: FiltrosTickets) {
  return useQuery({
    queryKey: soporteKeys.tickets(filtros),
    queryFn: () => soporteApi.todos(filtros),
    placeholderData: (prev) => prev,
  })
}

export function useTicketDetalle(id: string) {
  return useQuery({
    queryKey: soporteKeys.detalle(id),
    queryFn: () => soporteApi.detalle(id),
    // El detalle trae relojes de SLA que corren: refresco suave cada minuto.
    refetchInterval: 60_000,
  })
}

export function useSoporteStats(enabled = true) {
  return useQuery({
    queryKey: soporteKeys.stats(),
    queryFn: () => soporteApi.stats(),
    enabled,
    staleTime: 30_000,
  })
}

export function useAgentesSoporte(enabled = true) {
  return useQuery({
    queryKey: soporteKeys.agentes(),
    queryFn: () => soporteApi.agentes(),
    enabled,
  })
}
