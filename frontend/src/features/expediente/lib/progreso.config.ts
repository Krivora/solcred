import type { EstatusSolicitud } from '@/shared/types/solicitudes.types'
import type { HistorialEstatusItem } from '@/features/expediente/types/expediente.types'

export interface Hito {
  key: string
  label: string
  descripcion: string
  /** Estatus del dominio que corresponden a este hito (varios internos se
   *  agrupan en uno solo: el cliente no necesita ver la cola interna de
   *  asignación de analista como un paso aparte de "Análisis"). */
  estatus: EstatusSolicitud[]
}

/**
 * Los 8 hitos del proceso, en el orden en que el cliente los recorre.
 * `EN_CORRECCION` se agrupa con "En revisión" (es el mismo paso, con una
 * acción pendiente del cliente) en vez de ser un hito aparte.
 */
export const HITOS: Hito[] = [
  {
    key: 'enviada',
    label: 'Solicitud enviada',
    descripcion: 'Tu solicitud fue enviada y quedó en fila para asignarse a un gestor.',
    estatus: ['PENDIENTE'],
  },
  {
    key: 'revision',
    label: 'En revisión',
    descripcion: 'Un gestor está revisando la información y documentación de tu solicitud.',
    estatus: ['EN_REVISION', 'EN_CORRECCION'],
  },
  {
    key: 'aprobacion',
    label: 'Aprobación',
    descripcion: 'Tu solicitud se envió a aprobación interna antes de pasar a financiamiento.',
    estatus: ['EN_APROBACION'],
  },
  {
    key: 'mesa_control',
    label: 'Mesa de control',
    descripcion: 'Mesa de Control valida tu solicitud antes de turnarla a análisis de crédito.',
    estatus: ['EN_FINANCIAMIENTO'],
  },
  {
    key: 'analisis',
    label: 'Análisis',
    descripcion: 'Un analista de crédito evalúa tu capacidad de pago y tu información financiera.',
    estatus: ['EN_ASIGNACION', 'EN_ANALISIS'],
  },
  {
    key: 'validacion',
    label: 'Validación',
    descripcion: 'El análisis financiero se revisa y valida antes de turnarse a comité.',
    estatus: ['EN_VALIDACION'],
  },
  {
    key: 'comite',
    label: 'Comité de crédito',
    descripcion: 'El comité evalúa tu solicitud para tomar la decisión final.',
    estatus: ['EN_COMITE'],
  },
  {
    key: 'autorizada',
    label: 'Autorizada',
    descripcion: 'Tu crédito fue autorizado.',
    estatus: ['APROBADO'],
  },
]

export type EstadoHito = 'completado' | 'actual' | 'pendiente'

export interface HitoResuelto extends Hito {
  estado: EstadoHito
  /** Cuándo se alcanzó (primera vez que el historial registra uno de sus
   *  estatus). `null` si aún no se llega o si no hay historial disponible. */
  alcanzadoEn: string | null
}

export interface ProgresoSolicitud {
  hitos: HitoResuelto[]
  /** No nulo si el proceso terminó fuera del camino feliz: reemplaza la
   *  etiqueta/tono del último hito ("Autorizada") en vez de fingir que llegó ahí. */
  terminal: { tipo: 'RECHAZADO' | 'CANCELADO'; descripcion: string } | null
}

const indiceDeEstatus = (estatus: EstatusSolicitud): number =>
  HITOS.findIndex((h) => h.estatus.includes(estatus))

/**
 * Resuelve el estado de cada hito a partir del estatus actual y (si está
 * disponible) el historial de transiciones.
 *
 * Para BORRADOR ningún hito se ha alcanzado. Para RECHAZADO/CANCELADO —
 * estatus terminales que no pertenecen a ningún hito del camino feliz — se
 * busca en el historial la última transición ANTES del cierre para saber
 * hasta dónde llegó realmente el proceso, en vez de asumir que avanzó todo
 * el camino o que no avanzó nada.
 */
export function calcularProgreso(
  estatusActual: EstatusSolicitud,
  historial: HistorialEstatusItem[] = [],
): ProgresoSolicitud {
  const primeraFechaPorHito = new Map<string, string>()
  for (const h of historial) {
    const idx = indiceDeEstatus(h.estatusNuevo)
    if (idx === -1) continue
    const key = HITOS[idx].key
    if (!primeraFechaPorHito.has(key)) primeraFechaPorHito.set(key, h.creadoEn)
  }

  let indiceActual: number
  let terminal: ProgresoSolicitud['terminal'] = null

  if (estatusActual === 'BORRADOR') {
    indiceActual = -1
  } else if (estatusActual === 'RECHAZADO' || estatusActual === 'CANCELADO') {
    // Último estatus del camino feliz visitado antes del cierre.
    let ultimoAlcanzado = -1
    for (const h of historial) {
      const idx = indiceDeEstatus(h.estatusNuevo)
      if (idx !== -1) ultimoAlcanzado = Math.max(ultimoAlcanzado, idx)
    }
    indiceActual = ultimoAlcanzado
    terminal = {
      tipo: estatusActual,
      descripcion:
        estatusActual === 'RECHAZADO'
          ? 'Tu solicitud no fue aprobada. Consulta el motivo en el detalle de tu expediente.'
          : 'Esta solicitud fue cancelada y no continuará su proceso.',
    }
  } else {
    const idx = indiceDeEstatus(estatusActual)
    indiceActual = idx === -1 ? -1 : idx
  }

  const hitos: HitoResuelto[] = HITOS.map((hito, i) => {
    const completado = terminal ? i <= indiceActual : i < indiceActual
    const esActual = !terminal && i === indiceActual
    return {
      ...hito,
      estado: completado ? 'completado' : esActual ? 'actual' : 'pendiente',
      alcanzadoEn: i <= indiceActual ? (primeraFechaPorHito.get(hito.key) ?? null) : null,
    }
  })

  return { hitos, terminal }
}
