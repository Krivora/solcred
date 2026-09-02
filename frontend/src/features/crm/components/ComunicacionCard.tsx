'use client'

import { Pencil } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { MotivoBadge, ResultadoBadge, TipoBadge } from '@/features/crm/components/CrmBadges'
import { formatearFechaContacto, tiempoRelativo } from '@/features/crm/lib/crm.config'
import type { Comunicacion } from '@/features/crm/types/crm.types'

interface Props {
  comunicacion: Comunicacion
  /** Muestra el folio de la solicitud (vista por-cliente). */
  mostrarFolio?: boolean
  canEdit?: boolean
  onEditar?: (c: Comunicacion) => void
}

export function ComunicacionCard({ comunicacion: c, mostrarFolio, canEdit, onEditar }: Props) {
  const autor = `${c.registradoPor.nombre} ${c.registradoPor.apellidoPaterno}`

  return (
    <article className="rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <TipoBadge tipo={c.tipo} />
            {mostrarFolio && (
              <span className="text-[11px] font-medium text-muted-foreground">
                Folio {c.solicitud.folio}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatearFechaContacto(c.fechaContacto)} · {autor}
          </p>
        </div>

        {canEdit && onEditar && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 px-2 text-xs text-muted-foreground"
            onClick={() => onEditar(c)}
          >
            <Pencil className="size-3" />
            Editar
          </Button>
        )}
      </div>

      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <dt className="text-xs text-muted-foreground">Motivo</dt>
          <dd>
            <MotivoBadge motivo={c.motivo} />
          </dd>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <dt className="text-xs text-muted-foreground">Resultado</dt>
          <dd>
            <ResultadoBadge resultado={c.resultado} />
          </dd>
        </div>
        {c.observaciones && (
          <div className="pt-1">
            <dt className="text-xs text-muted-foreground">Observaciones</dt>
            <dd className="mt-0.5 whitespace-pre-wrap leading-relaxed text-foreground">
              {c.observaciones}
            </dd>
          </div>
        )}
      </dl>

      {c.editadoEn && (
        <p className="mt-2 text-[10px] text-muted-foreground">
          Editada {tiempoRelativo(c.editadoEn)}
        </p>
      )}
    </article>
  )
}
