import { apiAuth } from '@/shared/api/client'
import type {
  CrearSolicitudDto,
  DatosBancarios,
  DatosCredito,
  DatosGarantia,
  DatosGenerales,
  DatosMercado,
  DatosNegocio,
  DatosPersona,
  Solicitud,
  SolicitudesPaginadas,
} from '@/features/solicitudes/types/solicitud.types'

export const solicitudesApi = {
  listar: (signal?: AbortSignal) =>apiAuth<SolicitudesPaginadas>('/clientes/solicitudes', { signal }),
  obtener: (id: string) => apiAuth<Solicitud>(`/clientes/solicitudes/${id}`),
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
    apiAuth<DatosPersona & { id: string }>(
      `/clientes/solicitudes/${id}/solicitante`,
      {
        method: 'PUT',
        body: dto,
      }
    ),
  guardarAval: (id: string, dto: DatosPersona) =>
    apiAuth<DatosPersona & { id: string }>(
      `/clientes/solicitudes/${id}/aval`,
      {
        method: 'PUT',
        body: dto,
      }
    ),
  guardarCredito: (id: string, dto: DatosCredito) =>
    apiAuth<DatosCredito & { id: string }>(
      `/clientes/solicitudes/${id}/credito`,
      {
        method: 'PUT',
        body: dto,
      }
    ),
  guardarGarantia: (id: string, dto: DatosGarantia) =>
    apiAuth<DatosGarantia & { id: string }>(
      `/clientes/solicitudes/${id}/garantia`,
      {
        method: 'PUT',
        body: dto,
      }
    ),
  guardarNegocio: (id: string, dto: DatosNegocio) =>
    apiAuth<DatosNegocio & { id: string }>(
      `/clientes/solicitudes/${id}/negocio`,
      {
        method: 'PUT',
        body: dto,
      }
    ),
  guardarMercado: (id: string, dto: DatosMercado) =>
    apiAuth<DatosMercado & { id: string }>(
      `/clientes/solicitudes/${id}/mercado`,
      {
        method: 'PUT',
        body: dto,
      }
    ),
  guardarBancarios: (id: string, dto: DatosBancarios) =>
    apiAuth<DatosBancarios & { id: string }>(
      `/clientes/solicitudes/${id}/bancarios`,
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
    descargarPDF: (id: string) => apiAuth<Blob>(`/clientes/solicitudes/${id}/pdf`),
}