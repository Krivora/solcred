export type TipoPersona = 'FISICA' | 'MORAL'
export type Sector = 'AGROPECUARIO' | 'INDUSTRIAL' | 'COMERCIAL' | 'SERVICIOS' | 'TECNOLOGIA' | 'OTRO'
export type TamanoEmpresa = 'MICRO' | 'PEQUENA' | 'MEDIANA' | 'GRANDE'
export type CategoriaCredito = 'CAPITAL' | 'MAQUINARIA_EQUIPO' | 'REMODELACION'
export type EstatusSolicitud =
  | 'BORRADOR'
  | 'PENDIENTE'
  | 'EN_REVISION'
  | 'EN_CORRECCION'
  | 'EN_FINANCIAMIENTO'
  | 'EN_APROBACION'
  | 'APROBADO'
  | 'RECHAZADO'
  | 'CANCELADO'

export const ESTATUS_FINALES: EstatusSolicitud[] = ['CANCELADO', 'RECHAZADO', 'APROBADO']
export type EstatusDocumento = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'
export type EstadoCivil = 'SOLTERO' | 'CASADO' | 'DIVORCIADO' | 'VIUDO' | 'UNION_LIBRE'
export type NivelEstudio = 'PRIMARIA' | 'SECUNDARIA' | 'PREPARATORIA' | 'TECNICO' | 'LICENCIATURA' | 'MAESTRIA' | 'DOCTORADO'
export type TipoVivienda = | "PROPIA" | "RENTADA" | "PAGANDO"
export type TipoGarantia = 'PRENDARIA' | 'HIPOTECARIA'
export interface PaginacionMeta {
    total: number
    page: number
    limit: number
    totalPages: number
}
