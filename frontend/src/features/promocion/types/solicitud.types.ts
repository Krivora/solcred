
import {
    EstadoCivil,
    EstatusSolicitud,
    NivelEstudio,
    Rol,
    Sector,
    TamanoEmpresa,
    TipoPersona,
    TipoVivienda
} from '@/shared/types/solicitudes.types'
import { EstatusDocumento } from '@/shared/types/documento.types'
import type { PaginacionData, RespuestaPaginada } from '@/shared/types/api'
export type { PaginacionData }

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
    /** Solo en listados de Financiamiento; en Promoción siempre indefinido. */
    analistaAsignado?: {
        analista: PersonalResumen
        fechaAsignacion: string
    } | null
    creadoEn: string
    actualizadoEn: string
}

export type SolicitudesPromocionResponse = RespuestaPaginada<SolicitudPromocion>

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
    pageSize: number
    estatus?: EstatusSolicitud | ''
    tipoPersona?: TipoPersona | ''
    sector?: Sector | ''
    tamanoEmpresa?: TamanoEmpresa | ''
    gestorId?: string
    programaId?: string
    fechaDesde?: string
    fechaHasta?: string
    busqueda?: string
}
export interface FiltrosMisCasos {
    page?: number
    pageSize?: number
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
    pageSize: number
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
    tipoDocumentoId: string
    esObligatorio: boolean
    aplicaA: 'FISICA' | 'MORAL' | 'AMBOS' | null
    tipoDocumento: TipoDocumentoInfo
}

// Proyección mínima que devuelve `GET /admin/promocion/:id` para el programa
// (`select: { id, nombre, documentosRequeridos }`). El catálogo completo de
// programas (montos, tasas, `secciones[]`) vive en `features/settings`.
export interface ProgramaDetalle {
    id: string
    nombre: string
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

/**
 * Usuario "plano" (sin anidar en `.usuario`). Así viene `realizadoPor` en el
 * historial de estatus del backend: incluye el rol y puede ser null cuando el
 * cambio lo hizo el sistema.
 */
export interface UsuarioResumen {
    id: string
    nombre: string
    apellidoPaterno: string
    apellidoMaterno: string
    personal: { rol: Rol } | null
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
    realizadoPor: UsuarioResumen | null
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

export interface TimelineAsignacionFinanciamiento {
    tipo: 'ASIGNACION_FINANCIAMIENTO'
    fecha: string
    analista: PersonalResumen
    asignadoPor: PersonalResumen | null
    activa: boolean
}

export type TimelineEvento =
    | TimelineCambioEstatus
    | TimelineAsignacion
    | TimelineReasignacion
    | TimelineAsignacionFinanciamiento

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
    analistaAsignado: AsignacionFinanciamientoDetalle | null
    historialAsignaciones: AsignacionDetalle[]
    timeline: TimelineEvento[]
}

export interface AsignacionFinanciamientoDetalle {
    id: string
    solicitudId: string
    analistaId: string
    asignadoPorId: string | null
    activa: boolean
    fechaAsignacion: string
    fechaReasignacion: string | null
    motivoReasignacion: string | null
    analista: PersonalResumen
    asignadoPor: PersonalResumen | null
}
