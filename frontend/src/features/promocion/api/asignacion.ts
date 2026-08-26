import { apiAuth } from '@/shared/lib/client'
import type {
    GestorConCarga,
    AsignarManualDto,
    SolicitudAsignacion,      // ← tipo que necesitarás crear
    FiltrosAsignacion,        // ← ídem
    PaginatedResponse,        // ← si ya lo tienes en tipos compartidos
} from '@/features/promocion/types/asignacion.types'

const BASE = '/admin/asignacion'

export interface ResultadoAsignacion {
    solicitudId: string
    exito: boolean
    mensaje?: string
}
export const listarSolicitudesAsignacion = (
    filtros: FiltrosAsignacion
): Promise<PaginatedResponse<SolicitudAsignacion>> => {
    const params = new URLSearchParams()

    Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.set(key, String(value))
        }
    })

    return apiAuth(`${BASE}/solicitudes?${params.toString()}`)
}

export const obtenerCargaGestores = (grupoId?: string): Promise<GestorConCarga[]> => {
    const params = grupoId ? `?grupoId=${grupoId}` : ''
    return apiAuth(`${BASE}/gestores/carga${params}`)
}

export const asignarAutomaticamente = (solicitudIds: string[]): Promise<ResultadoAsignacion[]> =>
    apiAuth(`${BASE}/solicitudes/automatica`, {
        method: 'POST',
        body: { solicitudIds },
    })

export const asignarManualmente = (
    solicitudId: string,
    dto: AsignarManualDto
): Promise<void> =>
    apiAuth(`${BASE}/solicitudes/${solicitudId}/manual`, {
        method: 'POST',
        body: dto,
    })