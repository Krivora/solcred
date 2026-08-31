import { cn } from '@/shared/lib/cn'
import { CargaBadge } from '@/features/promocion/components/asignacion/CargaBadge'
import type { AnalistaConCarga } from '@/features/financiamiento/types/financiamiento.types'

type Nivel = 'libre' | 'ocupado' | 'lleno'

function nivelCarga(carga: number, max = 20): Nivel {
  const r = carga / max
  if (r < 0.3) return 'libre'
  if (r < 0.7) return 'ocupado'
  return 'lleno'
}

const NIVEL_STYLES: Record<Nivel, string> = {
  libre: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  ocupado: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  lleno: 'bg-destructive/10 text-destructive',
}

export function AnalistaCard({ analista }: { analista: AnalistaConCarga }) {
  const iniciales = `${analista.nombre[0] ?? ''}${analista.apellidoPaterno[0] ?? ''}`.toUpperCase()
  const nivel = nivelCarga(analista.cargaActual)

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40 last:border-0">
      <div className={cn('shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold', NIVEL_STYLES[nivel])}>
        {iniciales}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground truncate">
          {analista.nombre} {analista.apellidoPaterno}
        </p>
        <p className="text-[10px] text-muted-foreground truncate">{analista.correo}</p>
      </div>
      <CargaBadge carga={analista.cargaActual} />
    </div>
  )
}
