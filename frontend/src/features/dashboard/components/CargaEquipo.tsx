import { cn } from '@/shared/lib/cn'
import { DashboardCard } from './DashboardCard'
import type { PanoramaEquipo, PersonaCarga } from '@/features/dashboard/types/dashboard.types'

function iniciales(nombre: string) {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

function Persona({ p }: { p: PersonaCarga }) {
  const pct = p.capacidad > 0 ? Math.min(100, Math.round((p.carga / p.capacidad) * 100)) : 0
  const lleno = p.carga >= p.capacidad
  return (
    <div className="grid grid-cols-[1fr_5rem_auto] items-center gap-2.5 border-t border-border py-2 first:border-t-0">
      <span className="flex items-center gap-2 truncate text-[12.5px] text-foreground">
        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-muted text-[9px] font-semibold text-muted-foreground">
          {iniciales(p.nombre)}
        </span>
        <span className="truncate">{p.nombre}</span>
      </span>
      <span className="h-1.5 overflow-hidden rounded-full bg-muted">
        <span
          className={cn('block h-full rounded-full', lleno ? 'bg-warning' : 'bg-primary')}
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
        {p.carga}/{p.capacidad}
      </span>
    </div>
  )
}

export function CargaEquipo({ equipo }: { equipo: PanoramaEquipo }) {
  const bloques: { titulo: string; personas: PersonaCarga[] }[] = [
    { titulo: 'Gestores', personas: equipo.gestores },
    { titulo: 'Analistas', personas: equipo.analistas },
  ]

  return (
    <DashboardCard title="Carga del equipo" description="Casos vigentes por persona">
      <div className="flex flex-col gap-4">
        {bloques.map((b) => (
          <div key={b.titulo}>
            <h4 className="mb-1 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
              {b.titulo}
            </h4>
            {b.personas.length === 0 ? (
              <p className="py-1.5 text-xs text-muted-foreground/70">Sin personal activo</p>
            ) : (
              b.personas.map((p) => <Persona key={p.nombre} p={p} />)
            )}
          </div>
        ))}
      </div>
    </DashboardCard>
  )
}
