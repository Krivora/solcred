import { apiAuth } from '@/shared/lib/client'
import type {
  SolicitudesPromocionResponse,
  StatsPromocion,
  FiltrosPromocion,
  FiltrosMisCasos,
  FiltrosAprobacion,
  SolicitudDetalle,
} from '@/features/promocion/types/solicitud.types'
import type { DocumentoTipo } from '@/shared/config/documentos.config'
const DOCUMENTO_ENDPOINT: Record<DocumentoTipo, string> = {
  solicitud: 'pdf',
  tarjeta_informativa: 'tarjeta-informativa',
  carta_rechazo: 'carta-rechazo',
  carta_financiamiento: 'carta-financiamiento',
}
// ─── DTOs ─────────────────────────────────────────────────────────────────────
export interface AccionConMotivoDto {
  motivo: string
}

export interface AccionOpcionalDto {
  motivo?: string
}

export const solicitudesApi = {
  listar: () =>
    apiAuth<SolicitudesPromocionResponse[]>('/admin/promocion/solicitudes'),

  obtener: (id: string) =>
    apiAuth<SolicitudDetalle>(`/admin/promocion/${id}`),

  listarPromocion: (filtros: Partial<FiltrosPromocion> = {}) => {
    const params = new URLSearchParams()
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params.set(key, String(value))
    })
    const query = params.toString()
    return apiAuth<SolicitudesPromocionResponse>(
      `/admin/promocion/promocion${query ? `?${query}` : ''}`
    )
  },

  statsPromocion: () =>
    apiAuth<StatsPromocion>('/admin/promocion/promocion/stats'),

  listarMisCasos: (filtros: Partial<FiltrosMisCasos> = {}) => {
    const params = new URLSearchParams()
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params.set(key, String(value))
    })
    const query = params.toString()
    return apiAuth<SolicitudesPromocionResponse>(
      `/admin/promocion/mis-casos${query ? `?${query}` : ''}`
    )
  },

  listarAprobacion: (filtros: Partial<FiltrosAprobacion> = {}) => {
    const params = new URLSearchParams()
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params.set(key, String(value))
    })
    const query = params.toString()
    return apiAuth<SolicitudesPromocionResponse>(
      `/admin/promocion/aprobacion${query ? `?${query}` : ''}`
    )
  },
  listarHistorico: (filtros: Partial<FiltrosAprobacion> = {}) => {
    const params = new URLSearchParams()
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params.set(key, String(value))
    })
    const query = params.toString()
    return apiAuth<SolicitudesPromocionResponse>(
      `/admin/promocion/historico${query ? `?${query}` : ''}`
    )
  },

  devolverAlSolicitante: (id: string, dto: AccionConMotivoDto) =>
    apiAuth<SolicitudesPromocionResponse>(`/admin/promocion/${id}/devolver`, {
      method: 'PATCH',
      body: dto,  // ← sin JSON.stringify
    }),

  regresarAlPromotor: (id: string, dto: AccionConMotivoDto) =>
    apiAuth<SolicitudesPromocionResponse>(`/admin/promocion/${id}/promotor`, {
      method: 'PATCH',
      body: dto,
    }),

  enviarAAprobacion: (id: string, dto: AccionOpcionalDto = {}) =>
    apiAuth<SolicitudesPromocionResponse>(`/admin/promocion/${id}/aprobacion`, {
      method: 'PATCH',
      body: dto,
    }),

  enviarAFinanciamiento: (id: string, dto: AccionOpcionalDto = {}) =>
    apiAuth<SolicitudesPromocionResponse>(`/admin/promocion/${id}/financiamiento`, {
      method: 'PATCH',
      body: dto,
    }),

  cancelar: (id: string, dto: AccionConMotivoDto) =>
    apiAuth<SolicitudesPromocionResponse>(`/admin/promocion/${id}/cancelar`, {
      method: 'PATCH',
      body: dto,
    }),

  rechazar: (id: string, dto: AccionConMotivoDto) =>
    apiAuth<SolicitudesPromocionResponse>(`/admin/promocion/${id}/rechazar`, {
      method: 'PATCH',
      body: dto,
    }),
  descargarDocumento: (id: string, tipo: DocumentoTipo) =>apiAuth<Blob>(`/admin/promocion/${id}/${DOCUMENTO_ENDPOINT[tipo]}`),
}