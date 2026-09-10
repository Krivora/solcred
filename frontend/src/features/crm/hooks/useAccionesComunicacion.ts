'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { crmApi } from '@/features/crm/api/crm.api'
import { crmKeys } from '@/features/crm/lib/crm.keys'
import { ApiError } from '@/shared/api/client'
import type {
  EditarComunicacionInput,
  RegistrarComunicacionInput,
} from '@/features/crm/types/crm.types'

const msgError = (e: unknown, fallback: string): string =>
  e instanceof ApiError ? e.message : e instanceof Error ? e.message : fallback

/** Registrar + editar comunicaciones. Invalida todo el árbol `crm`. */
export function useAccionesComunicacion(solicitudId?: string) {
  const qc = useQueryClient()

  const invalidar = () => {
    qc.invalidateQueries({ queryKey: crmKeys.all })
    if (solicitudId) qc.invalidateQueries({ queryKey: crmKeys.resumen(solicitudId) })
  }

  const registrar = useMutation({
    mutationFn: (input: RegistrarComunicacionInput) => crmApi.registrar(input),
    onSuccess: () => {
      invalidar()
      toast.success('Comunicación registrada')
    },
    onError: (e) =>
      toast.error('No se pudo registrar la comunicación', {
        description: msgError(e, 'Intenta de nuevo'),
      }),
  })

  const editar = useMutation({
    mutationFn: (v: { id: string; input: EditarComunicacionInput }) =>
      crmApi.editar(v.id, v.input),
    onSuccess: () => {
      invalidar()
      toast.success('Comunicación actualizada')
    },
    onError: (e) =>
      toast.error('No se pudo actualizar', { description: msgError(e, 'Intenta de nuevo') }),
  })

  return { registrar, editar }
}
