'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { financiamientoApi } from '@/features/financiamiento/api/financiamiento.api'

interface Options {
  onSuccess?: () => void
}

const errMsg = (e: unknown) => (e instanceof Error ? e.message : undefined)

export function useAccionesFinanciamiento({ onSuccess }: Options = {}) {
  const [loading, setLoading] = useState(false)

  const ejecutar = async (fn: () => Promise<unknown>, okMsg: string, failMsg: string) => {
    try {
      setLoading(true)
      await fn()
      toast.success(okMsg)
      onSuccess?.()
    } catch (e) {
      toast.error(failMsg, { description: errMsg(e) ?? 'Intenta nuevamente' })
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,

    // Mesa de Control
    regresarAAprobacion: (id: string, motivo: string) =>
      ejecutar(() => financiamientoApi.regresarAAprobacion(id, { motivo }),
        'Solicitud regresada al área de aprobación', 'Error al regresar la solicitud'),
    pasarAAsignacion: (id: string, motivo?: string) =>
      ejecutar(() => financiamientoApi.pasarAAsignacion(id, { motivo }),
        'Solicitud pasada a asignación', 'Error al pasar a asignación'),

    // (La asignación de analista vive en la pantalla de Asignación —
    //  useAsignacionAnalistas + AsignarAnalistaSheet, con soporte de lote.)

    // Analista
    enviarAValidacion: (id: string, motivo?: string) =>
      ejecutar(() => financiamientoApi.enviarAValidacion(id, { motivo }),
        'Análisis enviado a validación', 'Error al enviar a validación'),

    // Validación
    regresarAAnalista: (id: string, motivo: string) =>
      ejecutar(() => financiamientoApi.regresarAAnalista(id, { motivo }),
        'Solicitud regresada al analista', 'Error al regresar al analista'),
    enviarAComite: (id: string, motivo?: string) =>
      ejecutar(() => financiamientoApi.enviarAComite(id, { motivo }),
        'Solicitud enviada al comité', 'Error al enviar al comité'),

    // Comité
    regresarAValidacion: (id: string, motivo: string) =>
      ejecutar(() => financiamientoApi.regresarAValidacion(id, { motivo }),
        'Solicitud regresada a validación', 'Error al regresar a validación'),
    aprobar: (id: string, motivo?: string) =>
      ejecutar(() => financiamientoApi.aprobar(id, { motivo }),
        'Solicitud aprobada', 'Error al aprobar la solicitud'),

    // Terminales compartidas
    cancelar: (id: string, motivo: string) =>
      ejecutar(() => financiamientoApi.cancelar(id, { motivo }),
        'Solicitud cancelada', 'Error al cancelar la solicitud'),
    rechazar: (id: string, motivo: string) =>
      ejecutar(() => financiamientoApi.rechazar(id, { motivo }),
        'Solicitud rechazada', 'Error al rechazar la solicitud'),
  }
}
