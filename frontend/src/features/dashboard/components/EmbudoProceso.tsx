import { Check } from 'lucide-react'
import { DashboardCard } from './DashboardCard'
import { formatEntero } from '@/features/dashboard/lib/dashboard.format'
import type { PanoramaEmbudo, EmbudoEtapa } from '@/features/dashboard/types/dashboard.types'

function Fila({ etapa, max, tono }: { etapa: EmbudoEtapa; max: number; tono: 'primary' | 'success' }) {
  const pct = max > 0 ? Math.max(3, (etapa.valor / max) * 100) : 3
  return (
    <div className="grid grid-cols-[7.5rem_1fr_2rem] items-center gap-2.5">
      <span className="truncate text-xs text-muted-foreground">{etapa.label}</span>
      <div className="h-[22px] overflow-hidden rounded-md bg-muted">
        <div
          className={tono === 'success' ? 'h-full rounded-md bg-success' : 'h-full rounded-md bg-primary'}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-right text-xs font-semibold text-foreground tabular-nums">
        {formatEntero(etapa.valor)}
      </span>
    </div>
  )
}

export function EmbudoProceso({ embudo }: { embudo: PanoramaEmbudo }) {
  const todas = [...embudo.promocion, ...embudo.financiamiento]
  const total = todas.reduce((s, e) => s + e.valor, 0)
  const max = Math.max(1, ...todas.map((e) => e.valor))

  const salidaPromocion = embudo.financiamiento.reduce((s, e) => s + e.valor, 0) + embudo.aprobadasPeriodo

  return (
    <DashboardCard
      title="Embudo del proceso"
      description="Solicitudes en curso por etapa"
      aside={
        <span className="rounded-md border border-border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
          {formatEntero(total)} activas
        </span>
      }
    >
      <div className="flex flex-col gap-2.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
          Promoción
        </p>
        {embudo.promocion.map((e) => (
          <Fila key={e.estatus} etapa={e} max={max} tono="primary" />
        ))}

        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
          Financiamiento
        </p>
        {embudo.financiamiento.map((e) => (
          <Fila key={e.estatus} etapa={e} max={max} tono="primary" />
        ))}

        <div className="mt-1.5 border-t border-border pt-2.5">
          <Fila
            etapa={{ estatus: 'APROBADO', label: 'Aprobadas', valor: embudo.aprobadasPeriodo }}
            max={max}
            tono="success"
          />
        </div>

        <p className="flex items-center gap-1.5 pl-[7.5rem] text-[11px] text-muted-foreground">
          <Check className="size-3 text-success" strokeWidth={3} />
          {salidaPromocion > 0
            ? `${formatEntero(salidaPromocion)} solicitudes pasaron a Financiamiento o quedaron aprobadas en el periodo`
            : 'Sin flujo hacia Financiamiento en el periodo'}
        </p>
      </div>
    </DashboardCard>
  )
}
