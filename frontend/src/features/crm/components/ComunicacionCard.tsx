'use client'

import { Pencil } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { ResultadoChip, TipoTag } from '@/features/crm/components/CrmBadges'
import { LABEL_MOTIVO_CORTO, formatearFechaContacto, tiempoRelativo } from '@/features/crm/lib/crm.config'
import type { Comunicacion } from '@/features/crm/types/crm.types'

interface Props {
  comunicacion: Comunicacion
  /** Muestra el folio de la solicitud (vista por-cliente). */
  mostrarFolio?: boolean
  canEdit?: boolean
  onEditar?: (c: Comunicacion) => void
  /** Última del hilo — sin línea de continuación. */
  ultima?: boolean
}

/**
 * Entrada del historial: riel de timeline a la izquierda, sin caja. La fecha y
 * el autor van como caption, el motivo como texto y queda un solo chip de estado.
 */
export function ComunicacionCard({ comunicacion: c, mostrarFolio, canEdit, onEditar, ultima }: Props) {
  const autor = `${c.registradoPor.nombre} ${c.registradoPor.apellidoPaterno}`

  return (
    <article className="relative flex gap-3 pb-5 last:pb-0">
      {/* Riel */}
      <div className="relative flex w-4 shrink-0 justify-center">
        <span className="z-10 mt-1 size-2 rounded-full bg-brand ring-4 ring-card" />
        {!ultima && <span className="absolute top-3 bottom-0 w-px bg-hairline" />}
      </div>

      {/* Contenido */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <TipoTag tipo={c.tipo} />
            {mostrarFolio && (
              <span className="font-mono text-caption text-ink-subtle">{c.solicitud.folio}</span>
            )}
          </div>
          {canEdit && onEditar && (
            <Button
              variant="ghost"
              size="xs"
              className="-mr-1 shrink-0 text-ink-subtle hover:text-ink"
              onClick={() => onEditar(c)}
            >
              <Pencil className="size-3" />
              Editar
            </Button>
          )}
        </div>

        <p className="mt-1 text-caption text-ink-subtle">
          {formatearFechaContacto(c.fechaContacto)} · {autor}
        </p>

        <p className="mt-2 text-body-sm text-ink">
          <span className="text-ink-subtle">Motivo — </span>
          {LABEL_MOTIVO_CORTO[c.motivo]}
        </p>

        <div className="mt-2">
          <ResultadoChip resultado={c.resultado} />
        </div>

        {c.observaciones && (
          <p className="mt-2 max-w-prose text-body-sm leading-relaxed whitespace-pre-wrap text-ink-muted">
            {c.observaciones}
          </p>
        )}

        {c.editadoEn && (
          <p className="mt-1.5 text-caption text-ink-subtle">Editada {tiempoRelativo(c.editadoEn)}</p>
        )}
      </div>
    </article>
  )
}
