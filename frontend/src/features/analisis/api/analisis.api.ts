import { apiAuth } from '@/shared/api/client'
import type { AnalisisResponse, AnalisisTab } from '@/features/analisis/types/analisis.types'
import type { InformeEjecutivoPayload } from '@/features/analisis/lib/informe-ejecutivo'

const BASE = '/admin/analisis'

export const analisisApi = {
  obtener: (solicitudId: string) => apiAuth<AnalisisResponse>(`${BASE}/${solicitudId}`),

  guardarTab: (solicitudId: string, tab: AnalisisTab, data: unknown) =>
    apiAuth(`${BASE}/${solicitudId}`, { method: 'PATCH', body: { tab, data } }),

  /** Devuelve el PDF del informe ejecutivo (blob, para abrir en pestaña nueva). */
  generarInformeEjecutivo: (solicitudId: string, payload: InformeEjecutivoPayload) =>
    apiAuth<Blob>(`${BASE}/${solicitudId}/informe-ejecutivo`, { method: 'POST', body: payload }),
}
