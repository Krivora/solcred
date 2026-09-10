import { apiAuth } from '@/shared/api/client'
import type {
  Comunicacion,
  EditarComunicacionInput,
  FiltrosHistorial,
  HistorialComunicaciones,
  RegistrarComunicacionInput,
  ResumenComunicaciones,
} from '@/features/crm/types/crm.types'

const BASE = '/crm'

const qs = (obj: Record<string, unknown>): string => {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null && v !== '') p.set(k, String(v))
  }
  const s = p.toString()
  return s ? `?${s}` : ''
}

export const crmApi = {
  historial: (f: FiltrosHistorial) =>
    apiAuth<HistorialComunicaciones>(
      `${BASE}/comunicaciones${qs({
        solicitudId: f.solicitudId,
        clienteId: f.clienteId,
        page: f.page,
      })}`,
    ),

  resumen: (solicitudId: string) =>
    apiAuth<ResumenComunicaciones>(`${BASE}/solicitudes/${solicitudId}/resumen`),

  registrar: (input: RegistrarComunicacionInput) =>
    apiAuth<Comunicacion>(`${BASE}/comunicaciones`, {
      method: 'POST',
      body: input,
    }),

  editar: (id: string, input: EditarComunicacionInput) =>
    apiAuth<Comunicacion>(`${BASE}/comunicaciones/${id}`, {
      method: 'PATCH',
      body: input,
    }),
}
