import { Clock } from 'lucide-react'
import { TONE } from '@/shared/config/estatus.tokens'
import { cn } from '@/shared/lib/cn'

interface Props {
  estado?: 'en_curso' | 'en_riesgo' | 'vencido'
  dias?: number
}

/**
 * Indicador de estancamiento para las filas de "Mis Casos". `undefined`/
 * `'en_curso'` es el caso normal (la mayoría de las filas) y no dibuja nada
 * — solo `en_riesgo`/`vencido` ameritan resaltarse. Mismo tamaño/forma que
 * el chip de `EstatusBadge` de esta misma tabla, con el tono de
 * `estatus.tokens.ts` (única fuente de color de estado).
 */
export function EstadoEstancamientoChip({ estado, dias }: Props) {
  if (!estado || estado === 'en_curso') return null

  const tone = estado === 'vencido' ? 'danger' : 'warning'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1',
        TONE[tone].chip,
      )}
    >
      <Clock className="h-3 w-3" />
      {dias} días sin avance
    </span>
  )
}
