import { FileText, Wallet, Calculator } from 'lucide-react'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { formatMontoCompacto, formatEntero } from '@/features/dashboard/lib/dashboard.format'
import { ESTATUS_STYLES } from '@/shared/config/solicitudes.config'
import { cn } from '@/shared/lib/cn'
import type { ResumenReporte as ResumenReporteType } from '@/features/reportes/types/reportes.types'

interface Props {
  resumen: ResumenReporteType | null
  cargando: boolean
}

function Tile({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3.5 shadow-sm">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate font-mono text-lg font-semibold text-foreground tabular-nums">{value}</p>
      </div>
    </div>
  )
}

export function ResumenReporte({ resumen, cargando }: Props) {
  if (cargando && !resumen) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[62px] rounded-xl" />
        ))}
      </div>
    )
  }
  if (!resumen) return null

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Tile icon={FileText} label="Solicitudes encontradas" value={formatEntero(resumen.totalSolicitudes)} />
      <Tile icon={Wallet} label="Monto total" value={formatMontoCompacto(resumen.montoTotal)} />
      <Tile icon={Calculator} label="Monto promedio" value={formatMontoCompacto(resumen.montoPromedio)} />

      <div className="col-span-2 flex flex-wrap items-center gap-1.5 rounded-xl border border-border/70 bg-card p-3.5 shadow-sm lg:col-span-1">
        {resumen.porEstatus.length === 0 ? (
          <span className="text-xs text-muted-foreground">Sin desglose</span>
        ) : (
          resumen.porEstatus.slice(0, 4).map((e) => {
            const style = ESTATUS_STYLES[e.estatus]
            return (
              <span
                key={e.estatus}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-medium',
                  style?.className,
                )}
              >
                <span className={cn('size-1.5 rounded-full', style?.dotClass)} />
                {style?.label ?? e.estatus}
                <span className="font-semibold tabular-nums">{e.total}</span>
              </span>
            )
          })
        )}
      </div>
    </div>
  )
}
