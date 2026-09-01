import { AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { DashboardCard } from './DashboardCard'
import type { PanoramaAlerta } from '@/features/dashboard/types/dashboard.types'

export function AlertasPanel({ alertas }: { alertas: PanoramaAlerta[] }) {
  return (
    <DashboardCard
      title="Requiere atención"
      description="Casos fuera de los tiempos esperados"
    >
      {alertas.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <CheckCircle2 className="size-7 text-success" />
          <p className="text-sm text-muted-foreground">Todo dentro de los tiempos objetivo.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {alertas.map((a) => {
            const critico = a.nivel === 'critico'
            const Icon = critico ? ShieldAlert : AlertTriangle
            return (
              <li
                key={a.id}
                className={cn(
                  'flex items-center gap-3 rounded-lg border px-3 py-2.5',
                  critico
                    ? 'border-destructive/30 bg-destructive/[0.06]'
                    : 'border-warning/30 bg-warning/[0.08]',
                )}
              >
                <span
                  className={cn(
                    'grid size-8 shrink-0 place-items-center rounded-lg',
                    critico ? 'bg-destructive/15 text-destructive' : 'bg-warning/15 text-warning',
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span
                  className={cn(
                    'text-lg font-bold tabular-nums',
                    critico ? 'text-destructive' : 'text-warning',
                  )}
                >
                  {a.total}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-semibold text-foreground">
                    {a.titulo}
                  </span>
                  <span className="block truncate text-[11px] text-muted-foreground">{a.detalle}</span>
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </DashboardCard>
  )
}
