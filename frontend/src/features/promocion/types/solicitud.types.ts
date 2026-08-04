
import {
    EstadoCivil,
    EstatusSolicitud,
    NivelEstudio,
    Sector,
    TamanoEmpresa,
    TipoPersona,
    TipoVivienda
} from '@/shared/lib/types/solicitudes.types'
import { EstatusDocumento } from '@/shared/lib/types/documento.types'

export interface GestorAsignado {
    id: string
    nombre: string
    apellidoPaterno: string
    apellidoMaterno: string
}

export interface SolicitudPromocion {
    id: string
    folio: string
    estatus: EstatusSolicitud
    tipoPersona?: TipoPersona
    sector?: Sector
    tamanoEmpresa?: TamanoEmpresa
    montoSolicitado?: number
    plazoSolicitado?: number
    programa: Pick<{ id: string; nombre: string }, 'id' | 'nombre'>
    datosSolicitante?: {
        id: string
        nombre: string
        apellidoPaterno: string
        apellidoMaterno: string
        rfc?: string
        correo?: string
        celular?: string
    }
    metricas?: {
        totalRequeridos: number
        totalAprobados: number
        totalPendientes: number
        totalRechazados: number
        totalNoSubidos: number
        totalSubidos: number
        porcentajeCompletado: number
    }
    comentarioPromotor?: string | null
    gestorAsignado?: {
        gestor: PersonalResumen
        fechaAsignacion: string
    }
    creadoEn: string
    actualizadoEn: string
}

export interface PaginacionMeta {
    total: number
    page: number
    limit: number
    totalPages: number
}

export interface SolicitudesPromocionResponse {
    data: SolicitudPromocion[]
    meta: PaginacionMeta
}

export interface StatsPromocion {
    total: number
    borrador: number
    pendiente: number
    enRevision: number
    aprobado: number
    rechazado: number
}

export interface FiltrosPromocion {
    page: number
    limit: number
    estatus?: EstatusSolicitud | ''
    tipoPersona?: TipoPersona | ''
    sector?: Sector | ''
    tamanoEmpresa?: TamanoEmpresa | ''
    asignacion?: 'todos' | 'asignados' | 'sin_asignar' | ''
    programaId?: string
    fechaDesde?: string
    fechaHasta?: string
    busqueda?: string
}
export interface FiltrosMisCasos {
    page?: number
    limit?: number
    estatus?: string
    tipoPersona?: string
    sector?: string
    tamanoEmpresa?: string
    programaId?: string
    fechaDesde?: string
    fechaHasta?: string
    busqueda?: string
}
export interface FiltrosAprobacion {
    page: number
    limit: number
    tipoPersona?: string
    sector?: string
    tamanoEmpresa?: string
    programaId?: string
    fechaDesde?: string
    fechaHasta?: string
    busqueda?: string
}

export interface GrupoResumen {
    id: string
    nombre: string
}

export interface TipoDocumentoInfo {
    id: string
    nombre: string
    descripcion: string | null
}

export interface DocumentoRequeridoPrograma {
    id: string
    tipoDocumentoId: string
    esObligatorio: boolean
    aplicaA: 'FISICA' | 'MORAL' | 'AMBOS' | null
    tipoDocumento: TipoDocumentoInfo
}

export interface ProgramaDetalle {
    id: string
    nombre: string
    descripcion: string
    montoMinimo: number
    montoMaximo: number
    tasaOrdinaria: number
    tasaMoratoria: number
    tasaAnual: number
    plazoMinimoMeses: number
    plazoMaximoMeses: number
    aval: 'NO_REQUIERE' | 'OPCIONAL' | 'OBLIGATORIO'
    garantia: 'NO_REQUIERE' | 'OPCIONAL' | 'OBLIGATORIO'
    documentosRequeridos: DocumentoRequeridoPrograma[]
}

export interface DocumentoDetalle {
    id: string
    solicitudId: string
    tipoDocumentoId: string
    urlArchivo: string
    nombreArchivo: string
    version: number
    activo: boolean
    estatus: EstatusDocumento
    motivoRechazo: string | null
    fechaValidacion: string | null
    subidoEn: string
    tipoDocumento: TipoDocumentoInfo
    validadoPor: PersonalResumen | null
}

export interface PersonalResumen {
    id: string
    usuario: {
        nombre: string
        apellidoPaterno: string
        apellidoMaterno: string
    }
}


export interface AsignacionDetalle {
    id: string
    solicitudId: string
    gestorId: string
    grupoId: string
    asignadoPorId: string | null
    activa: boolean
    fechaAsignacion: string
    fechaReasignacion: string | null
    motivoReasignacion: string | null
    gestor: PersonalResumen
    grupo: GrupoResumen
    asignadoPor: PersonalResumen | null
}

// ── Eventos del timeline unificado ──────────────────────────────────────────

export interface TimelineCambioEstatus {
    tipo: 'CAMBIO_ESTATUS'
    fecha: string
    estatusAnterior: EstatusSolicitud
    estatusNuevo: EstatusSolicitud
    comentario: string | null
    realizadoPor: PersonalResumen
}

export interface TimelineAsignacion {
    tipo: 'ASIGNACION'
    fecha: string
    gestor: PersonalResumen
    grupo: GrupoResumen
    asignadoPor: PersonalResumen | null
    activa: boolean
}

export interface TimelineReasignacion {
    tipo: 'REASIGNACION'
    fecha: string
    gestorAnterior: PersonalResumen
    comentario: string | null
}

export type TimelineEvento =
    | TimelineCambioEstatus
    | TimelineAsignacion
    | TimelineReasignacion

// ── Solicitud con toda la información (vista de detalle) ───────────────────
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
export interface MetricasDocumentos {
    totalRequeridos: number
    totalAprobados: number
    totalPendientes: number
    totalRechazados: number
    totalNoSubidos: number
    totalSubidos: number
    porcentajeCompletado: number
}

export interface SolicitudDetalle {
    id: string
    folio: string
    programaId: string
    solicitanteId: string
    estatus: EstatusSolicitud
    tipoPersona: TipoPersona | null
    sector: Sector | null
    tamanoEmpresa: TamanoEmpresa | null
    montoSolicitado: number | null
    plazoSolicitado: number | null
    creadoEn: string
    actualizadoEn: string

    programa: ProgramaDetalle
    datosSolicitante: (DatosPersona & { id: string }) | null
    datosAval: (DatosPersona & { id: string }) | null
    documentos: DocumentoDetalle[]

    metricas: MetricasDocumentos
    gestorAsignado: AsignacionDetalle | null
    historialAsignaciones: AsignacionDetalle[]
    timeline: TimelineEvento[]
}
