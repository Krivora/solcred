// Enums de dominio: fuente única generada desde Prisma (`npm run gen:enums`).
// Este archivo se mantiene como barrel para no romper los ~30 imports existentes
// de `@/shared/types/solicitudes.types`.
export * from './domain.enums'

import type { EstatusSolicitud } from './domain.enums'

export const ESTATUS_FINALES: EstatusSolicitud[] = ['CANCELADO', 'RECHAZADO', 'APROBADO']

// El sobre de API y los bloques de paginación viven en `@/shared/types/api`.
// Se re-exportan aquí por compatibilidad con imports existentes.
export type { ApiResponse, PaginacionData, RespuestaPaginada } from './api'
