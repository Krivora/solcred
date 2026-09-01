import { ArrowRight, CheckCircle2, XCircle, RefreshCw } from 'lucide-react'
import { DashboardCard } from './DashboardCard'
import { estatusSolicitud } from '@/shared/config/estatus.tokens'
import { tiempoRelativo } from '@/features/dashboard/lib/dashboard.format'
import type { PanoramaActividad } from '@/features/dashboard/types/dashboard.types'

function iconoPara(estatusNuevo: string) {
  if (estatusNuevo === 'APROBADO') return { Icon: CheckCircle2, cls: 'bg-success/10 text-success' }
  if (estatusNuevo === 'RECHAZADO' || estatusNuevo === 'CANCELADO')
    return { Icon: XCircle, cls: 'bg-destructive/10 text-destructive' }
  if (estatusNuevo === 'EN_CORRECCION')
    return { Icon: RefreshCw, cls: 'bg-warning/10 text-warning' }
  return { Icon: ArrowRight, cls: 'bg-primary/10 text-primary' }
}

export function ActividadReciente({ actividad }: { actividad: PanoramaActividad[] }) {
  return (
    <DashboardCard
      title="Actividad reciente"
      description="Últimos movimientos registrados en el historial"
    >
      {actividad.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Sin movimientos recientes.</p>
      ) : (
        <ul className="flex flex-col">
          {actividad.map((a, i) => {
            const { Icon, cls } = iconoPara(a.estatusNuevo)
            const nuevo = estatusSolicitud(a.estatusNuevo).label
            const anterior = estatusSolicitud(a.estatusAnterior).label
            return (
              <li
                key={`${a.folio}-${i}`}
                className="grid grid-cols-[1.6rem_1fr_auto] gap-3 border-t border-border py-2.5 first:border-t-0"
              >
                <span className={`grid size-[1.6rem] place-items-center rounded-lg ${cls}`}>
                  <Icon className="size-3.5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[12.5px] text-foreground">
                    <span className="font-medium">{anterior}</span>
                    <ArrowRight className="mx-1 inline size-3 text-muted-foreground/60" />
                    <span className="font-medium">{nuevo}</span>
                  </span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    <span className="font-mono text-primary">{a.folio}</span> · {a.usuario}
                    {a.motivo ? ` · ${a.motivo}` : ''}
                  </span>
                </span>
                <span className="whitespace-nowrap text-[10.5px] text-muted-foreground/80">
                  {tiempoRelativo(a.fecha)}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </DashboardCard>
  )
}
