import { apiRequest } from '@/shared/api/client'
import type { ProgramaPublico } from '@/features/simulador/types/simulador.types'

export const simuladorApi = {
    // Sin token: el simulador corre antes de que la persona tenga cuenta.
    listarProgramas: () => apiRequest<ProgramaPublico[]>('/public/programas'),
}
