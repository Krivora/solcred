import type { FiltrosReporte } from '@/features/reportes/types/reportes.types'

export const FILTROS_INICIALES: FiltrosReporte = {
  estatus: [],
  sector: [],
  tamanoEmpresa: [],
  tipoPersona: [],
  programaId: [],
  gestorId: [],
  analistaId: [],
  grupoId: [],
  fechaDesde: '',
  fechaHasta: '',
  fechaResueltaDesde: '',
  fechaResueltaHasta: '',
  montoMin: '',
  montoMax: '',
  busqueda: '',
}

const CAMPOS_ARREGLO = [
  'estatus', 'sector', 'tamanoEmpresa', 'tipoPersona',
  'programaId', 'gestorId', 'analistaId', 'grupoId',
] as const satisfies readonly (keyof FiltrosReporte)[]

/** Limpia el estado de filtros del formulario al payload que espera el backend (arreglos/valores vacíos fuera). */
export function construirPayload(f: FiltrosReporte): Record<string, unknown> {
  const payload: Record<string, unknown> = {}

  for (const campo of CAMPOS_ARREGLO) {
    const valor = f[campo] as string[]
    if (valor.length > 0) payload[campo] = valor
  }

  if (f.fechaDesde) payload.fechaDesde = f.fechaDesde
  if (f.fechaHasta) payload.fechaHasta = f.fechaHasta
  if (f.fechaResueltaDesde) payload.fechaResueltaDesde = f.fechaResueltaDesde
  if (f.fechaResueltaHasta) payload.fechaResueltaHasta = f.fechaResueltaHasta
  if (f.montoMin) payload.montoMin = Number(f.montoMin)
  if (f.montoMax) payload.montoMax = Number(f.montoMax)
  if (f.busqueda.trim()) payload.busqueda = f.busqueda.trim()

  return payload
}

/** Cuántos "grupos" de filtro están activos — para el badge del panel y el botón de limpiar. */
export function contarFiltrosActivos(f: FiltrosReporte): number {
  let n = 0
  for (const campo of CAMPOS_ARREGLO) if ((f[campo] as string[]).length > 0) n++
  if (f.fechaDesde || f.fechaHasta) n++
  if (f.fechaResueltaDesde || f.fechaResueltaHasta) n++
  if (f.montoMin || f.montoMax) n++
  if (f.busqueda.trim()) n++
  return n
}
