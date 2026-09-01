import type {
  EstatusSolicitud,
  Sector,
  TamanoEmpresa,
  TipoPersona,
} from '@/shared/types/domain.enums'

/** Espejo de `backend/src/modules/admin/reportes/reportes.schema.ts`. */
export interface FiltrosReporte {
  estatus: EstatusSolicitud[]
  sector: Sector[]
  tamanoEmpresa: TamanoEmpresa[]
  tipoPersona: TipoPersona[]
  programaId: string[]
  gestorId: string[]
  analistaId: string[]
  grupoId: string[]
  fechaDesde: string
  fechaHasta: string
  fechaResueltaDesde: string
  fechaResueltaHasta: string
  montoMin: string
  montoMax: string
  busqueda: string
}

export interface OpcionCatalogo {
  id: string
  nombre: string
}

export interface CatalogosReporte {
  programas: OpcionCatalogo[]
  gestores: OpcionCatalogo[]
  analistas: OpcionCatalogo[]
  grupos: OpcionCatalogo[]
}

export interface FilaReporte {
  folio: string
  fechaSolicitud: string
  estatus: EstatusSolicitud
  tipoPersona: TipoPersona | null
  sector: Sector | null
  tamanoEmpresa: TamanoEmpresa | null
  programa: string
  nombreSolicitante: string | null
  rfc: string | null
  curp: string | null
  telefono: string | null
  correo: string | null
  montoSolicitado: number
  plazoMeses: number | null
  mesesGracia: number | null
  numGarantias: number
  valorGarantias: number
  gestor: string | null
  grupo: string | null
  analista: string | null
  documentosRequeridos: number
  documentosAprobados: number
  documentosPendientes: number
  documentosRechazados: number
  porcentajeExpediente: number
  actualizadoEn: string
  diasEnTramite: number
  ultimoMotivo: string | null
}

export interface ResumenReporte {
  totalSolicitudes: number
  montoTotal: number
  montoPromedio: number
  porEstatus: { estatus: EstatusSolicitud; total: number }[]
}

export interface PrevisualizacionReporte {
  data: FilaReporte[]
  pagination: { page: number; pageSize: number; total: number; totalPages: number }
  resumen: ResumenReporte
}
