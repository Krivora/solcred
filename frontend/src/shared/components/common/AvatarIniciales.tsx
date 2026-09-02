import { cn } from '@/shared/lib/cn'

/** Paleta determinista — el mismo nombre siempre cae en el mismo color. */
const PALETA = [
  'bg-sky-500/15 text-sky-700 ring-sky-500/25 dark:text-sky-300',
  'bg-violet-500/15 text-violet-700 ring-violet-500/25 dark:text-violet-300',
  'bg-emerald-500/15 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300',
  'bg-amber-500/15 text-amber-700 ring-amber-500/25 dark:text-amber-300',
  'bg-rose-500/15 text-rose-700 ring-rose-500/25 dark:text-rose-300',
  'bg-cyan-500/15 text-cyan-700 ring-cyan-500/25 dark:text-cyan-300',
  'bg-fuchsia-500/15 text-fuchsia-700 ring-fuchsia-500/25 dark:text-fuchsia-300',
  'bg-indigo-500/15 text-indigo-700 ring-indigo-500/25 dark:text-indigo-300',
  'bg-teal-500/15 text-teal-700 ring-teal-500/25 dark:text-teal-300',
]

const TAMANOS = {
  xs: 'size-6 text-[9px]',
  sm: 'size-8 text-[11px]',
  md: 'size-9 text-xs',
  lg: 'size-11 text-sm',
} as const

export function inicialesDe(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

function hashNombre(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

interface Props {
  nombre: string
  tamano?: keyof typeof TAMANOS
  /** `auto` = color por nombre · `primary`/`muted` = tono fijo. */
  tono?: 'auto' | 'primary' | 'muted'
  className?: string
}

/** Ficha circular con las iniciales de una persona y un color estable por nombre. */
export function AvatarIniciales({ nombre, tamano = 'sm', tono = 'auto', className }: Props) {
  const estilo =
    tono === 'primary'
      ? 'bg-primary/15 text-primary ring-primary/25'
      : tono === 'muted'
        ? 'bg-muted text-muted-foreground ring-border'
        : PALETA[hashNombre(nombre) % PALETA.length]

  return (
    <span
      title={nombre}
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold ring-1 ring-inset',
        TAMANOS[tamano],
        estilo,
        className,
      )}
    >
      {inicialesDe(nombre)}
    </span>
  )
}
