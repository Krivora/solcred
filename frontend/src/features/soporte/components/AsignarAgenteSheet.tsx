'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { AvatarIniciales } from '@/shared/components/common/AvatarIniciales'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { cn } from '@/shared/lib/cn'
import { TICKET_PRIORIDAD_VALUES } from '@/shared/types/domain.enums'
import { PRIORIDAD_TICKET } from '@/features/soporte/lib/soporte.config'
import { useAgentesSoporte } from '@/features/soporte/hooks/useSoporteQueries'
import type { TicketPrioridad } from '@/features/soporte/types/soporte.types'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  prioridadActual: TicketPrioridad
  agenteActualId?: string | null
  yaAsignado: boolean
  asignando: boolean
  onConfirmar: (agenteId: string, prioridad?: TicketPrioridad) => void
}

export function AsignarAgenteSheet({
  open,
  onOpenChange,
  prioridadActual,
  agenteActualId,
  yaAsignado,
  asignando,
  onConfirmar,
}: Props) {
  const { data: agentes, isLoading } = useAgentesSoporte(open)
  const [seleccionado, setSeleccionado] = useState<string | null>(null)
  const [prioridad, setPrioridad] = useState<TicketPrioridad>(prioridadActual)

  const elegido = seleccionado ?? agenteActualId ?? null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{yaAsignado ? 'Reasignar ticket' : 'Asignar ticket'}</SheetTitle>
          <SheetDescription>
            {yaAsignado
              ? 'Elige otro agente. El SLA no se reinicia.'
              : 'Elige un agente y confirma la prioridad. El SLA arranca al asignar.'}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-4 py-4">
          {!yaAsignado && (
            <div className="space-y-1.5">
              <Label>Prioridad</Label>
              <Select value={prioridad} onValueChange={(v) => setPrioridad(v as TicketPrioridad)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TICKET_PRIORIDAD_VALUES.map((p) => (
                    <SelectItem key={p} value={p}>{PRIORIDAD_TICKET[p].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Agente</Label>
            <div className="max-h-[46vh] space-y-1 overflow-y-auto">
              {isLoading ? (
                <p className="py-6 text-center text-xs text-muted-foreground">Cargando agentes…</p>
              ) : (agentes ?? []).length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">No hay agentes disponibles</p>
              ) : (
                (agentes ?? []).map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setSeleccionado(a.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors',
                      elegido === a.id ? 'border-primary bg-primary/5' : 'border-border/60 hover:bg-accent/40',
                    )}
                  >
                    <AvatarIniciales nombre={a.nombre} tamano="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{a.nombre}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {a.ticketsAbiertos} ticket{a.ticketsAbiertos === 1 ? '' : 's'} abierto{a.ticketsAbiertos === 1 ? '' : 's'}
                      </p>
                    </div>
                    {elegido === a.id && <Check className="size-4 shrink-0 text-primary" />}
                  </button>
                ))
              )}
            </div>
          </div>

          <Button
            className="w-full"
            disabled={!elegido || asignando || (yaAsignado && elegido === agenteActualId)}
            onClick={() => elegido && onConfirmar(elegido, yaAsignado ? undefined : prioridad)}
          >
            {asignando ? 'Asignando…' : yaAsignado ? 'Reasignar' : 'Asignar'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
