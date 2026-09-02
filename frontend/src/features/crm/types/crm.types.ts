import type {
  ComunicacionTipo,
  ComunicacionMotivo,
  ComunicacionResultado,
} from '@/shared/types/domain.enums'
import type { RespuestaPaginada } from '@/shared/types/api'

export type { ComunicacionTipo, ComunicacionMotivo, ComunicacionResultado }

export interface PersonaMini {
  id: string
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
}

/** Una comunicación tal como la devuelve el API. Espejo de
 *  `backend/src/modules/crm/crm.contract.ts` (`ComunicacionResponse`). */
export interface Comunicacion {
  id: string
  solicitudId: string
  clienteId: string
  solicitud: { id: string; folio: string }
  fechaContacto: string
  tipo: ComunicacionTipo
  motivo: ComunicacionMotivo
  resultado: ComunicacionResultado
  observaciones: string | null
  creadoEn: string
  editadoEn: string | null
  registradoPor: PersonaMini
}

export type HistorialComunicaciones = RespuestaPaginada<Comunicacion>

export interface ResumenComunicaciones {
  total: number
  ultima: Comunicacion | null
  seguimientoReciente: boolean
}

// ─── Filtros / DTOs ───────────────────────────────────────────────────────────

export interface FiltrosHistorial {
  solicitudId?: string
  clienteId?: string
  page?: number
}

export interface RegistrarComunicacionInput {
  solicitudId: string
  tipo: ComunicacionTipo
  motivo: ComunicacionMotivo
  resultado: ComunicacionResultado
  observaciones?: string
  fechaContacto?: string
}

export interface EditarComunicacionInput {
  tipo?: ComunicacionTipo
  motivo?: ComunicacionMotivo
  resultado?: ComunicacionResultado
  observaciones?: string
  fechaContacto?: string
}
