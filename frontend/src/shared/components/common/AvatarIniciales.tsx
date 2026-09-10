import { cn } from '@/shared/lib/cn'

/** Paleta determinista (tokens categóricos) — el mismo nombre → el mismo color. */
const PALETA = [
  'bg-cat-1-surface text-cat-1 ring-cat-1/20',
  'bg-cat-2-surface text-cat-2 ring-cat-2/20',
  'bg-cat-3-surface text-cat-3 ring-cat-3/20',
  'bg-cat-4-surface text-cat-4 ring-cat-4/20',
  'bg-cat-5-surface text-cat-5 ring-cat-5/20',
  'bg-cat-6-surface text-cat-6 ring-cat-6/20',
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
