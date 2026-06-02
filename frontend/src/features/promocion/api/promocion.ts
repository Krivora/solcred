import { apiAuth } from '@/shared/lib/client'
import type {
  CrearSolicitudDto,
  DatosGenerales,
  DatosPersona,
  Solicitud,
  SolicitudesPromocionResponse,
  StatsPromocion,
  FiltrosPromocion,
} from '@/shared/lib/types/solicitudes.types'

export const solicitudesApi = {
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