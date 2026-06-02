import { apiAuth } from '@/shared/lib/client'
import type {
  CrearSolicitudDto,
  DatosGenerales,
  DatosPersona,
  Solicitud,
} from '@/shared/lib/types/solicitudes.types'

export const solicitudesApi = {
  listar: () =>
    apiAuth<Solicitud[]>('/clientes/solicitudes'),

  obtener: (id: string) =>
    apiAuth<Solicitud>(`/clientes/solicitudes/${id}`),

  crear: (dto: CrearSolicitudDto) =>
    apiAuth<Solicitud>('/clientes/solicitudes', {
      method: 'POST',
      body: dto,
    }),

  guardarGenerales: (id: string, dto: DatosGenerales) =>
    apiAuth<Solicitud>(
      `/clientes/solicitudes/${id}/generales`,
      {
        method: 'PUT',
        body: dto,
      }
    ),

  guardarSolicitante: (id: string, dto: DatosPersona) =>
    apiAuth<DatosPersona>(
      `/clientes/solicitudes/${id}/solicitante`,
      {
        method: 'PUT',
        body: dto,
      }
    ),

  guardarAval: (id: string, dto: DatosPersona) =>
    apiAuth<DatosPersona>(
      `/clientes/solicitudes/${id}/aval`,
      {
        method: 'PUT',
        body: dto,
      }
    ),

  enviar: (id: string) =>
    apiAuth<Solicitud>(
      `/clientes/solicitudes/${id}/enviar`,
      {
        method: 'PATCH',
      }
    ),
}