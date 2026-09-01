import { apiAuth } from '@/shared/api/client'
import { construirPayload } from '@/features/reportes/lib/reportes.filtros'
import type {
  CatalogosReporte,
  FiltrosReporte,
  PrevisualizacionReporte,
} from '@/features/reportes/types/reportes.types'

const BASE = '/admin/reportes'

export const reportesApi = {
  catalogos: () => apiAuth<CatalogosReporte>(`${BASE}/catalogos`),

  previsualizar: (filtros: FiltrosReporte, page: number, pageSize: number) =>
    apiAuth<PrevisualizacionReporte>(`${BASE}/solicitudes/previsualizar`, {
      method: 'POST',
      body: { ...construirPayload(filtros), page, pageSize },
    }),

  /** El backend responde el binario del .xlsx; `apiRequest` ya lo entrega como Blob. */
  exportar: (filtros: FiltrosReporte) =>
    apiAuth<Blob>(`${BASE}/solicitudes/exportar`, {
      method: 'POST',
      body: construirPayload(filtros),
    }),
}
