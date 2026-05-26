// ─── Enums (mirror del backend) ───────────────────────────────────────────────

export type EstatusSolicitud =
    | 'BORRADOR'
    | 'PENDIENTE'
    | 'EN_REVISION'
    | 'APROBADO'
    | 'RECHAZADO';

export type TipoPersona = 'FISICA' | 'MORAL';

export type Sector =
    | 'AGROPECUARIO'
    | 'INDUSTRIAL'
    | 'COMERCIAL'
    | 'SERVICIOS'
    | 'TECNOLOGIA'
    | 'OTRO';

export type TamanoEmpresa = 'MICRO' | 'PEQUENA' | 'MEDIANA' | 'GRANDE';

export type EstadoCivil =
    | 'SOLTERO'
    | 'CASADO'
    | 'DIVORCIADO'
    | 'VIUDO'
    | 'UNION_LIBRE';

export type NivelEstudio =
    | 'PRIMARIA'
    | 'SECUNDARIA'
    | 'PREPARATORIA'
    | 'TECNICO'
    | 'LICENCIATURA'
    | 'MAESTRIA'
    | 'DOCTORADO';

export type Requerimiento = 'NO_REQUIERE' | 'OPCIONAL' | 'OBLIGATORIO';

// ─── Programa (resumen para selector) ─────────────────────────────────────────

export interface ProgramaResumen {
    id: string;
    nombre: string;
    descripcion: string;
    objetivo: string;
    permitePersonaFisica: boolean;
    permitePersonaMoral: boolean;
    montoMinimo: number;
    montoMaximo: number;
    tasaAnual: number;
    plazoMinimoMeses: number;
    plazoMaximoMeses: number;
    aval: Requerimiento;
    garantia: Requerimiento;
    activo: boolean;
}

// ─── Datos personales compartidos ─────────────────────────────────────────────

export interface DatosPersona {
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    curp?: string;
    rfc?: string;
    telefono?: string;
    celular?: string;
    correo?: string;
    calle?: string;
    numeroExterior?: string;
    numeroInterior?: string;
    colonia?: string;
    ciudad?: string;
    estado?: string;
    codigoPostal?: string;
    nivelEstudio?: NivelEstudio;
    universidad?: string;
    estadoCivil?: EstadoCivil;
}

// ─── Solicitud ────────────────────────────────────────────────────────────────

export interface Solicitud {
    id: string;
    programaId: string;
    programa: ProgramaResumen;
    solicitanteId: string;
    estatus: EstatusSolicitud;
    tipoPersona: TipoPersona;
    sector: Sector;
    tamanoEmpresa?: TamanoEmpresa;
    montoSolicitado: number;
    plazoSolicitado: number;
    datosSolicitante?: DatosPersona & { id: string };
    datosAval?: DatosPersona & { id: string };
    creadoEn: string;
    actualizadoEn: string;
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface CrearSolicitudPayload {
    programaId: string;
    tipoPersona: TipoPersona;
    sector: Sector;
    tamanoEmpresa?: TamanoEmpresa;
    montoSolicitado: number;
    plazoSolicitado: number;
}

export type ActualizarDatosPersonaPayload = DatosPersona;

// ─── Wizard state local ───────────────────────────────────────────────────────

export interface WizardState {
    solicitudId: string | null;
    currentStep: number;
    datosGenerales: Partial<CrearSolicitudPayload>;
    datosSolicitante: Partial<DatosPersona>;
    datosAval: Partial<DatosPersona>;
    programa: ProgramaResumen | null;
}