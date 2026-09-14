'use client'

import { Check } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip'
import { TONE, estatusSolicitud } from '@/shared/config/estatus.tokens'
import { calcularProgreso, type HitoResuelto } from '@/features/expediente/lib/progreso.config'
import type { EstatusSolicitud } from '@/shared/types/solicitudes.types'
import type { HistorialEstatusItem } from '@/features/expediente/types/expediente.types'

interface Props {
  estatus: EstatusSolicitud
  historialEstatus: HistorialEstatusItem[]
}

const FMT_FECHA = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

/**
 * Línea de tiempo horizontal de los hitos del proceso, para que el
 * solicitante ubique en un vistazo dónde está su crédito y qué sigue. No
 * reemplaza el timeline interno (`SolicitudTimeline`, evento por evento para
 * staff) — este es un resumen de 8 pasos, pensado para el cliente.
 *
 * El color/ícono del paso "actual" y del cierre (rechazo/cancelación) se
 * toman de `ESTATUS_SOLICITUD` (misma fuente que pinta el estatus en toda la
 * app) en vez de definir un tono nuevo — un paso completado siempre se ve
 * "success" sin importar qué estatus interno haya sido.
 */
export function SolicitudProgreso({ estatus, historialEstatus }: Props) {
  const { hitos, terminal } = calcularProgreso(estatus, historialEstatus)
  const tokenActual = estatusSolicitud(estatus)
  const tokenTerminal = terminal ? estatusSolicitud(terminal.tipo) : null

  return (
    <div className="overflow-x-auto rounded-lg border border-hairline bg-surface p-4">
      <ol className="flex min-w-max items-start">
        {hitos.map((hito, i) => {
          const esUltimo = i === hitos.length - 1
          const esCierre = esUltimo && terminal

          const label = esCierre ? tokenTerminal!.label : hito.label
          const descripcion = esCierre ? terminal.descripcion : hito.descripcion
          const Icon = esCierre
            ? tokenTerminal!.icon
            : hito.estado === 'actual'
              ? tokenActual.icon
              : null
          const chip = esCierre
            ? TONE[tokenTerminal!.tone].chip
            : hito.estado === 'completado'
              ? TONE.success.chip
              : hito.estado === 'actual'
                ? TONE[tokenActual.tone].chip
                : TONE.neutral.chip
          const lineaActiva = esCierre || hito.estado === 'completado'

          return (
            <li key={hito.key} className="flex flex-1">
              <div className="flex flex-1 flex-col items-center">
                <div className="flex w-full items-center">
                  <span
                    className={cn(
                      'h-px flex-1',
                      i === 0 ? 'opacity-0' : lineaActiva || hitos[i - 1].estado === 'completado' ? 'bg-ok/50' : 'bg-hairline',
                    )}
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          'grid size-7 shrink-0 place-items-center rounded-full ring-1 transition-colors',
                          chip,
                        )}
                        aria-label={`${label}: ${descripcion}`}
                      >
                        {hito.estado === 'completado' && !esCierre ? (
                          <Check className="size-3.5" />
                        ) : Icon ? (
                          <Icon className="size-3.5" />
                        ) : (
                          <span className="size-1.5 rounded-full bg-current" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-56">
                      <div className="text-left">
                        <p className="font-medium">{label}</p>
                        <p className="mt-0.5 text-background/70">{descripcion}</p>
                        {hito.alcanzadoEn && (
                          <p className="mt-1 text-background/50">
                            Alcanzado el {FMT_FECHA.format(new Date(hito.alcanzadoEn))}
                          </p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                  <span
                    className={cn(
                      'h-px flex-1',
                      esUltimo ? 'opacity-0' : hito.estado === 'completado' ? 'bg-ok/50' : 'bg-hairline',
                    )}
                  />
                </div>
                <span
                  className={cn(
                    'mt-2 max-w-20 text-center text-caption leading-tight',
                    hito.estado === 'pendiente' && !esCierre ? 'text-ink-subtle' : 'font-medium text-ink',
                  )}
                >
                  {label}
                </span>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/** Reexport por conveniencia para quien solo necesite el tipo. */
export type { HitoResuelto }
