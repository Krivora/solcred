'use client'

import { useState } from 'react'
import { UserCheck, Loader2, User, AlertCircle } from 'lucide-react'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/shared/components/ui/sheet'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
import { Label } from '@/shared/components/ui/label'
import { CargaBadge } from '@/features/promocion/components/asignacion/CargaBadge'
import type { AnalistaConCarga } from '@/features/financiamiento/types/financiamiento.types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  solicitudIds: string[]
  folio?: string
  analistaActualId?: string
  /** En un lote: cuántas de las seleccionadas ya tienen analista (se reasignarán). */
  yaAsignadas?: number
  analistas: AnalistaConCarga[]
  cargandoAnalistas: boolean
  asignando: boolean
  onConfirmar: (analistaId: string, motivo?: string) => void
}

function AnalistaOpcion({
  analista, seleccionado, onSeleccionar,
}: {
  analista: AnalistaConCarga
  seleccionado: boolean
  onSeleccionar: () => void
}) {
  const iniciales = `${analista.nombre[0] ?? ''}${analista.apellidoPaterno[0] ?? ''}`.toUpperCase()
  return (
    <button
      onClick={onSeleccionar}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150 ${
        seleccionado ? 'border-primary bg-primary/5 shadow-sm' : 'border-border/60 hover:border-primary/30 hover:bg-accent/40'
      }`}
    >
      <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${
        seleccionado ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'
      }`}>
        {iniciales}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {analista.nombre} {analista.apellidoPaterno}
        </p>
        <p className="text-xs text-muted-foreground truncate">{analista.correo}</p>
      </div>
      <CargaBadge carga={analista.cargaActual} />
    </button>
  )
}

export function AsignarAnalistaSheet({
  open, onOpenChange, solicitudIds, folio, analistaActualId, yaAsignadas = 0,
  analistas, cargandoAnalistas, asignando, onConfirmar,
}: Props) {
  const [analistaId, setAnalistaId] = useState<string | null>(null)
  const [motivo, setMotivo] = useState('')

  const esLote = solicitudIds.length > 1
  const esReasignacion = !esLote && !!analistaActualId

  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) { setAnalistaId(null); setMotivo('') }
  }

  const puedeConfirmar =
    !!analistaId && solicitudIds.length > 0 && (esLote || analistaId !== analistaActualId)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 py-5 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <UserCheck className="h-4 w-4 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-base">
                {esLote ? 'Asignar analista' : esReasignacion ? 'Reasignar analista' : 'Asignar analista'}
              </SheetTitle>
              <SheetDescription className="text-xs mt-0.5">
                {esLote ? (
                  <><span className="font-semibold text-foreground">{solicitudIds.length}</span> solicitudes seleccionadas</>
                ) : (
                  <>Folio <span className="font-mono font-semibold text-foreground">{folio}</span></>
                )}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {esLote && yaAsignadas > 0 && (
            <div className="flex items-start gap-2 rounded-lg border border-warn/25 bg-warn-surface px-3 py-2 text-xs text-warn-ink">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>
                <span className="font-semibold">{yaAsignadas}</span> de{' '}
                <span className="font-semibold">{solicitudIds.length}</span> ya tienen analista y
                serán <span className="font-semibold">reasignadas</span>.
              </span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs font-semibold text-foreground">Selecciona un analista</Label>
              <span className="text-[10px] text-muted-foreground">{analistas.length} disponibles</span>
            </div>
            {cargandoAnalistas ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Cargando analistas…</p>
            ) : analistas.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <div className="p-3 bg-muted rounded-full"><User className="h-5 w-5 text-muted-foreground" /></div>
                <p className="text-sm text-muted-foreground">
                  No hay analistas. Da de alta un usuario con rol Analista en Configuración.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {analistas.map((a) => (
                  <AnalistaOpcion
                    key={a.id}
                    analista={a}
                    seleccionado={analistaId === a.id}
                    onSeleccionar={() => setAnalistaId(a.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {(esReasignacion || analistaId) && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="motivo-fin" className="text-xs font-semibold text-foreground">
                {esReasignacion ? 'Motivo de reasignación' : 'Comentario'}
                {!esReasignacion && <span className="text-muted-foreground font-normal ml-1">(opcional)</span>}
              </Label>
              <Textarea
                id="motivo-fin"
                placeholder={esReasignacion ? 'Indica el motivo de la reasignación…' : 'Algún comentario sobre esta asignación…'}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="resize-none text-sm border-border/60 focus-visible:border-primary/50 focus-visible:ring-primary/20"
                rows={3}
              />
              {esReasignacion && !motivo.trim() && (
                <div className="flex items-center gap-1.5 text-xs text-warn-ink">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>Se recomienda indicar el motivo de la reasignación</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border/60 flex items-center gap-3">
          <Button variant="outline" className="flex-1 border-border/60" onClick={() => onOpenChange(false)} disabled={asignando}>
            Cancelar
          </Button>
          <Button
            className="flex-1 bg-primary hover:bg-primary/90"
            onClick={() => analistaId && onConfirmar(analistaId, motivo.trim() || undefined)}
            disabled={!puedeConfirmar || asignando}
          >
            {asignando ? (
              <><Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />Asignando…</>
            ) : esReasignacion ? 'Reasignar' : esLote ? `Asignar ${solicitudIds.length} solicitudes` : 'Asignar'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
