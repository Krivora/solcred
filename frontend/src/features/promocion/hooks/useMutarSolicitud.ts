'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { solicitudesApi } from '@/features/promocion/api/promocion.api'
import { promocionKeys } from '@/features/promocion/lib/promocion.keys'

// Ejemplo: mutación de asignación (ajusta a tu endpoint real)
export function useAsignarSolicitud() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: { solicitudId: string; gestorId: string }) =>
      solicitudesApi.asignar(params.solicitudId, params.gestorId),

    onSuccess: (_, variables) => {
      // Invalida el detalle de ESA solicitud específica
      queryClient.invalidateQueries({ queryKey: promocionKeys.detalle(variables.solicitudId) })
      // Invalida todos los listados (sin importar filtros), porque el gestor
      // asignado puede afectar cualquier vista que muestre esa solicitud
      queryClient.invalidateQueries({ queryKey: promocionKeys.listados() })
    },
  })
}