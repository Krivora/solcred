import type {
  TicketEstatus,
  TicketPrioridad,
  TicketCategoria,
  TicketTipoEvento,
  TicketAutorTipo,
} from '@/shared/types/domain.enums'
import type { RespuestaPaginada } from '@/shared/types/api'

export type {
  TicketEstatus,
  TicketPrioridad,
  TicketCategoria,
  TicketTipoEvento,
  TicketAutorTipo,
}

export type EstadoSla = 'sin_iniciar' | 'cumplido' | 'en_curso' | 'en_riesgo' | 'vencido'

export interface SlaDerivado {
  respuesta: EstadoSla
  resolucion: EstadoSla
  alerta: boolean
}

export interface PersonaMini {
  id: string
  nombre: string
  apellidoPaterno: string
}

export interface AdjuntoResumen {
  id: string
  nombreOriginal: string
  tipoMime: string
  tamanoBytes: number
  subidoEn?: string
}

export interface ComentarioTicket {
  id: string
  cuerpo: string
  esNotaInterna: boolean
  autorTipo: TicketAutorTipo
  creadoEn: string
  editadoEn: string | null
  autor: PersonaMini
  adjuntos: AdjuntoResumen[]
}

export interface EventoTicket {
  id: string
  tipo: TicketTipoEvento
  descripcion: string
  valorAnterior: string | null
  valorNuevo: string | null
  creadoEn: string
  actor: PersonaMini | null
}

/** Fila de listado (mis tickets / todos). */
export interface TicketFila {
  id: string
  folio: string
  titulo: string
  categoria: TicketCategoria
  prioridad: TicketPrioridad
  estatus: TicketEstatus
  reabierto: boolean
  creadoEn: string
  actualizadoEn: string
  resueltoEn: string | null
  slaResolucionLimite: string | null
  agente: { usuario: { nombre: string; apellidoPaterno: string } } | null
  agenteId?: string | null
  solicitante?: PersonaMini
  sla: SlaDerivado
  _count: { comentarios: number; adjuntos: number }
}

export interface TicketDetalle {
  id: string
  folio: string
  titulo: string
  descripcion: string
  categoria: TicketCategoria
  prioridad: TicketPrioridad
  estatus: TicketEstatus
  reabierto: boolean
  slaArrancadoEn: string | null
  slaRespuestaLimite: string | null
  slaResolucionLimite: string | null
  primeraRespuestaEn: string | null
  slaRespuestaCumplida: boolean | null
  slaResolucionCumplida: boolean | null
  pausadoSegundos: number
  pausadoDesde: string | null
  resueltoEn: string | null
  cerradoEn: string | null
  calificacion: number | null
  calificacionComentario: string | null
  creadoEn: string
  actualizadoEn: string
  esSolicitante: boolean
  sla: SlaDerivado
  solicitante: PersonaMini & { apellidoMaterno: string; correo: string }
  agente: { id: string; usuario: { nombre: string; apellidoPaterno: string } } | null
  comentarios: ComentarioTicket[]
  adjuntos: AdjuntoResumen[]
  eventos: EventoTicket[]
}

export interface AgenteSoporte {
  id: string
  nombre: string
  correo: string
  ticketsAbiertos: number
}

export interface SlaPolitica {
  id: string
  prioridad: TicketPrioridad
  respuestaMinutos: number
  resolucionMinutos: number
  activa: boolean
}

export interface StatsSoporte {
  porEstatus: Partial<Record<TicketEstatus, number>>
  porPrioridad: Partial<Record<TicketPrioridad, number>>
  sinAsignar: number
  abiertos: number
  slaEnRiesgo: number
  slaVencido: number
}

export interface FiltrosMisTickets {
  page?: number
  estatus?: TicketEstatus
  categoria?: TicketCategoria
  q?: string
}

export interface FiltrosTickets extends FiltrosMisTickets {
  prioridad?: TicketPrioridad
  agenteId?: string
  sinAsignar?: boolean
  sla?: 'ok' | 'en_riesgo' | 'vencido'
}

export type ListadoTickets = RespuestaPaginada<TicketFila>

export interface CrearTicketInput {
  titulo: string
  descripcion: string
  categoria: TicketCategoria
  prioridadSugerida?: 'BAJA' | 'MEDIA' | 'ALTA'
  adjuntos: File[]
}
