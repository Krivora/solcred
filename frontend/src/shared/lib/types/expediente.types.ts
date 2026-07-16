import type { TipoPersona, EstatusSolicitud } from '@/shared/lib/types/solicitudes.types'
import {EstatusDocumento } from '@/shared/lib/types/documento.types'
// ─── Documento ────────────────────────────────────────────────────────────────

export interface TipoDocumento {
    id: string
    nombre: string
    descripcion?: string
}

export interface ValidadoPor {
    id: string
    nombre: string
    apellidoPaterno: string
    apellidoMaterno: string
}

export interface DocumentoActivo {
    id: string
    solicitudId: string
    tipoDocumentoId: string
    tipoDocumento: TipoDocumento
    urlArchivo: string
    nombreArchivo: string
    version: number
    activo: boolean
    estatus: EstatusDocumento
    validadoPor: ValidadoPor | null
    fechaValidacion: string | null
    motivoRechazo: string | null
    subidoEn: string
}

export interface ResumenDocumento {
    tipoDocumento: TipoDocumento
    esObligatorio: boolean
    aplicaA: 'FISICA' | 'MORAL' | 'AMBOS' | null
    documentoActivo: DocumentoActivo | null
    estatus: EstatusDocumento | 'NO_SUBIDO'
}

// ─── Expediente ───────────────────────────────────────────────────────────────

export interface Solicitante {
    id: string
    nombre: string
    apellidoPaterno: string
    apellidoMaterno: string
    correo: string
}

export interface DatosSolicitante {
    nombre: string
    apellidoPaterno: string
    apellidoMaterno: string
    celular: string | null
    correo: string | null
    telefono: string | null
}

export interface GestorAsignado {
    id: string
    nombre: string
    apellidoPaterno: string
    apellidoMaterno: string
}

export interface MetricasExpediente {
    totalRequeridos: number
    totalAprobados: number
    totalPendientes: number
    totalRechazados: number
    totalNoSubidos: number
    porcentajeCompletado: number
}

export interface Expediente {
    id: string
    folio: string
    estatus: EstatusSolicitud
    tipoPersona: TipoPersona | null
    sector: string | null
    tamanoEmpresa: string | null
    montoSolicitado: number | null
    plazoSolicitado: number | null
    creadoEn: string
    actualizadoEn: string
    programa: { id: string; nombre: string }
    solicitante: Solicitante
    datosSolicitante: DatosSolicitante | null
    gestor: GestorAsignado | null
    fechaAsignacion: string | null
    documentos: ResumenDocumento[]
    metricas: MetricasExpediente
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface SubirDocumentoDto {
    tipoDocumentoId: string
    urlArchivo: string
    nombreArchivo: string
}

export interface ValidarDocumentoDto {
    estatus: 'APROBADO' | 'RECHAZADO'
    motivoRechazo?: string
}
// Solo para el formulario interno del componente
export interface SubirDocumentoForm {
    tipoDocumentoId: string
    archivo: File
}

export interface UploadArchivoResponse {
    urlArchivo: string
    nombreArchivo: string
}