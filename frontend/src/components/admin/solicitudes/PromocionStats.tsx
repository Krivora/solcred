// components/admin/solicitudes/PromocionStats.tsx
import { FileText, Clock, Search, CheckCircle, XCircle, LayoutDashboard } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { StatsPromocion } from '@/lib/types/solicitudes.types'

interface Props {
  stats: StatsPromocion | null
  cargando: boolean
}

const STATS_CONFIG = [
  {
    key: 'total' as const,
    label: 'Total',
    icon: LayoutDashboard,
    colorClass: 'text-foreground',
    bgClass: 'bg-muted',
  },
  {
    key: 'borrador' as const,
    label: 'Borrador',
    icon: FileText,
    colorClass: 'text-muted-foreground',
    bgClass: 'bg-muted',
  },
  {
    key: 'pendiente' as const,
    label: 'Pendiente',
    icon: Clock,
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-50 dark:bg-amber-950/40',
  },
  {
    key: 'enRevision' as const,
    label: 'En revisión',
    icon: Search,
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-50 dark:bg-blue-950/40',
  },
]

export function PromocionStats({ stats, cargando }: Props) {
  if (cargando) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-border/60">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-7 w-10" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {STATS_CONFIG.map(({ key, label, icon: Icon, colorClass, bgClass }) => (
        <Card
          key={key}
          className="border-border/60 hover:shadow-sm transition-shadow duration-200"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
                {label}
              </span>
              <span className={`p-1.5 rounded-md ${bgClass}`}>
                <Icon className={`h-3.5 w-3.5 ${colorClass}`} />
              </span>
            </div>
            <p className={`text-2xl font-semibold tabular-nums ${colorClass}`}>
              {(stats[key] ?? 0).toLocaleString('es-MX')}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}