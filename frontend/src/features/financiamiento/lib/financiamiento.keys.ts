import type { FiltrosFinanciamiento } from '@/features/financiamiento/types/financiamiento.types'

type F = Partial<FiltrosFinanciamiento>

export const financiamientoKeys = {
  all: ['financiamiento'] as const,

  mesaControl: (f: F) => [...financiamientoKeys.all, 'mesa-control', f] as const,
  asignacion: (f: F) => [...financiamientoKeys.all, 'asignacion', f] as const,
  misCasos: (f: F) => [...financiamientoKeys.all, 'mis-casos', f] as const,
  validacion: (f: F) => [...financiamientoKeys.all, 'validacion', f] as const,
  comite: (f: F) => [...financiamientoKeys.all, 'comite', f] as const,

  stats: () => [...financiamientoKeys.all, 'stats'] as const,
  analistas: () => [...financiamientoKeys.all, 'analistas'] as const,
  detalle: (id: string) => [...financiamientoKeys.all, 'detalle', id] as const,
}
