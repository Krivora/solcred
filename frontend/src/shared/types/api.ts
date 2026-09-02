/**
 * Contrato de transporte con el backend.
 *
 * `ApiResponse<T>` es el espejo EXACTO de `backend/src/utils/response.ts`
 * (`ok()` / `fail()`). Todo endpoint JSON responde con este sobre.
 *
 * La paginación está unificada: todo listado paginado responde con
 * `{ data, pagination: { page, pageSize, total, totalPages } }` y acepta los
 * query params `page` + `pageSize`. Espejo de `backend/src/utils/pagination.ts`.
 */

export interface ApiResponse<T = null> {
  success: boolean
  message: string
  data?: T
  errors?: unknown
  /** Código legible por el cliente (solo en respuestas de error). */
  code?: string
}

/** Bloque de paginación estándar. */
export interface PaginacionData {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

/** `{ data, pagination }` — envoltorio único de todo listado paginado. */
export interface RespuestaPaginada<T> {
  data: T[]
  pagination: PaginacionData
}
