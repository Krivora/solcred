// lib/api/asignacion.ts

import { apiAuth } from './client'
import type {
    GrupoGestion,
    GestorConCarga,
    CrearGrupoDto,
    ActualizarGrupoDto,
    AsignarManualDto,
} from '@/lib/types/asignacion.types'

const BASE = '/asignacion'

// ─── Grupos ───────────────────────────────────────────────────────────────────

export const listarGrupos = (): Promise<GrupoGestion[]> =>
    apiAuth(`${BASE}/grupos`)

export const obtenerGrupo = (id: string): Promise<GrupoGestion> =>
    apiAuth(`${BASE}/grupos/${id}`)

export const crearGrupo = (dto: CrearGrupoDto): Promise<GrupoGestion> =>
    apiAuth(`${BASE}/grupos`, { method: 'POST', body: dto })

export const actualizarGrupo = (
    id: string,
    dto: ActualizarGrupoDto
): Promise<GrupoGestion> =>
    apiAuth(`${BASE}/grupos/${id}`, { method: 'PUT', body: dto })

export const eliminarGrupo = (id: string): Promise<void> =>
    apiAuth(`${BASE}/grupos/${id}`, { method: 'DELETE' })

// ─── Gestores ─────────────────────────────────────────────────────────────────

export const obtenerCargaGestores = (grupoId?: string): Promise<GestorConCarga[]> => {
    const params = grupoId ? `?grupoId=${grupoId}` : ''
    return apiAuth(`${BASE}/gestores/carga${params}`)
}

// ─── Asignación ───────────────────────────────────────────────────────────────

export const asignarAutomaticamente = (solicitudId: string): Promise<void> =>
    apiAuth(`${BASE}/solicitudes/${solicitudId}/automatica`, { method: 'POST' })

export const asignarManualmente = (
    solicitudId: string,
    dto: AsignarManualDto
): Promise<void> =>
    apiAuth(`${BASE}/solicitudes/${solicitudId}/manual`, {
        method: 'POST',
        body: dto,
    })