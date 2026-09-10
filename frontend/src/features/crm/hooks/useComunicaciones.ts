'use client'

import { useQuery } from '@tanstack/react-query'
import { crmApi } from '@/features/crm/api/crm.api'
import { crmKeys } from '@/features/crm/lib/crm.keys'
import type { FiltrosHistorial } from '@/features/crm/types/crm.types'

/** Historial de comunicaciones de una solicitud o de un cliente. */
export function useHistorialComunicaciones(filtros: FiltrosHistorial, enabled = true) {
  return useQuery({
    queryKey: crmKeys.historial(filtros),
    queryFn: () => crmApi.historial(filtros),
    enabled: enabled && (!!filtros.solicitudId || !!filtros.clienteId),
    placeholderData: (prev) => prev,
  })
}

/** Resumen (total, última, seguimiento reciente) de una solicitud. */
export function useResumenComunicaciones(solicitudId: string, enabled = true) {
  return useQuery({
    queryKey: crmKeys.resumen(solicitudId),
    queryFn: () => crmApi.resumen(solicitudId),
    enabled: enabled && !!solicitudId,
  })
}
