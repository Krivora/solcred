import { apiAuth } from '@/shared/lib/client'
import type {
  Solicitud,
  SolicitudesPromocionResponse,
  StatsPromocion,
  FiltrosPromocion,
  FiltrosMisCasos,
} from '@/shared/lib/types/solicitudes.types'

export const solicitudesApi = {

  listarMisCasos: (filtros: Partial<FiltrosMisCasos> = {}) => {
    const params = new URLSearchParams()
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.set(key, String(value))
      }
    })
    const query = params.toString()
    return apiAuth<SolicitudesPromocionResponse>(
      `/admin/promocion/mis-casos${query ? `?${query}` : ''}`
    )
  },
  listarPromocion: (filtros: Partial<FiltrosPromocion> = {}) => {
  const params = new URLSearchParams()
  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value))
    }
  })
  const query = params.toString()
  return apiAuth<SolicitudesPromocionResponse>(
    `/admin/promocion/promocion${query ? `?${query}` : ''}`
  )
  
},

statsPromocion: () =>
  apiAuth<StatsPromocion>('/admin/promocion/promocion/stats'),
  listar: () =>
    apiAuth<Solicitud[]>('/admin/promocion/solicitudes'),

  obtener: (id: string) =>
    apiAuth<Solicitud>(`/admin/solicitudes/${id}`),
}