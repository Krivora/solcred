import { Check } from 'lucide-react'
import { DashboardCard } from './DashboardCard'
import { formatEntero } from '@/features/dashboard/lib/dashboard.format'
import type { PanoramaEmbudoFormulario, PasoFormularioEtapa } from '@/features/dashboard/types/dashboard.types'

function Fila({
  etapa,
  max,
  tono,
}: {
  etapa: { label: string; valor: number }
  max: number
  tono: 'primary' | 'success'
}) {
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

export function EmbudoFormulario({ embudo }: { embudo: PanoramaEmbudoFormulario }) {
  const max = Math.max(1, embudo.totalIniciaron)

  return (
    <DashboardCard
      title="Embudo de conversión del formulario"
      description="En qué paso abandonan los clientes su solicitud sin enviarla"
      aside={
        <span className="rounded-md border border-border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
          {embudo.tasaConversion !== null ? `${embudo.tasaConversion}% convierte` : 'Sin datos'}
        </span>
      }
    >
      {embudo.totalIniciaron === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">
          Nadie inició el formulario en este periodo.
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {embudo.pasos.map((etapa: PasoFormularioEtapa) => (
            <Fila key={etapa.paso} etapa={etapa} max={max} tono="primary" />
          ))}

          <div className="mt-1.5 border-t border-border pt-2.5">
            <Fila etapa={{ label: 'Enviada', valor: embudo.totalEnviaron }} max={max} tono="success" />
          </div>

          <p className="flex items-center gap-1.5 pl-[7.5rem] text-[11px] text-muted-foreground">
            <Check className="size-3 text-success" strokeWidth={3} />
            {formatEntero(embudo.totalIniciaron)} solicitudes iniciaron el formulario,{' '}
            {formatEntero(embudo.totalEnviaron)} lo enviaron
          </p>
        </div>
      )}
    </DashboardCard>
  )
}
