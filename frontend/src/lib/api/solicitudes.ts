import { apiAuth } from './client'
import type {
  CrearSolicitudDto,
  DatosGenerales,
  DatosPersona,
  Solicitud,
} from '../types/solicitudes.types'

export const solicitudesApi = {
  listar: () =>
    apiAuth<Solicitud[]>('/solicitudes'),

  obtener: (id: string) =>
    apiAuth<Solicitud>(`/solicitudes/${id}`),

  crear: (dto: CrearSolicitudDto) =>
    apiAuth<Solicitud>('/solicitudes', { method: 'POST', body: dto }),

  guardarGenerales: (id: string, dto: DatosGenerales) =>
    apiAuth<Solicitud>(`/solicitudes/${id}/generales`, { method: 'PUT', body: dto }),

  guardarSolicitante: (id: string, dto: DatosPersona) =>
    apiAuth<DatosPersona>(`/solicitudes/${id}/solicitante`, { method: 'PUT', body: dto }),

  guardarAval: (id: string, dto: DatosPersona) =>
    apiAuth<DatosPersona>(`/solicitudes/${id}/aval`, { method: 'PUT', body: dto }),

  enviar: (id: string) =>
    apiAuth<Solicitud>(`/solicitudes/${id}/enviar`, { method: 'PATCH' }),
}