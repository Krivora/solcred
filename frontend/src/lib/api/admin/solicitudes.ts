import { apiAuth } from '../client'
import type {
  CrearSolicitudDto,
  DatosGenerales,
  DatosPersona,
  Solicitud,
  SolicitudesPromocionResponse,
  StatsPromocion,
  FiltrosPromocion,
} from '../../types/solicitudes.types'

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
    `/admin/solicitudes/promocion${query ? `?${query}` : ''}`
  )
},

statsPromocion: () =>
  apiAuth<StatsPromocion>('/admin/solicitudes/promocion/stats'),
  listar: () =>
    apiAuth<Solicitud[]>('/admin/solicitudes'),

  obtener: (id: string) =>
    apiAuth<Solicitud>(`/admin/solicitudes/${id}`),

  crear: (dto: CrearSolicitudDto) =>
    apiAuth<Solicitud>('/admin/solicitudes', { method: 'POST', body: dto }),

  guardarGenerales: (id: string, dto: DatosGenerales) =>
    apiAuth<Solicitud>(`/admin/solicitudes/${id}/generales`, { method: 'PUT', body: dto }),

  guardarSolicitante: (id: string, dto: DatosPersona) =>
    apiAuth<DatosPersona>(`/admin/solicitudes/${id}/solicitante`, { method: 'PUT', body: dto }),

  guardarAval: (id: string, dto: DatosPersona) =>
    apiAuth<DatosPersona>(`/admin/solicitudes/${id}/aval`, { method: 'PUT', body: dto }),

  enviar: (id: string) =>
    apiAuth<Solicitud>(`/admin/solicitudes/${id}/enviar`, { method: 'PATCH' }),
}