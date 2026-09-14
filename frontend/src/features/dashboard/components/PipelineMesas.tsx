import Link from 'next/link'
import { TriangleAlert } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { formatEntero, formatDias } from '@/features/dashboard/lib/dashboard.format'
import type { Panorama } from '@/features/dashboard/types/dashboard.types'

/** A dónde manda cada mesa al hacer clic. `null` = sin vista admin todavía (no clickeable). */
const RUTA_POR_ETAPA: Record<string, string | null> = {
  PENDIENTE: '/dashboard/admin/promocion/solicitudes?estatus=PENDIENTE',
  // La card suma EN_REVISION + EN_CORRECCION; el filtro solo acepta un valor,
  // así que enlaza al más numeroso de los dos en vez de forzar el backend.
  EN_REVISION: '/dashboard/admin/promocion/solicitudes?estatus=EN_REVISION',
  EN_APROBACION: '/dashboard/admin/promocion/solicitudes?estatus=EN_APROBACION',
  EN_FINANCIAMIENTO: '/dashboard/financiamiento/mesa-control',
  EN_ASIGNACION: '/dashboard/financiamiento/asignacion',
  EN_ANALISIS: null, // sin vista admin de "todo en análisis" — mis-casos es solo del analista
  EN_VALIDACION: '/dashboard/financiamiento/validacion',
  EN_COMITE: '/dashboard/financiamiento/comite',
}

/**
 * Héroe del panorama: el proceso de originación como una banda de mesas en
 * secuencia, cada segmento con ancho proporcional a los expedientes que hoy
 * esperan en esa etapa. El cuello de botella —la etapa que más se pasa de su
 * tiempo objetivo— se marca aparte. La cifra de arriba (activas) es el
 * veredicto del panorama: el número más grande de toda la pantalla.
 */
export function PipelineMesas({ panorama }: { panorama: Panorama }) {
  const etapas = [...panorama.embudo.promocion, ...panorama.embudo.financiamiento]
  const total = etapas.reduce((s, e) => s + e.valor, 0)

  const peor = panorama.tiempoPorEtapa.peorEtapa
  const peorTiempo = peor
    ? panorama.tiempoPorEtapa.etapas.find((e) => e.estatus === peor) ?? null
    : null
  const peorEtapa = peor ? etapas.find((e) => e.estatus === peor) ?? null : null
  const sla = panorama.tiempoPorEtapa.slaDias

  return (
    <section aria-labelledby="pipeline-h" className="border-b border-border pb-7">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 id="pipeline-h" className="text-caption font-semibold uppercase tracking-wide text-ink-subtle">
          Panorama de hoy
        </h2>
      </div>

      <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span className="font-serif text-[2.5rem] font-semibold leading-none tracking-tight text-foreground tabular-nums">
          {formatEntero(total)}
        </span>
        <span className="text-base text-muted-foreground">solicitudes activas en el proceso</span>
      </p>

      <p className="mb-5 mt-2 text-sm text-muted-foreground">
        <Cifra>{formatDias(panorama.kpis.tiempoResolucion.valor)}</Cifra> resolución punta a punta
      </p>

      <div
        role="img"
        aria-label={`Expedientes por mesa: ${etapas.map((e) => `${e.label} ${e.valor}`).join(', ')}.`}
        className="flex items-stretch gap-[3px]"
      >
        {etapas.map((e, i) => {
          const esPeor = e.estatus === peor
          const href = RUTA_POR_ETAPA[e.estatus] ?? null
          const contenido = (
            <>
              <span className="text-[11px] leading-tight text-muted-foreground">
                <span className="mr-1 text-ink-subtle">{i + 1}</span>
                {e.label}
              </span>
              <span className="font-serif text-xl font-semibold leading-none text-foreground tabular-nums">
                {formatEntero(e.valor)}
              </span>
              {esPeor && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-warn-ink">
                  <TriangleAlert className="size-3" /> cuello de botella
                </span>
              )}
            </>
          )
          const claseSeg = cn(
            'flex min-w-[74px] flex-1 basis-0 flex-col gap-1 border-t-2 px-3 py-2.5 first:rounded-l-sm last:rounded-r-sm',
            esPeor ? 'border-warn bg-warn-surface' : 'border-brand bg-brand-surface',
            href && 'transition-[filter] hover:brightness-95 focus-visible:brightness-95',
          )
          const titulo = `${e.label} · ${formatEntero(e.valor)} expedientes${href ? ' · ver lista' : ''}`

          return href ? (
            <Link key={e.estatus} href={href} title={titulo} className={claseSeg}>
              {contenido}
            </Link>
          ) : (
            <div key={e.estatus} title={titulo} className={claseSeg}>
              {contenido}
            </div>
          )
        })}
      </div>

      {peorEtapa && peorTiempo ? (
        <p className="mt-3.5 max-w-[64ch] text-[13px] leading-relaxed text-muted-foreground">
          <TriangleAlert className="mr-1 inline size-3.5 -translate-y-px text-warn" />
          La cola está en{' '}
          <strong className="font-semibold text-foreground">{peorTiempo.label}</strong>:{' '}
          {formatEntero(peorEtapa.valor)} expedientes esperan y la permanencia media es de{' '}
          <strong className="font-semibold text-foreground">
            {peorTiempo.dias.toFixed(1)} días
          </strong>
          , contra un objetivo de {sla.toFixed(1)}.
        </p>
      ) : (
        <p className="mt-3.5 text-[13px] text-muted-foreground">
          Ninguna etapa supera su tiempo objetivo de {sla.toFixed(1)} días.
        </p>
      )}
    </section>
  )
}

function Cifra({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-serif text-xl font-semibold text-foreground tabular-nums">
      {children}
    </span>
  )
}
