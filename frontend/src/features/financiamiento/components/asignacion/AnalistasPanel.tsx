'use client'

import { RefreshCw, Users } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { cn } from '@/shared/lib/cn'
import { AnalistaCard } from './AnalistaCard'
import type { AnalistaConCarga } from '@/features/financiamiento/types/financiamiento.types'

interface Props {
  analistas: AnalistaConCarga[]
  cargando: boolean
  onRecargar: () => void
}

function ListaSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-border/40">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <Skeleton className="h-4 flex-1 rounded" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      ))}
    </div>
  )
}

function CargaDistribucion({ analistas }: { analistas: AnalistaConCarga[] }) {
  const total = analistas.reduce((acc, a) => acc + a.cargaActual, 0)
  const colors = ['bg-primary', 'bg-primary/70', 'bg-primary/50', 'bg-primary/30']
  return (
    <div className="px-4 py-3 border-t border-border/60 bg-muted/20">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Carga total</span>
        <span className="font-semibold tabular-nums">{total} casos</span>
      </div>
      <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
        {analistas.map((a, i) => (
          <div
            key={a.id}
            className={`inline-block h-full ${colors[i % colors.length]}`}
            style={{ width: `${(a.cargaActual / (total || 1)) * 100}%` }}
            title={`${a.nombre}: ${a.cargaActual} casos`}
          />
        ))}
      </div>
    </div>
  )
}

export function AnalistasPanel({ analistas, cargando, onRecargar }: Props) {
  return (
    <div className="w-72 shrink-0 flex flex-col self-start max-h-full">
      <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">Analistas</span>
          <span className="text-[10px] text-muted-foreground">({analistas.length})</span>
        </div>
        <Button
          variant="ghost" size="icon"
          className="h-6 w-6 text-muted-foreground"
          onClick={onRecargar}
          disabled={cargando}
        >
          <RefreshCw className={cn('h-3 w-3', cargando && 'animate-spin')} />
        </Button>
      </div>

      <div className="px-4 py-2 border-b border-border/40 flex items-center gap-3">
        {[
          { label: 'Libre', color: 'bg-ok' },
          { label: 'Ocupado', color: 'bg-warn' },
          { label: 'Lleno', color: 'bg-destructive' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${l.color}`} />
            <span className="text-[10px] text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {cargando ? (
          <ListaSkeleton />
        ) : analistas.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center px-4">
            <Users className="h-6 w-6 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Sin analistas disponibles</p>
          </div>
        ) : (
          [...analistas]
            .sort((a, b) => a.cargaActual - b.cargaActual)
            .map((a) => <AnalistaCard key={a.id} analista={a} />)
        )}
      </div>

      {analistas.length > 0 && <CargaDistribucion analistas={analistas} />}
    </div>
  )
}
