import { apiAuth } from '@/shared/lib/client'
import type {
    GestorConCarga,
    AsignarManualDto,
} from '@/features/asignacion/types/asignacion.types'

const BASE = '/asignacion'

export const obtenerCargaGestores = (grupoId?: string): Promise<GestorConCarga[]> => {
    const params = grupoId ? `?grupoId=${grupoId}` : ''
    return apiAuth(`${BASE}/gestores/carga${params}`)
}

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