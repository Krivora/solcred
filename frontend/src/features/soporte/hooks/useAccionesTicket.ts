'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { soporteApi } from '@/features/soporte/api/soporte.api'
import { soporteKeys } from '@/features/soporte/lib/soporte.keys'
import { ApiError } from '@/shared/api/client'
import type {
  TicketCategoria,
  TicketEstatus,
  TicketPrioridad,
} from '@/features/soporte/types/soporte.types'

const msgError = (e: unknown, fallback: string): string =>
  e instanceof ApiError ? e.message : e instanceof Error ? e.message : fallback

export function useCrearTicket(onCreado: (id: string) => void) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: soporteApi.crear,
    onSuccess: (ticket) => {
      qc.invalidateQueries({ queryKey: soporteKeys.all })
      toast.success('Ticket creado', { description: `Folio ${ticket.folio}` })
      onCreado(ticket.id)
    },
    onError: (e) =>
      toast.error('No se pudo crear el ticket', { description: msgError(e, 'Intenta de nuevo') }),
  })
}

/** Todas las acciones sobre un ticket abierto. Cada una invalida detalle + listados. */
export function useAccionesTicket(ticketId: string) {
  const qc = useQueryClient()

  const onSuccess = (okMsg?: string) => () => {
    qc.invalidateQueries({ queryKey: soporteKeys.detalle(ticketId) })
    qc.invalidateQueries({ queryKey: soporteKeys.all })
    if (okMsg) toast.success(okMsg)
  }
  const onError = (errMsg: string) => (e: unknown) =>
    toast.error(errMsg, { description: msgError(e, 'Intenta de nuevo') })

  const comentar = useMutation({
    mutationFn: (v: { cuerpo: string; esNotaInterna: boolean; archivos: File[] }) =>
      soporteApi.comentar(ticketId, v.cuerpo, v.esNotaInterna, v.archivos),
    onSuccess: onSuccess(),
    onError: onError('No se pudo enviar el mensaje'),
  })

  const cerrar = useMutation({
    mutationFn: () => soporteApi.cerrar(ticketId),
    onSuccess: onSuccess('Ticket cerrado'),
    onError: onError('No se pudo cerrar'),
  })

  const reabrir = useMutation({
    mutationFn: (motivo: string) => soporteApi.reabrir(ticketId, motivo),
    onSuccess: onSuccess('Ticket reabierto'),
    onError: onError('No se pudo reabrir'),
  })

  const calificar = useMutation({
    mutationFn: (v: { calificacion: number; comentario?: string }) =>
      soporteApi.calificar(ticketId, v.calificacion, v.comentario),
    onSuccess: onSuccess('Gracias por tu calificación'),
    onError: onError('No se pudo registrar la calificación'),
  })

  const asignar = useMutation({
    mutationFn: (v: { agenteId: string; prioridad?: TicketPrioridad }) =>
      soporteApi.asignar(ticketId, v.agenteId, v.prioridad),
    onSuccess: onSuccess('Ticket asignado'),
    onError: onError('No se pudo asignar'),
  })

  const prioridad = useMutation({
    mutationFn: (p: TicketPrioridad) => soporteApi.cambiarPrioridad(ticketId, p),
    onSuccess: onSuccess('Prioridad actualizada'),
    onError: onError('No se pudo cambiar la prioridad'),
  })

  const categoria = useMutation({
    mutationFn: (c: TicketCategoria) => soporteApi.cambiarCategoria(ticketId, c),
    onSuccess: onSuccess('Categoría actualizada'),
    onError: onError('No se pudo cambiar la categoría'),
  })

  const estatus = useMutation({
    mutationFn: (v: { estatus: string; motivo?: string }) =>
      soporteApi.cambiarEstatus(ticketId, v.estatus, v.motivo),
    onSuccess: onSuccess('Estatus actualizado'),
    onError: onError('No se pudo cambiar el estatus'),
  })

  const cancelar = useMutation({
    mutationFn: (motivo: string) => soporteApi.cancelar(ticketId, motivo),
    onSuccess: onSuccess('Ticket cancelado'),
    onError: onError('No se pudo cancelar'),
  })

  return { comentar, cerrar, reabrir, calificar, asignar, prioridad, categoria, estatus, cancelar }
}

/** Mueve un ticket a otro estatus sin conocer su id de antemano (tablero kanban). */
export function useMoverTicketEstatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v: { id: string; estatus: TicketEstatus }) =>
      soporteApi.cambiarEstatus(v.id, v.estatus),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: soporteKeys.all })
    },
    onError: (e) =>
      toast.error('No se pudo mover el ticket', { description: msgError(e, 'Intenta de nuevo') }),
  })
}

/** Asigna/reasigna un ticket sin conocer su id de antemano (tablero kanban). */
export function useAsignarTicketKanban() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v: { id: string; agenteId: string; prioridad?: TicketPrioridad }) =>
      soporteApi.asignar(v.id, v.agenteId, v.prioridad),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: soporteKeys.all })
      toast.success('Ticket asignado')
    },
    onError: (e) =>
      toast.error('No se pudo asignar', { description: msgError(e, 'Intenta de nuevo') }),
  })
}
