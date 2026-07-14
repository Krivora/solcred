import { apiAuth } from '@/shared/lib/client'
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
} from '@/shared/lib/types/solicitudes.types'

export const solicitudesApi = {
  listar: () => apiAuth<Solicitud[]>('/clientes/solicitudes'),
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
  guardarCredito: (id: string, dto: DatosCredito) =>
    apiAuth<DatosCredito>(
      `/clientes/solicitudes/${id}/credito`,
      {
        method: 'PUT',
        body: dto,
      }
    ),
  guardarGarantia: (id: string, dto: DatosGarantia) =>
    apiAuth<DatosGarantia>(
      `/clientes/solicitudes/${id}/garantia`,
      {
        method: 'PUT',
        body: dto,
      }
    ),
  guardarNegocio: (id: string, dto: DatosNegocio) =>
    apiAuth<DatosNegocio>(
      `/clientes/solicitudes/${id}/negocio`,
      {
        method: 'PUT',
        body: dto,
      }
    ),
  guardarMercado: (id: string, dto: DatosMercado) =>
    apiAuth<DatosMercado>(
      `/clientes/solicitudes/${id}/mercado`,
      {
        method: 'PUT',
        body: dto,
      }
    ),
  guardarBancarios: (id: string, dto: DatosBancarios) =>
    apiAuth<DatosBancarios>(
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
    descargarPDF: (id: string) =>
    apiAuth<Blob>(`/clientes/solicitudes/${id}/pdf`),
}