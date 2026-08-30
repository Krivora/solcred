import type {
  FiltrosPromocion,
  FiltrosAprobacion,
  FiltrosMisCasos,
} from '@/features/promocion/types/solicitud.types'

export const promocionKeys = {
  all: ['promocion'] as const,

  listados: () => [...promocionKeys.all, 'listado'] as const,
  listado: (filtros: FiltrosPromocion) => [...promocionKeys.listados(), filtros] as const,

  aprobacion: (filtros: FiltrosAprobacion) => [...promocionKeys.all, 'aprobacion', filtros] as const,
  historico: (filtros: FiltrosAprobacion) => [...promocionKeys.all, 'historico', filtros] as const,
  misCasos: (filtros: FiltrosMisCasos) => [...promocionKeys.all, 'mis-casos', filtros] as const,

  detalles: () => [...promocionKeys.all, 'detalle'] as const,
  detalle: (id: string) => [...promocionKeys.detalles(), id] as const,

  stats: () => [...promocionKeys.all, 'stats'] as const,
  gestores: () => [...promocionKeys.all, 'gestores'] as const,
}