import { useState } from 'react'
import { solicitudesApi, type AccionConMotivoDto, type AccionOpcionalDto } from '../api/promocion'
import { toast } from '@/shared/lib/utils/toast'

interface UseAccionesSolicitudOptions {
  onSuccess?: () => void
}

export const useAccionesSolicitud = (options: UseAccionesSolicitudOptions = {}) => {
  const { onSuccess } = options
  const [loading, setLoading] = useState(false)

  const ejecutar = async (accion: () => Promise<unknown>, mensajeExito: string) => {
    try {
      setLoading(true)
      await accion()
      toast.success(mensajeExito)
      onSuccess?.()
    } catch (error: any) {
      toast.error(error?.message ?? 'Ocurrió un error')
    } finally {
      setLoading(false)
    }
  }

  const devolverAlSolicitante = (id: string, dto: AccionConMotivoDto) =>
    ejecutar(
      () => solicitudesApi.devolverAlSolicitante(id, dto),
      'Solicitud devuelta al solicitante'
    )

  const regresarAlPromotor = (id: string, dto: AccionConMotivoDto) =>
    ejecutar(
      () => solicitudesApi.regresarAlPromotor(id, dto),
      'Solicitud regresada al promotor'
    )

  const enviarAAprobacion = (id: string, dto: AccionOpcionalDto = {}) =>
    ejecutar(
      () => solicitudesApi.enviarAAprobacion(id, dto),
      'Solicitud enviada a aprobación'
    )

  const enviarAFinanciamiento = (id: string, dto: AccionOpcionalDto = {}) =>
    ejecutar(
      () => solicitudesApi.enviarAFinanciamiento(id, dto),
      'Solicitud enviada a financiamiento'
    )

  const cancelar = (id: string, dto: AccionConMotivoDto) =>
    ejecutar(
      () => solicitudesApi.cancelar(id, dto),
      'Solicitud cancelada'
    )

  const rechazar = (id: string, dto: AccionConMotivoDto) =>
    ejecutar(
      () => solicitudesApi.rechazar(id, dto),
      'Solicitud rechazada'
    )

  return {
    loading,
    devolverAlSolicitante,
    regresarAlPromotor,
    enviarAAprobacion,
    enviarAFinanciamiento,
    cancelar,
    rechazar,
  }
}