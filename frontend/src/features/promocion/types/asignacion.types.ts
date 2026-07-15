// lib/types/asignacion.types.ts

// ─── Enums (espejo del backend) ───────────────────────────────────────────────

export type CampoRegla =
    | 'TIPO_PERSONA'
    | 'SECTOR'
    | 'TAMANO_EMPRESA'
    | 'PROGRAMA_ID'
    | 'MONTO_SOLICITADO'

export type OperadorRegla =
    | 'IGUAL'
    | 'DIFERENTE'
    | 'EN_LISTA'
    | 'MAYOR_QUE'
    | 'MENOR_QUE'
    | 'MAYOR_IGUAL'
    | 'MENOR_IGUAL'
export type TipoPersona = 'FISICA' | 'MORAL'
// ─── Reglas ───────────────────────────────────────────────────────────────────

export interface ReglaGrupo {
    id: string
    grupoId: string
    campo: CampoRegla
    operador: OperadorRegla
    valor: string
    creadoEn: string
}

export interface ReglaDto {
    campo: CampoRegla
    operador: OperadorRegla
    valor: string
}

// ─── Gestor ───────────────────────────────────────────────────────────────────

export interface GestorResumen {
    id: string
    nombre: string
    apellidoPaterno: string
    apellidoMaterno: string
    correo: string
    activo: boolean
}

export interface GestorConCarga extends GestorResumen {
    grupoId: string
    cargaActual: number
}

export interface GrupoGestor {
    gestorId: string
    grupoId: string
    activo: boolean
    asignadoEn: string
    gestor: GestorResumen
}


export interface GrupoGestion {
    id: string
    nombre: string
    descripcion: string | null
    activo: boolean
    prioridad: number
    reglas: ReglaGrupo[]
    gestores: GrupoGestor[]
    _count: { asignaciones: number }
    creadoEn: string
    actualizadoEn: string
}

// ─── Asignación ───────────────────────────────────────────────────────────────

export interface AsignacionSolicitud {
    id: string
    solicitudId: string
    gestorId: string
    grupoId: string
    asignadoPorId: string | null
    activa: boolean
    fechaAsignacion: string
    fechaReasignacion: string | null
    motivoReasignacion: string | null
    gestor: GestorResumen
}

export interface AsignarManualDto {
    gestorId: string
    motivo?: string
}
export interface SolicitudPendiente {
    id: string
    folio: string
    programa: { nombre: string }
    datosSolicitante: { nombre: string; apellidoPaterno: string }
    estatus: string
    tipoPersona: 'FISICA' | 'MORAL' | null
    sector: string | null
    tamanoEmpresa: string | null
    montoSolicitado: number | null
    creadoEn: string
}

// ─── Labels para UI ───────────────────────────────────────────────────────────

export const CAMPO_LABELS: Record<CampoRegla, string> = {
    TIPO_PERSONA: 'Tipo de persona',
    SECTOR: 'Sector',
    TAMANO_EMPRESA: 'Tamaño de empresa',
    PROGRAMA_ID: 'Programa',
    MONTO_SOLICITADO: 'Monto solicitado',
}

export const OPERADOR_LABELS: Record<OperadorRegla, string> = {
    IGUAL: 'es igual a',
    DIFERENTE: 'es diferente a',
    EN_LISTA: 'está en la lista',
    MAYOR_QUE: 'es mayor que',
    MENOR_QUE: 'es menor que',
    MAYOR_IGUAL: 'es mayor o igual a',
    MENOR_IGUAL: 'es menor o igual a',
}

export const CAMPOS_NUMERICOS: CampoRegla[] = ['MONTO_SOLICITADO']
export const CAMPOS_LISTA: CampoRegla[] = [
    'TIPO_PERSONA',
    'SECTOR',
    'TAMANO_EMPRESA',
]
export interface FiltrosAsignacion {
    page: number
    limit: number
    estatus?: string
    tipoPersona?: string
    sector?: string
    tamanoEmpresa?: string
    programaId?: string
    fechaDesde?: string
    fechaHasta?: string
    busqueda?: string
    asignacion?: 'asignados' | 'sin_asignar'
    gestorId?: string
    grupoId?: string
}

export interface SolicitudAsignacion {
    id: string
    folio: string
    estatus: string
    tipoPersona: TipoPersona
    sector: string | null
    tamanoEmpresa: string | null
    montoSolicitado: number | null
    plazoSolicitado: number | null
    creadoEn: string
    programa: { id: string; nombre: string }
    datosSolicitante: {
        id: string
        nombre: string
        apellidoPaterno: string
        apellidoMaterno: string
        rfc: string | null
        correo: string | null
        celular: string | null
    } | null
    asignacion: {
        fechaAsignacion: string
        grupoId: string
        grupo: { id: string; nombre: string }
        gestor: {
            id: string
            nombre: string
            apellidoPaterno: string
            apellidoMaterno: string
        }
    } | null
}

export interface PaginatedResponse<T> {
    data: T[]
    meta: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
}