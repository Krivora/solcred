import { apiAuth } from '@/shared/lib/client'
import type {
  Solicitud,
  SolicitudesPromocionResponse,
  StatsPromocion,
  FiltrosPromocion,
  FiltrosMisCasos,
  FiltrosAprobacion,
} from '@/shared/lib/types/solicitudes.types'

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export interface AccionConMotivoDto {
  motivo: string
}

export interface AccionOpcionalDto {
  motivo?: string
}

export const solicitudesApi = {
  listar: () =>
    apiAuth<Solicitud[]>('/admin/promocion/solicitudes'),

  obtener: (id: string) =>
    apiAuth<Solicitud>(`/admin/solicitudes/${id}`),

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
    apiAuth<Solicitud>(`/admin/promocion/${id}/devolver`, {
      method: 'PATCH',
      body: dto,  // ← sin JSON.stringify
    }),

  regresarAlPromotor: (id: string, dto: AccionConMotivoDto) =>
    apiAuth<Solicitud>(`/admin/promocion/${id}/promotor`, {
      method: 'PATCH',
      body: dto,
    }),

  enviarAAprobacion: (id: string, dto: AccionOpcionalDto = {}) =>
    apiAuth<Solicitud>(`/admin/promocion/${id}/aprobacion`, {
      method: 'PATCH',
      body: dto,
    }),

  enviarAFinanciamiento: (id: string, dto: AccionOpcionalDto = {}) =>
    apiAuth<Solicitud>(`/admin/promocion/${id}/financiamiento`, {
      method: 'PATCH',
      body: dto,
    }),

  cancelar: (id: string, dto: AccionConMotivoDto) =>
    apiAuth<Solicitud>(`/admin/promocion/${id}/cancelar`, {
      method: 'PATCH',
      body: dto,
    }),

  rechazar: (id: string, dto: AccionConMotivoDto) =>
    apiAuth<Solicitud>(`/admin/promocion/${id}/rechazar`, {
      method: 'PATCH',
      body: dto,
    }),
}