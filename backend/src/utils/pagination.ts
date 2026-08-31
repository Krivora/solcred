/**
 * Envoltorio único de paginación para todos los listados del API.
 *
 * Todo endpoint paginado responde con `{ data, pagination }` y acepta los
 * query params `page` + `pageSize`. Es el espejo de
 * `frontend/src/shared/types/api.ts` (`RespuestaPaginada<T>` / `PaginacionData`).
 */

export interface Paginacion {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface RespuestaPaginada<T> {
  data: T[];
  pagination: Paginacion;
}

/** Arma el envoltorio estándar. `pageSize` debe venir ya saneado (>= 1). */
export const paginado = <T>(
  data: T[],
  page: number,
  pageSize: number,
  total: number
): RespuestaPaginada<T> => ({
  data,
  pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
});

/** Parser para controllers que leen `req.query` a mano (promoción). */
export const parsearPaginacionQuery = (
  query: Record<string, unknown>,
  { defaultPageSize = 20, maxPageSize = 100 }: { defaultPageSize?: number; maxPageSize?: number } = {}
): { page: number; pageSize: number } => {
  const page = Math.max(1, parseInt(query.page as string, 10) || 1);
  const pageSize = Math.min(
    Math.max(1, parseInt(query.pageSize as string, 10) || defaultPageSize),
    maxPageSize
  );
  return { page, pageSize };
};
