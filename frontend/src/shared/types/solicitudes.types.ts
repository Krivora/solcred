// Enums de dominio: fuente única generada desde Prisma (`npm run gen:enums`).
// Este archivo se mantiene como barrel para no romper los ~30 imports existentes
// de `@/shared/types/solicitudes.types`.
export * from './domain.enums'

import type { EstatusSolicitud } from './domain.enums'

export const ESTATUS_FINALES: EstatusSolicitud[] = ['CANCELADO', 'RECHAZADO', 'APROBADO']

// Nombres alineados 1:1 con lo que regresa el backend (solicitudes.controller.ts).
// Si esto diverge del backend otra vez, la lista de solicitudes se rompe en silencio.
export interface PaginacionMeta {
  total: number
  page: number
  pageSize: number
  totalPages: number
}
