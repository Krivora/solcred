'use client'

import { useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { DashboardCard } from './DashboardCard'
import { formatDias, formatPct } from '@/features/dashboard/lib/dashboard.format'
import type {
  DesempenoAnalista,
  DesempenoGestor,
  PanoramaDesempeno,
  PanoramaEquipo,
  PersonaCarga,
} from '@/features/dashboard/types/dashboard.types'

function iniciales(nombre: string) {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

function Nombre({ nombre }: { nombre: string }) {
  return (
    <span className="flex min-w-0 items-center gap-2 truncate text-body-sm text-foreground">
      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-muted text-[9px] font-semibold text-muted-foreground">
        {iniciales(nombre)}
      </span>
      <span className="truncate">{nombre}</span>
    </span>
  )
}

/** Tres niveles, no dos: normal → acercándose al límite (80-99%) → al límite o sobre capacidad. */
function nivelCarga(carga: number, capacidad: number): 'normal' | 'cerca' | 'lleno' {
  if (capacidad <= 0) return 'normal'
  const ratio = carga / capacidad
  if (ratio >= 1) return 'lleno'
  if (ratio >= 0.8) return 'cerca'
  return 'normal'
}

const BARRA_NIVEL: Record<ReturnType<typeof nivelCarga>, string> = {
  normal: 'bg-brand',
  cerca: 'bg-warn',
  lleno: 'bg-danger',
}

const TEXTO_NIVEL: Record<ReturnType<typeof nivelCarga>, string> = {
  normal: 'text-muted-foreground',
  cerca: 'font-semibold text-warn-ink',
  lleno: 'font-semibold text-danger-ink',
}

function FilaCarga({ p }: { p: PersonaCarga }) {
  const pct = p.capacidad > 0 ? Math.min(100, Math.round((p.carga / p.capacidad) * 100)) : 0
  const nivel = nivelCarga(p.carga, p.capacidad)
  return (
    <div className="grid grid-cols-[1fr_5rem_auto] items-center gap-2.5 border-t border-border py-2 first:border-t-0">
      <Nombre nombre={p.nombre} />
      <span className="h-1.5 overflow-hidden rounded-full bg-muted">
        <span className={cn('block h-full rounded-full', BARRA_NIVEL[nivel])} style={{ width: `${pct}%` }} />
      </span>
      <span className={cn('text-caption tabular-nums', TEXTO_NIVEL[nivel])}>
        {p.carga}/{p.capacidad}
      </span>
    </div>
  )
}

function FilaDesempenoGestor({ g, max }: { g: DesempenoGestor; max: number }) {
  const pct = max > 0 ? Math.max(3, (g.avances / max) * 100) : 3
  return (
    <div className="grid grid-cols-[1fr_5rem_auto] items-center gap-2.5 border-t border-border py-2 first:border-t-0">
      <Nombre nombre={g.nombre} />
      <span className="h-1.5 overflow-hidden rounded-full bg-muted">
        <span className="block h-full rounded-full bg-ok" style={{ width: `${pct}%` }} />
      </span>
      <span className="text-caption font-medium text-muted-foreground tabular-nums">
        {g.avances} avances
      </span>
    </div>
  )
}

function FilaDesempenoAnalista({ a }: { a: DesempenoAnalista }) {
  return (
    <div className="grid grid-cols-[1fr_3.75rem_3rem_3.5rem] items-center gap-2.5 border-t border-border py-2 first:border-t-0">
      <Nombre nombre={a.nombre} />
      <span className="text-right text-caption text-muted-foreground tabular-nums">
        {a.resueltas} resueltas
      </span>
      <span className="text-right text-caption font-medium text-foreground tabular-nums">
        {formatPct(a.tasaAprobacion)}
      </span>
      <span className="text-right text-caption text-muted-foreground tabular-nums">
        {formatDias(a.tiempoPromedioDias)}
      </span>
    </div>
  )
}

type Vista = 'carga' | 'desempeno'

export function CargaEquipo({
  equipo,
  desempeno,
}: {
  equipo: PanoramaEquipo
  desempeno: PanoramaDesempeno
}) {
  const [vista, setVista] = useState<Vista>('carga')
  const saturados = [...equipo.gestores, ...equipo.analistas].filter((p) => p.carga >= p.capacidad).length
  const maxAvances = Math.max(1, ...desempeno.gestores.map((g) => g.avances))

  return (
    <DashboardCard
      title={vista === 'carga' ? 'Carga del equipo' : 'Desempeño del equipo'}
      description={vista === 'carga' ? 'Casos vigentes por persona' : 'Resultados reales en el periodo'}
      aside={
        <div className="flex items-center gap-2">
          {vista === 'carga' && saturados > 0 && (
            <span className="rounded-md bg-danger-surface px-1.5 py-0.5 text-caption font-semibold text-danger-ink">
              {saturados} al límite
            </span>
          )}
          <div role="group" aria-label="Vista del equipo" className="inline-flex overflow-hidden rounded-md border border-border">
            {(['carga', 'desempeno'] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={vista === v}
                onClick={() => setVista(v)}
                className={cn(
                  'px-2 py-1 text-caption transition-colors',
                  vista === v
                    ? 'bg-brand font-medium text-brand-contrast'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {v === 'carga' ? 'Carga' : 'Desempeño'}
              </button>
            ))}
          </div>
        </div>
      }
    >
      {vista === 'carga' ? (
        <div className="flex flex-col gap-4">
          <div>
            <h4 className="mb-1 text-caption font-semibold text-muted-foreground">Gestores</h4>
            {equipo.gestores.length === 0 ? (
              <p className="py-1.5 text-caption text-muted-foreground/70">Sin personal activo</p>
            ) : (
              equipo.gestores.map((p) => <FilaCarga key={p.nombre} p={p} />)
            )}
          </div>
          <div>
            <h4 className="mb-1 text-caption font-semibold text-muted-foreground">Analistas</h4>
            {equipo.analistas.length === 0 ? (
              <p className="py-1.5 text-caption text-muted-foreground/70">Sin personal activo</p>
            ) : (
              equipo.analistas.map((p) => <FilaCarga key={p.nombre} p={p} />)
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <h4 className="mb-1 text-caption font-semibold text-muted-foreground">
              Gestores · avances a Mesa de Control
            </h4>
            {desempeno.gestores.length === 0 ? (
              <p className="py-1.5 text-caption text-muted-foreground/70">Sin movimientos en el periodo</p>
            ) : (
              desempeno.gestores.map((g) => <FilaDesempenoGestor key={g.nombre} g={g} max={maxAvances} />)
            )}
          </div>
          <div>
            <h4 className="mb-1 text-caption font-semibold text-muted-foreground">
              Analistas · dictaminados, aprobación y tiempo
            </h4>
            {desempeno.analistas.length === 0 ? (
              <p className="py-1.5 text-caption text-muted-foreground/70">Sin dictámenes en el periodo</p>
            ) : (
              desempeno.analistas.map((a) => <FilaDesempenoAnalista key={a.nombre} a={a} />)
            )}
          </div>
        </div>
      )}
    </DashboardCard>
  )
}
