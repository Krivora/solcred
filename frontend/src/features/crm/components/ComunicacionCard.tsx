'use client'

import { Pencil } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import type { StatusTone } from '@/shared/components/ui/status-chip'
import {
  ICONO_TIPO,
  LABEL_MOTIVO_CORTO,
  LABEL_RESULTADO_CORTO,
  LABEL_TIPO,
  RESULTADO_TONE,
  formatearFechaCorta,
  tiempoRelativo,
} from '@/features/crm/lib/crm.config'
import type { Comunicacion } from '@/features/crm/types/crm.types'

interface Props {
  comunicacion: Comunicacion
  /** Muestra el folio de la solicitud (vista por-cliente). */
  mostrarFolio?: boolean
  canEdit?: boolean
  onEditar?: (c: Comunicacion) => void
}

/** El círculo del tipo se tiñe con el tono del resultado: la columna izquierda
 *  queda como un semáforo del historial. */
const TONO_CIRCULO: Record<StatusTone, string> = {
  ok: 'bg-ok-surface text-ok-ink',
  warn: 'bg-warn-surface text-warn-ink',
  danger: 'bg-danger-surface text-danger-ink',
  info: 'bg-info-surface text-info-ink',
  neutral: 'bg-surface-sunken text-ink-muted',
}
const TONO_TEXTO: Record<StatusTone, string> = {
  ok: 'text-ok-ink',
  warn: 'text-warn-ink',
  danger: 'text-danger-ink',
  info: 'text-info-ink',
  neutral: 'text-ink-muted',
}

/**
 * Una entrada del historial. El motivo es el titular; el tipo lo soporta (el
 * ícono ya lo dice) y el resultado vive en el color del círculo y una palabra
 * en el pie — sin chips que griten.
 */
export function ComunicacionCard({ comunicacion: c, mostrarFolio, canEdit, onEditar }: Props) {
  const Icon = ICONO_TIPO[c.tipo]
  const tono = RESULTADO_TONE[c.resultado]
  const autor = `${c.registradoPor.nombre} ${c.registradoPor.apellidoPaterno}`

  return (
    <article className="group flex gap-3 py-4 first:pt-1 last:pb-1">
      <div
        className={cn(
          'mt-px flex size-7 shrink-0 items-center justify-center rounded-full',
          TONO_CIRCULO[tono],
        )}
        title={LABEL_RESULTADO_CORTO[c.resultado]}
      >
        <Icon className="size-3.5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-body-sm font-medium text-ink-muted">{LABEL_TIPO[c.tipo]}</span>
          {mostrarFolio && (
            <span className="font-mono text-caption text-ink-subtle">{c.solicitud.folio}</span>
          )}
          {canEdit && onEditar && (
            <button
              type="button"
              onClick={() => onEditar(c)}
              aria-label="Editar comunicación"
              className="ml-auto rounded-md p-1 text-ink-subtle transition-colors hover:bg-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <Pencil className="size-3.5" />
            </button>
          )}
        </div>

        <p className="mt-1 text-sm font-semibold text-ink">{LABEL_MOTIVO_CORTO[c.motivo]}</p>

        {c.observaciones && (
          <p className="mt-1 max-w-prose whitespace-pre-wrap text-body-sm leading-relaxed text-ink-muted">
            {c.observaciones}
          </p>
        )}

        <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-caption text-ink-subtle">
          <span className={cn('font-medium', TONO_TEXTO[tono])}>
            {LABEL_RESULTADO_CORTO[c.resultado]}
          </span>
          <span aria-hidden>·</span>
          <span>{formatearFechaCorta(c.fechaContacto)}</span>
          <span aria-hidden>·</span>
          <span>{autor}</span>
          {c.editadoEn && (
            <>
              <span aria-hidden>·</span>
              <span>editada {tiempoRelativo(c.editadoEn)}</span>
            </>
          )}
        </p>
      </div>
    </article>
  )
}
