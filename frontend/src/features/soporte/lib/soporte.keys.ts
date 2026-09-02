import type { FiltrosMisTickets, FiltrosTickets } from '@/features/soporte/types/soporte.types'

export const soporteKeys = {
  all: ['soporte'] as const,
  misTickets: (f: FiltrosMisTickets) => [...soporteKeys.all, 'mios', f] as const,
  tickets: (f: FiltrosTickets) => [...soporteKeys.all, 'todos', f] as const,
  detalle: (id: string) => [...soporteKeys.all, 'ticket', id] as const,
  stats: () => [...soporteKeys.all, 'stats'] as const,
  agentes: () => [...soporteKeys.all, 'agentes'] as const,
  slaPoliticas: () => [...soporteKeys.all, 'sla-politicas'] as const,
}
