'use client'

import { UserCheck, Inbox } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

interface Props {
  total: number
  cargando: boolean
  seleccionadas: Set<string>
  todoSeleccionado: boolean
  onToggleTodos: () => void
  onAsignarLote: () => void
}

export function AsignacionAnalistaToolbar({
  total, cargando, seleccionadas, todoSeleccionado, onToggleTodos, onAsignarLote,
}: Props) {
  const haySeleccion = seleccionadas.size > 0

  return (
    <div className="px-4 py-3 border-b border-border/40 flex items-center gap-3">
      <div
        onClick={onToggleTodos}
        className={cn(
          'shrink-0 w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors',
          todoSeleccionado ? 'bg-primary border-primary' : 'border-border/60 hover:border-primary/40',
        )}
      >
        {todoSeleccionado && <span className="text-primary-foreground text-[9px]">✓</span>}
        {!todoSeleccionado && haySeleccion && <span className="text-primary text-[9px]">—</span>}
      </div>

      {haySeleccion ? (
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs text-muted-foreground">{seleccionadas.size} seleccionadas</span>
          <Button size="sm" className="h-7 gap-1.5 text-xs bg-primary hover:bg-primary/90" onClick={onAsignarLote}>
            <UserCheck className="h-3 w-3" />
            Asignar analista
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-1">
          <Inbox className="h-3.5 w-3.5" />
          <span>{cargando ? 'Cargando…' : `${total} solicitudes`}</span>
        </div>
      )}
    </div>
  )
}
