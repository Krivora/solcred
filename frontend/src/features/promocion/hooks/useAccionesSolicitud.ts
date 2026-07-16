import { useState } from 'react'
import { solicitudesApi, type AccionConMotivoDto, type AccionOpcionalDto } from '../api/promocion'
import { solicitudToast } from '@/shared/lib/utils/toaster'

interface UseAccionesSolicitudOptions {
  onSuccess?: () => void
}

export const useAccionesSolicitud = (options: UseAccionesSolicitudOptions = {}) => {
  const { onSuccess } = options
  const [loading, setLoading] = useState(false)

  const ejecutar = async (
    accion: () => Promise<unknown>,
    onExito: () => void,
    onError: (message?: string) => void
  ) => {
    try {
      setLoading(true)
      await accion()
      onExito()
      onSuccess?.()
    } catch (error: any) {
      onError(error?.message)
    } finally {
      setLoading(false)
    }
  }

  const devolverAlSolicitante = (id: string, dto: AccionConMotivoDto) =>
    ejecutar(
      () => solicitudesApi.devolverAlSolicitante(id, dto),
      solicitudToast.devuelta,
      solicitudToast.devolverError
    )

  const regresarAlPromotor = (id: string, dto: AccionConMotivoDto) =>
    ejecutar(
      () => solicitudesApi.regresarAlPromotor(id, dto),
      solicitudToast.regresada,
      solicitudToast.regresarError
    )

  const enviarAAprobacion = (id: string, dto: AccionOpcionalDto = {}) =>
    ejecutar(
      () => solicitudesApi.enviarAAprobacion(id, dto),
      solicitudToast.enviadaAAprobacion,
      solicitudToast.enviarAAprobacionError
    )

  const enviarAFinanciamiento = (id: string, dto: AccionOpcionalDto = {}) =>
    ejecutar(
      () => solicitudesApi.enviarAFinanciamiento(id, dto),
      solicitudToast.enviadaAFinanciamiento,
      solicitudToast.enviarAFinanciamientoError
    )

  const cancelar = (id: string, dto: AccionConMotivoDto) =>
    ejecutar(
      () => solicitudesApi.cancelar(id, dto),
      solicitudToast.cancelada,
      solicitudToast.cancelarError
    )

  const rechazar = (id: string, dto: AccionConMotivoDto) =>
    ejecutar(
      () => solicitudesApi.rechazar(id, dto),
      solicitudToast.rechazada,
      solicitudToast.rechazarError
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