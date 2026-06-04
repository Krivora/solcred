// components/admin/solicitudes/PromocionStats.tsx
import { FileText, Clock, Search, LayoutDashboard } from 'lucide-react'
import { Skeleton } from '@/shared/components/ui/skeleton'
import type { StatsPromocion } from '@/shared/lib/types/solicitudes.types'

interface Props {
  stats: StatsPromocion | null
  cargando: boolean
}

const STATS_CONFIG = [
  {
    key: 'total' as const,
    label: 'Total',
    icon: LayoutDashboard,
    valueClass: 'text-foreground',
    iconWrapClass: 'bg-primary/10',
    iconClass: 'text-primary',
    borderClass: 'border-border/60',
    accentBar: 'bg-primary',
  },
  {
    key: 'borrador' as const,
    label: 'Borrador',
    icon: FileText,
    valueClass: 'text-muted-foreground',
    iconWrapClass: 'bg-muted',
    iconClass: 'text-muted-foreground',
    borderClass: 'border-border/60',
    accentBar: 'bg-muted-foreground/40',
  },
  {
    key: 'pendiente' as const,
    label: 'Pendiente',
    icon: Clock,
    valueClass: 'text-amber-600 dark:text-amber-400',
    iconWrapClass: 'bg-amber-100 dark:bg-amber-950/50',
    iconClass: 'text-amber-600 dark:text-amber-400',
    borderClass: 'border-amber-200/60 dark:border-amber-800/40',
    accentBar: 'bg-amber-500',
  },
  {
    key: 'enRevision' as const,
    label: 'En revisión',
    icon: Search,
    valueClass: 'text-primary',
    iconWrapClass: 'bg-primary/10',
    iconClass: 'text-primary',
    borderClass: 'border-primary/20',
    accentBar: 'bg-primary',
  },
]

export function PromocionStats({ stats, cargando }: Props) {
  if (cargando) {
    return (
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/60 bg-card p-4 overflow-hidden relative">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-muted animate-pulse" />
            <Skeleton className="h-3 w-14 mb-3" />
            <Skeleton className="h-8 w-12" />
          </div>
        ))}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {STATS_CONFIG.map(({ key, label, icon: Icon, valueClass, iconWrapClass, iconClass, borderClass, accentBar }) => (
        <div
          key={key}
          className={`rounded-xl border ${borderClass} bg-card p-4 overflow-hidden relative hover:shadow-sm transition-all duration-200 group`}
        >
          {/* Accent bar top */}
          <div className={`absolute inset-x-0 top-0 h-0.5 ${accentBar} opacity-70 group-hover:opacity-100 transition-opacity`} />

          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2.5 truncate">
                {label}
              </p>
              <p className={`text-3xl font-semibold tabular-nums leading-none ${valueClass}`}>
                {(stats[key] ?? 0).toLocaleString('es-MX')}
              </p>
            </div>
            <div className={`shrink-0 p-2 rounded-lg ${iconWrapClass}`}>
              <Icon className={`h-4 w-4 ${iconClass}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}