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
    grupoId: string
    gestorId: string
    activo: boolean
    gestor: {
        id: string
        activo: boolean
        usuario: {
            nombre: string
            apellidoPaterno: string
            apellidoMaterno: string
            correo: string
        }
    }
}
// ─── Grupos ───────────────────────────────────────────────────────────────────

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

export interface CrearGrupoDto {
    nombre: string
    descripcion?: string
    prioridad?: number
    reglas: ReglaDto[]
    gestorIds: string[]
}

export interface ActualizarGrupoDto {
    nombre?: string
    descripcion?: string
    prioridad?: number
    activo?: boolean
    reglas?: ReglaDto[]
    gestorIds?: string[]
}
