import type { RangoDashboard } from '@/features/dashboard/types/dashboard.types'

export const dashboardKeys = {
  all: ['dashboard'] as const,
  panorama: (rango: RangoDashboard) => [...dashboardKeys.all, 'panorama', rango] as const,
}
