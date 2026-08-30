/**
 * Contrato de transporte con el backend.
 *
 * `ApiResponse<T>` es el espejo EXACTO de `backend/src/utils/response.ts`
 * (`ok()` / `fail()`). Todo endpoint JSON responde con este sobre.
 *
 * La paginación NO está unificada en el backend (deuda conocida — ver
 * KNOWN-ISSUES.md en la raíz):
 *   - `clientes/solicitudes` → `{ items, pagination: { pageSize } }`
 *   - `admin/promocion/*`    → `{ data,  meta:       { limit } }`
 * Por eso conviven `PaginacionData` (pageSize) y `PaginacionMeta` (limit).
 */

export interface ApiResponse<T = null> {
  success: boolean
  message: string
  data?: T
  errors?: unknown
}

/** Bloque de paginación estilo `clientes/*` (page + pageSize). */
export interface PaginacionData {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

/** Bloque de paginación estilo `admin/promocion/*` (page + limit). */
export interface PaginacionMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

/** `{ data, pagination }` — estilo `clientes/*`. */
export interface RespuestaPaginada<T> {
  data: T[]
  pagination: PaginacionData
}

/** `{ data, meta }` — estilo `admin/promocion/*`. */
export interface RespuestaConMeta<T> {
  data: T[]
  meta: PaginacionMeta
}
