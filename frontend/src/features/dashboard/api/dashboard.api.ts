import { apiAuth } from '@/shared/api/client'
import type { Panorama, RangoDashboard } from '@/features/dashboard/types/dashboard.types'

export const dashboardApi = {
  panorama: (rango: RangoDashboard) =>
    apiAuth<Panorama>(`/admin/dashboard?rango=${rango}`),
}
