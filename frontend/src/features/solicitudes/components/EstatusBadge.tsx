import { Badge } from '@/shared/components/ui/badge'
import type { EstatusSolicitud } from '@/shared/types/solicitudes.types'
import { estatusSolicitud, TONE } from '@/shared/config/estatus.tokens'
import { cn } from '@/shared/lib/cn'

interface EstatusBadgeProps {
  estatus: EstatusSolicitud
  size?: 'sm' | 'md'
}

export function EstatusBadge({ estatus, size = 'md' }: EstatusBadgeProps) {
  const { label, tone, icon: Icon } = estatusSolicitud(estatus)

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5 font-medium',
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1',
        TONE[tone].badge,
      )}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {label}
    </Badge>
  )
}
