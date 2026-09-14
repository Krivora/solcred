import { Check, TriangleAlert } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { DashboardCard } from './DashboardCard'
import { formatEntero } from '@/features/dashboard/lib/dashboard.format'
import type { PanoramaEmbudoFormulario } from '@/features/dashboard/types/dashboard.types'

interface FilaData {
  label: string
  valor: number
  /** % que cae respecto al paso anterior. `null` en el primer paso (no hay anterior que comparar). */
  caidaPct: number | null
}

/** Secuencia completa pasos → enviada, con el % de caída de cada paso al siguiente. */
function construirFilas(embudo: PanoramaEmbudoFormulario): FilaData[] {
  const secuencia = [
    ...embudo.pasos.map((p) => ({ label: p.label, valor: p.valor })),
    { label: 'Enviada', valor: embudo.totalEnviaron },
  ]
  return secuencia.map((s, i) => {
    if (i === 0) return { ...s, caidaPct: null }
    const anterior = secuencia[i - 1].valor
    const caidaPct = anterior > 0 ? Math.round(((anterior - s.valor) / anterior) * 100) : null
    return { ...s, caidaPct }
  })
}

/** El paso con la mayor caída absoluta de solicitudes respecto al anterior. */
function mayorAbandono(filas: FilaData[]) {
  let peor: { desde: string; hasta: string; caida: number } | null = null
  for (let i = 1; i < filas.length; i++) {
    const caida = filas[i - 1].valor - filas[i].valor
    if (caida > 0 && (!peor || caida > peor.caida)) {
      peor = { desde: filas[i - 1].label, hasta: filas[i].label, caida }
    }
  }
  return peor
}

function Fila({ fila, max, tono }: { fila: FilaData; max: number; tono: 'primary' | 'success' | 'warn' }) {
  const pct = max > 0 ? Math.max(3, (fila.valor / max) * 100) : 3
  const barra = { primary: 'bg-brand', success: 'bg-ok', warn: 'bg-warn' }[tono]
  return (
    <div className="grid grid-cols-[7.5rem_1fr_2rem_2.75rem] items-center gap-2.5">
      <span className="truncate text-caption text-muted-foreground">{fila.label}</span>
      <div className="h-5.5 overflow-hidden rounded-md bg-muted">
        <div className={`h-full rounded-md ${barra}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-right text-caption font-semibold text-foreground tabular-nums">
        {formatEntero(fila.valor)}
      </span>
      <span
        className={cn(
          'text-right text-caption tabular-nums',
          tono === 'warn' ? 'font-semibold text-warn-ink' : 'text-muted-foreground/70',
        )}
      >
        {fila.caidaPct !== null && fila.caidaPct > 0 ? `-${fila.caidaPct}%` : ''}
      </span>
    </div>
  )
}

export function EmbudoFormulario({ embudo }: { embudo: PanoramaEmbudoFormulario }) {
  const max = Math.max(1, embudo.totalIniciaron)
  const filas = construirFilas(embudo)
  const peor = mayorAbandono(filas)
  const pasos = filas.slice(0, -1)
  const enviada = filas[filas.length - 1]

  return (
    <DashboardCard
      title="Conversión del formulario"
      description="Dónde se detienen las solicitudes antes de enviarse"
      aside={
        <span className="text-caption font-medium text-muted-foreground tabular-nums">
          {embudo.tasaConversion !== null ? `${embudo.tasaConversion}% convierte` : 'Sin datos'}
        </span>
      }
    >
      {embudo.totalIniciaron === 0 ? (
        <p className="py-6 text-center text-caption text-muted-foreground">
          Nadie inició el formulario en este periodo.
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {pasos.map((fila) => (
            <Fila key={fila.label} fila={fila} max={max} tono={peor && fila.label === peor.hasta ? 'warn' : 'primary'} />
          ))}

          <div className="mt-1.5 border-t border-border pt-2.5">
            <Fila fila={enviada} max={max} tono={peor && peor.hasta === 'Enviada' ? 'warn' : 'success'} />
          </div>

          {peor ? (
            <p className="flex items-center gap-1.5 pl-30 text-caption text-muted-foreground">
              <TriangleAlert className="size-3 text-warn-ink" strokeWidth={3} />
              Mayor abandono entre <strong className="font-semibold text-foreground">{peor.desde}</strong> y{' '}
              <strong className="font-semibold text-foreground">{peor.hasta}</strong>:{' '}
              {formatEntero(peor.caida)} solicitudes se pierden ahí
            </p>
          ) : (
            <p className="flex items-center gap-1.5 pl-30 text-caption text-muted-foreground">
              <Check className="size-3 text-ok-ink" strokeWidth={3} />
              {formatEntero(embudo.totalIniciaron)} solicitudes iniciaron el formulario,{' '}
              {formatEntero(embudo.totalEnviaron)} lo enviaron
            </p>
          )}
        </div>
      )}
    </DashboardCard>
  )
}
