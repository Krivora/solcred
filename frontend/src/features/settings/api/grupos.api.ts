import { apiAuth } from '@/shared/api/client'
import type {
    GrupoGestion,
    CrearGrupoDto,
    ActualizarGrupoDto,
} from '@/features/settings/types/grupos.types'

const BASE = '/admin/grupos'

export const listarGrupos = (): Promise<GrupoGestion[]> =>
    apiAuth(BASE)

export const obtenerGrupo = (id: string): Promise<GrupoGestion> =>
    apiAuth(`${BASE}/${id}`)

export const crearGrupo = (dto: CrearGrupoDto): Promise<GrupoGestion> =>
    apiAuth(BASE, { method: 'POST', body: dto })

export const actualizarGrupo = (
    id: string,
    dto: ActualizarGrupoDto
): Promise<GrupoGestion> =>
    apiAuth(`${BASE}/${id}`, { method: 'PUT', body: dto })

export const eliminarGrupo = (id: string): Promise<void> =>
    apiAuth(`${BASE}/${id}`, { method: 'DELETE' })