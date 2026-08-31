import { apiAuth } from '@/shared/api/client'
import type { RespuestaPaginada } from '@/shared/types/api'
import type {
  SolicitudFinanciamiento,
  SolicitudFinanciamientoDetalle,
  FiltrosFinanciamiento,
  FiltrosAsignacionFinanciamiento,
  FinanciamientoStats,
  AnalistaConCarga,
  ResultadoAsignacion,
} from '@/features/financiamiento/types/financiamiento.types'

const BASE = '/admin/financiamiento'

function qs(filtros: Record<string, unknown> = {}): string {
  const params = new URLSearchParams()
  Object.entries(filtros).forEach(([k, v]) => {
    if (v !== undefined && v !== '') params.set(k, String(v))
  })
  const s = params.toString()
  return s ? `?${s}` : ''
}

type Listado = RespuestaPaginada<SolicitudFinanciamiento>

export interface AccionConMotivoDto {
  motivo: string
}
export interface AccionOpcionalDto {
  motivo?: string
}

export const financiamientoApi = {
  // ── Listados ───────────────────────────────────────────────────────────────
  listarMesaControl: (f?: Partial<FiltrosFinanciamiento>) =>
    apiAuth<Listado>(`${BASE}/mesa-control${qs(f)}`),
  listarParaAsignacion: (f?: Partial<FiltrosAsignacionFinanciamiento>) =>
    apiAuth<Listado>(`${BASE}/asignacion${qs(f)}`),
  listarMisCasos: (f?: Partial<FiltrosFinanciamiento>) =>
    apiAuth<Listado>(`${BASE}/mis-casos${qs(f)}`),
  listarValidacion: (f?: Partial<FiltrosFinanciamiento>) =>
    apiAuth<Listado>(`${BASE}/validacion${qs(f)}`),
  listarComite: (f?: Partial<FiltrosFinanciamiento>) =>
    apiAuth<Listado>(`${BASE}/comite${qs(f)}`),

  stats: () => apiAuth<FinanciamientoStats>(`${BASE}/stats`),
  analistas: () => apiAuth<AnalistaConCarga[]>(`${BASE}/analistas`),
  obtener: (id: string) => apiAuth<SolicitudFinanciamientoDetalle>(`${BASE}/${id}`),

  // ── Transiciones ───────────────────────────────────────────────────────────
  regresarAAprobacion: (id: string, dto: AccionConMotivoDto) =>
    apiAuth(`${BASE}/${id}/regresar-aprobacion`, { method: 'PATCH', body: dto }),
  pasarAAsignacion: (id: string, dto: AccionOpcionalDto = {}) =>
    apiAuth(`${BASE}/${id}/pasar-asignacion`, { method: 'PATCH', body: dto }),
  asignarAnalistas: (solicitudIds: string[], analistaId: string, motivo?: string) =>
    apiAuth<ResultadoAsignacion[]>(`${BASE}/asignar`, {
      method: 'POST',
      body: { solicitudIds, analistaId, motivo },
    }),
  enviarAValidacion: (id: string, dto: AccionOpcionalDto = {}) =>
    apiAuth(`${BASE}/${id}/enviar-validacion`, { method: 'PATCH', body: dto }),
  regresarAAnalista: (id: string, dto: AccionConMotivoDto) =>
    apiAuth(`${BASE}/${id}/regresar-analista`, { method: 'PATCH', body: dto }),
  enviarAComite: (id: string, dto: AccionOpcionalDto = {}) =>
    apiAuth(`${BASE}/${id}/enviar-comite`, { method: 'PATCH', body: dto }),
  regresarAValidacion: (id: string, dto: AccionConMotivoDto) =>
    apiAuth(`${BASE}/${id}/regresar-validacion`, { method: 'PATCH', body: dto }),
  aprobar: (id: string, dto: AccionOpcionalDto = {}) =>
    apiAuth(`${BASE}/${id}/aprobar`, { method: 'PATCH', body: dto }),

  // ── Cancelar / rechazar (endpoints de promoción, extendidos a financiamiento) ─
  cancelar: (id: string, dto: AccionConMotivoDto) =>
    apiAuth(`/admin/promocion/${id}/cancelar`, { method: 'PATCH', body: dto }),
  rechazar: (id: string, dto: AccionConMotivoDto) =>
    apiAuth(`/admin/promocion/${id}/rechazar`, { method: 'PATCH', body: dto }),
}
