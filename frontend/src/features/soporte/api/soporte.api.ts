import { apiAuth } from '@/shared/api/client'
import type {
  AgenteSoporte,
  CrearTicketInput,
  FiltrosMisTickets,
  FiltrosTickets,
  ListadoTickets,
  SlaPolitica,
  StatsSoporte,
  TicketDetalle,
  TicketCategoria,
  TicketPrioridad,
} from '@/features/soporte/types/soporte.types'

const BASE = '/soporte'

const qs = (obj: Record<string, unknown>): string => {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null && v !== '') p.set(k, String(v))
  }
  const s = p.toString()
  return s ? `?${s}` : ''
}

const formData = (campos: Record<string, string | undefined>, archivos: File[]): FormData => {
  const fd = new FormData()
  for (const [k, v] of Object.entries(campos)) if (v) fd.append(k, v)
  for (const f of archivos) fd.append('adjuntos', f)
  return fd
}

export const soporteApi = {
  // ── solicitante ──────────────────────────────────────────
  crear: (input: CrearTicketInput) =>
    apiAuth<TicketDetalle>(`${BASE}/tickets`, {
      method: 'POST',
      body: formData(
        {
          titulo: input.titulo,
          descripcion: input.descripcion,
          categoria: input.categoria,
          prioridadSugerida: input.prioridadSugerida,
        },
        input.adjuntos,
      ),
    }),

  misTickets: (f: FiltrosMisTickets) =>
    apiAuth<ListadoTickets>(
      `${BASE}/tickets/mios${qs({ page: f.page, estatus: f.estatus, categoria: f.categoria, q: f.q })}`,
    ),

  detalle: (id: string) => apiAuth<TicketDetalle>(`${BASE}/tickets/${id}`),

  comentar: (id: string, cuerpo: string, esNotaInterna: boolean, archivos: File[]) =>
    apiAuth<unknown>(`${BASE}/tickets/${id}/comentarios`, {
      method: 'POST',
      body: formData(
        { cuerpo, esNotaInterna: esNotaInterna ? 'true' : undefined },
        archivos,
      ),
    }),

  urlAdjunto: (ticketId: string, adjuntoId: string) =>
    `${BASE}/tickets/${ticketId}/adjuntos/${adjuntoId}`,

  descargarAdjunto: (ticketId: string, adjuntoId: string) =>
    apiAuth<Blob>(`${BASE}/tickets/${ticketId}/adjuntos/${adjuntoId}`),

  cerrar: (id: string) =>
    apiAuth<TicketDetalle>(`${BASE}/tickets/${id}/cerrar`, { method: 'PATCH' }),

  reabrir: (id: string, motivo: string) =>
    apiAuth<TicketDetalle>(`${BASE}/tickets/${id}/reabrir`, {
      method: 'PATCH',
      body: { motivo },
    }),

  calificar: (id: string, calificacion: number, comentario?: string) =>
    apiAuth<TicketDetalle>(`${BASE}/tickets/${id}/calificar`, {
      method: 'POST',
      body: { calificacion, comentario },
    }),

  // ── staff ────────────────────────────────────────────────
  todos: (f: FiltrosTickets) =>
    apiAuth<ListadoTickets>(
      `${BASE}/tickets${qs({
        page: f.page,
        estatus: f.estatus,
        prioridad: f.prioridad,
        categoria: f.categoria,
        agenteId: f.agenteId,
        sinAsignar: f.sinAsignar ? 'true' : undefined,
        sla: f.sla,
        q: f.q,
      })}`,
    ),

  stats: () => apiAuth<StatsSoporte>(`${BASE}/tickets/stats`),
  agentes: () => apiAuth<AgenteSoporte[]>(`${BASE}/agentes`),

  asignar: (id: string, agenteId: string, prioridad?: TicketPrioridad) =>
    apiAuth<TicketDetalle>(`${BASE}/tickets/${id}/asignar`, {
      method: 'PATCH',
      body: { agenteId, prioridad },
    }),

  cambiarPrioridad: (id: string, prioridad: TicketPrioridad) =>
    apiAuth<TicketDetalle>(`${BASE}/tickets/${id}/prioridad`, {
      method: 'PATCH',
      body: { prioridad },
    }),

  cambiarCategoria: (id: string, categoria: TicketCategoria) =>
    apiAuth<TicketDetalle>(`${BASE}/tickets/${id}/categoria`, {
      method: 'PATCH',
      body: { categoria },
    }),

  cambiarEstatus: (id: string, estatus: string, motivo?: string) =>
    apiAuth<TicketDetalle>(`${BASE}/tickets/${id}/estatus`, {
      method: 'PATCH',
      body: { estatus, motivo },
    }),

  cancelar: (id: string, motivo: string) =>
    apiAuth<TicketDetalle>(`${BASE}/tickets/${id}/cancelar`, {
      method: 'PATCH',
      body: { motivo },
    }),

  slaPoliticas: () => apiAuth<SlaPolitica[]>(`${BASE}/sla-politicas`),
}
