import { DashboardCard } from './DashboardCard'
import {
  SECTOR_LABELS,
  TAMANO_LABELS,
  TIPO_PERSONA_LABELS,
} from '@/shared/config/solicitudes.config'
import type { ComposicionItem, PanoramaComposicion } from '@/features/dashboard/types/dashboard.types'

const LABELS: Record<string, string> = {
  ...SECTOR_LABELS,
  ...TAMANO_LABELS,
  ...TIPO_PERSONA_LABELS,
  SIN_DATO: 'Sin especificar',
}

function MiniLista({ titulo, items }: { titulo: string; items: ComposicionItem[] }) {
  const total = items.reduce((s, i) => s + i.valor, 0)
  return (
    <div className="min-w-0">
      <h4 className="mb-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
        {titulo}
      </h4>
      <div className="flex flex-col gap-1.5">
        {items.length === 0 && <p className="text-xs text-muted-foreground/70">Sin datos</p>}
        {items.map((it) => {
          const pct = total > 0 ? Math.round((it.valor / total) * 100) : 0
          return (
            <div key={it.clave} className="grid grid-cols-[5rem_1fr_2.25rem] items-center gap-2 text-[11.5px]">
              <span className="truncate text-muted-foreground">{LABELS[it.clave] ?? it.clave}</span>
              <div className="h-2.5 overflow-hidden rounded-sm bg-muted">
                <div
                  className="h-full rounded-sm bg-primary"
                  style={{ width: `${total > 0 ? Math.max(4, (it.valor / total) * 100) : 4}%` }}
                />
              </div>
              <span className="text-right font-medium text-foreground tabular-nums">{pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function ComposicionDemanda({ composicion }: { composicion: PanoramaComposicion }) {
  return (
    <DashboardCard
      title="Composición de la demanda"
      description="Reparto de las solicitudes recibidas en el periodo"
    >
      <div className="grid gap-6 sm:grid-cols-3">
        <MiniLista titulo="Por sector" items={composicion.sector} />
        <MiniLista titulo="Por tamaño de empresa" items={composicion.tamano} />
        <MiniLista titulo="Por tipo de persona" items={composicion.persona} />
      </div>
    </DashboardCard>
  )
}
