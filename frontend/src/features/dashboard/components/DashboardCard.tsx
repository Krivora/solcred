import { cn } from '@/shared/lib/cn'

interface Props {
  title: string
  description?: string
  /** Contenido a la derecha del encabezado (leyenda, tag, etc.). */
  aside?: React.ReactNode
  className?: string
  children: React.ReactNode
}

export function DashboardCard({ title, description, aside, className, children }: Props) {
  return (
    <section
      className={cn(
        'flex h-full min-w-0 flex-col gap-4 rounded-xl border border-border/70 bg-card p-4 shadow-sm sm:p-5',
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {aside && <div className="shrink-0">{aside}</div>}
      </header>
      {children}
    </section>
  )
}

export function CardLegend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-2.5 rounded-sm" style={{ background: it.color }} />
          {it.label}
        </span>
      ))}
    </div>
  )
}
