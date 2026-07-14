// Catálogos base usados en el formulario
export type TipoPersona = 'FISICA' | 'MORAL'
export type Sector = 'AGROPECUARIO' | 'INDUSTRIAL' | 'COMERCIAL' | 'SERVICIOS' | 'TECNOLOGIA' | 'OTRO'
export type TamanoEmpresa = 'MICRO' | 'PEQUENA' | 'MEDIANA' | 'GRANDE'
export type CategoriaCredito = 'CAPITAL' | 'MAQUINARIA_EQUIPO' | 'REMODELACION'
export type EstadoCivil = 'SOLTERO' | 'CASADO' | 'DIVORCIADO' | 'VIUDO' | 'UNION_LIBRE'
export type NivelEstudio =
  | 'PRIMARIA'
  | 'SECUNDARIA'
  | 'PREPARATORIA'
  | 'TECNICO'
  | 'LICENCIATURA'
  | 'MAESTRIA'
  | 'DOCTORADO'
export type TipoVivienda = 'PROPIA' | 'RENTADA' | 'PAGANDO'
export type TipoGarantia = 'PRENDARIA' | 'HIPOTECARIA'

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
  tipoLocal?: 'PROPIO' | 'RENTADO' | 'FAMILIAR' | 'OTRO'
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