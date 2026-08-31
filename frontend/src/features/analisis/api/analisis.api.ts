import { apiAuth } from '@/shared/api/client'
import type { AnalisisResponse, AnalisisTab } from '@/features/analisis/types/analisis.types'

const BASE = '/admin/analisis'

export const analisisApi = {
  obtener: (solicitudId: string) => apiAuth<AnalisisResponse>(`${BASE}/${solicitudId}`),

  guardarTab: (solicitudId: string, tab: AnalisisTab, data: unknown) =>
    apiAuth(`${BASE}/${solicitudId}`, { method: 'PATCH', body: { tab, data } }),
}
