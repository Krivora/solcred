import { AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { DashboardCard } from './DashboardCard'
import type { PanoramaAlerta } from '@/features/dashboard/types/dashboard.types'

/** Crítico primero y, dentro de cada nivel, el volumen más alto primero — lo más urgente arriba. */
function porUrgencia(a: PanoramaAlerta, b: PanoramaAlerta) {
  if (a.nivel !== b.nivel) return a.nivel === 'critico' ? -1 : 1
  return b.total - a.total
}

export function AlertasPanel({ alertas }: { alertas: PanoramaAlerta[] }) {
  const ordenadas = [...alertas].sort(porUrgencia)

  return (
    <DashboardCard
      title="Requiere atención"
      description="Casos fuera de los tiempos esperados"
    >
      {ordenadas.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <CheckCircle2 className="size-7 text-ok-ink" />
          <p className="text-body-sm text-muted-foreground">Todo dentro de los tiempos objetivo.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {ordenadas.map((a) => {
            const critico = a.nivel === 'critico'
            const Icon = critico ? ShieldAlert : AlertTriangle
            return (
              <li
                key={a.id}
                className={cn(
                  'flex items-center gap-3 rounded-lg border px-3 py-2.5',
                  critico ? 'border-danger/30 bg-danger-surface' : 'border-warn/30 bg-warn-surface',
                )}
              >
                <span
                  className={cn(
                    'grid size-8 shrink-0 place-items-center rounded-lg',
                    critico ? 'bg-danger/15 text-danger-ink' : 'bg-warn/15 text-warn-ink',
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span
                  className={cn(
                    'text-title tabular-nums',
                    critico ? 'text-danger-ink' : 'text-warn-ink',
                  )}
                >
                  {a.total}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body-sm font-semibold text-foreground">
                    {a.titulo}
                  </span>
                  <span className="block truncate text-caption text-muted-foreground">{a.detalle}</span>
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </DashboardCard>
  )
}
