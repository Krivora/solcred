import type { FiltrosHistorial } from '@/features/crm/types/crm.types'

export const crmKeys = {
  all: ['crm'] as const,
  historial: (f: FiltrosHistorial) => [...crmKeys.all, 'historial', f] as const,
  resumen: (solicitudId: string) => [...crmKeys.all, 'resumen', solicitudId] as const,
}
