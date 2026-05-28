import { Badge } from '@/components/ui/badge'
import type { EstatusSolicitud } from '@/lib/types/solicitudes.types'
import {
  FileEdit,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface EstatusBadgeProps {
  estatus: EstatusSolicitud
  size?: 'sm' | 'md'
}

const CONFIG: Record<
  EstatusSolicitud,
  {
    label: string
    icon: React.ElementType
    className: string
  }
> = {
  BORRADOR: {
    label: 'Borrador',
    icon: FileEdit,
    className:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700',
  },
  PENDIENTE: {
    label: 'Pendiente',
    icon: Clock,
    className:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  },
  EN_REVISION: {
    label: 'En revisión',
    icon: Search,
    className:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  },
  APROBADO: {
    label: 'Aprobado',
    icon: CheckCircle2,
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
  },
  RECHAZADO: {
    label: 'Rechazado',
    icon: XCircle,
    className:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  },
}

export function EstatusBadge({ estatus, size = 'md' }: EstatusBadgeProps) {
  const { label, icon: Icon, className } = CONFIG[estatus]

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5 font-medium',
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1',
        className
      )}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {label}
    </Badge>
  )
}

export { CONFIG as ESTATUS_CONFIG }