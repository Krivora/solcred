/**
 * Factorías de query keys para el feature settings.
 * Mismo patrón que `promocionKeys` (features/promocion/lib/promocion.keys.ts):
 * `.all` es la raíz que se invalida tras cualquier mutación del dominio.
 */

export const programaKeys = {
  all: ['settings', 'programas'] as const,
  lists: () => [...programaKeys.all, 'list'] as const,
  list: () => [...programaKeys.lists()] as const,
  detail: (id: string) => [...programaKeys.all, 'detail', id] as const,
}

export const tipoDocumentoKeys = {
  all: ['settings', 'tipos-documento'] as const,
  list: () => [...tipoDocumentoKeys.all, 'list'] as const,
}

export const usuarioKeys = {
  all: ['settings', 'usuarios'] as const,
  list: () => [...usuarioKeys.all, 'list'] as const,
}

export const grupoKeys = {
  all: ['settings', 'grupos'] as const,
  list: () => [...grupoKeys.all, 'list'] as const,
}

export const logKeys = {
  all: ['settings', 'logs'] as const,
  lists: () => [...logKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...logKeys.lists(), params] as const,
  resumen: () => [...logKeys.all, 'resumen'] as const,
  detail: (id: string) => [...logKeys.all, 'detail', id] as const,
}
