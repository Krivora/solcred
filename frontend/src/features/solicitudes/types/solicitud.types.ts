import {
  CategoriaCredito,
  EstadoCivil,
  EstatusSolicitud,
  NivelEstudio,
  Sector,
  TamanoEmpresa,
  TipoGarantia,
  TipoLocal,
  TipoPersona,
  TipoVivienda,
} from '@/shared/lib/types/solicitudes.types'

import { Programa } from '@/shared/lib/types/programa'

// Step: Programa
export interface CrearSolicitudDto {
  programaId: string
}

// Step: Generales
export interface DatosGenerales {
  tipoPersona: TipoPersona
  sector: Sector
  tamanoEmpresa?: TamanoEmpresa
}

// Steps: Solicitante / Aval
export interface DatosPersona {
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  curp?: string
  rfc?: string
  telefono?: string
  celular?: string
  correo?: string
  calle?: string
  numeroExterior?: string
  numeroInterior?: string
  colonia?: string
  ciudad?: string
  estado?: string
  codigoPostal?: string
  nivelEstudio?: NivelEstudio
  universidad?: string
  estadoCivil?: EstadoCivil
  nombreConyuge?: string
  numeroINE?: string
  tipoVivienda?: TipoVivienda
  aniosDomicilioActual?: number
  aniosDomicilioAnterior?: number
}

// Step: Crédito
export interface ConceptoCredito {
  id?: string
  categoria: CategoriaCredito
  concepto: string
  monto: number
}

export interface DatosCredito {
  id?: string
  plazoMeses: number
  mesesGracia: number
  conceptos: ConceptoCredito[]
}

// Step: Garantía
export interface Garantia {
  id?: string
  tipo: TipoGarantia
  nombrePropietario: string
  valor: number
  descripcion?: string
  // Prendaria
  marca?: string
  modelo?: string
  anio?: number
  numeroSerie?: string
  // Hipotecaria
  calle?: string
  numeroExterior?: string
  numeroInterior?: string
  colonia?: string
  ciudad?: string
  estado?: string
  codigoPostal?: string
  numeroEscritura?: string
  folioReal?: string
}

export interface DatosGarantia {
  garantias: Garantia[]
}

// Step: Negocio
export interface DatosNegocio {
  razonSocial?: string
  rfcNegocio?: string
  nombreNegocio?: string
  domicilioNegocio?: string
  numeroExteriorNegocio?: string
  numeroInteriorNegocio?: string
  coloniaLocal?: string
  codigoPostalLocal?: string
  municipioLocal?: string
  estadoLocal?: string
  actividadNegocio?: string
  areaNegocio?: string
  empleosConservados?: number
  empleosNuevos?: number
  fechaInicioOperaciones?: string
  antiguedadNegocio?: number
  tipoLocal?: TipoLocal
  experienciaActividadSolicitante?: number
  experienciaEmpresarioSolicitante?: number
  actualExporta?: boolean
  obtuvoExperiencia?: boolean
  negocioConsidera?: string
  telefonoRecadosNegocio?: string
  telefonoFijoNegocio?: string
}

// Step: Mercado
export interface DatosMercado {
  principalesProductos?: string
  porcentajeMayoristas?: number
  porcentajeDetallistas?: number
  porcentajeClienteFinal?: number
  coberturaLocal?: number
  coberturaRegional?: number
  coberturaEstatal?: number
  coberturaNacional?: number
  coberturaExportacion?: number
}

// Step: Bancarios
export interface DatosBancarios {
  banco: string
  numeroCuenta?: string
  clabe: string
}

export interface Solicitud {
  id: string
  folio: string
  programaId: string
  programa: Pick<Programa, 'id' | 'nombre'>
  solicitanteId: string
  estatus: EstatusSolicitud
  tipoPersona?: TipoPersona
  sector?: Sector          // ← corregido: opcional hasta guardar datosGenerales
  tamanoEmpresa?: TamanoEmpresa
  // montoSolicitado / plazoSolicitado eliminados: no existen en el backend.
  // El monto real se calcula desde datosCredito.conceptos (suma de montos);
  // el plazo real es datosCredito.plazoMeses. Derívalos en el frontend
  // con un selector/helper en vez de esperarlos del API.
  datosSolicitante?: DatosPersona & { id: string }
  datosAval?: DatosPersona & { id: string }
  datosCredito?: DatosCredito & { id: string }
  datosGarantia?: DatosGarantia & { id: string }
  datosNegocio?: DatosNegocio & { id: string }
  datosMercado?: DatosMercado & { id: string }
  datosBancarios?: DatosBancarios & { id: string }
  creadoEn: string
  actualizadoEn: string
  gestorAsignado?: {
    id: string
    nombre: string
  } | null
}

// Shape exacto de la respuesta de GET /solicitudes (paginada)
export interface SolicitudesPaginadas {
  items: Solicitud[]
  pagination: PaginacionMeta
}

export interface PaginacionMeta {
  total: number
  page: number
  pageSize: number
  totalPages: number
}