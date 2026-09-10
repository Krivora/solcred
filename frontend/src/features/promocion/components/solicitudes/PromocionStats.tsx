// components/admin/solicitudes/PromocionStats.tsx
import { FileText, Clock, Search, LayoutDashboard } from 'lucide-react'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { cn } from '@/shared/lib/cn'
import type { StatsPromocion } from '@/features/promocion/types/solicitud.types'

interface Props {
  stats: StatsPromocion | null
  cargando: boolean
}

const STATS_CONFIG = [
  { key: 'total' as const, label: 'Total', icon: LayoutDashboard, valueClass: 'text-ink', iconClass: 'text-ink-subtle' },
  { key: 'borrador' as const, label: 'Borrador', icon: FileText, valueClass: 'text-ink-muted', iconClass: 'text-ink-subtle' },
  { key: 'pendiente' as const, label: 'Pendiente', icon: Clock, valueClass: 'text-warn-ink', iconClass: 'text-warn-ink' },
  { key: 'enRevision' as const, label: 'En revisión', icon: Search, valueClass: 'text-brand-ink', iconClass: 'text-brand-ink' },
]

export function PromocionStats({ stats, cargando }: Props) {
  if (cargando) {
    return (
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-hairline bg-card p-4">
            <Skeleton className="h-3 w-14 mb-3" />
            <Skeleton className="h-7 w-12" />
          </div>
        ))}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {STATS_CONFIG.map(({ key, label, icon: Icon, valueClass, iconClass }) => (
        <div key={key} className="rounded-lg border border-hairline bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-label uppercase tracking-wide text-ink-subtle truncate">{label}</p>
            <Icon className={cn('size-3.5 shrink-0', iconClass)} />
          </div>
          <p className={cn('mt-2 text-title tabular-nums leading-none', valueClass)}>
            {(stats[key] ?? 0).toLocaleString('es-MX')}
          </p>
        </div>
      ))}
    </div>
  )
}
