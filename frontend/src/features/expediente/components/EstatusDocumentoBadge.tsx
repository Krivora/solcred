'use client'

import { Badge } from '@/shared/components/ui/badge'
import { CheckCircle2, XCircle, Clock, Upload } from 'lucide-react'

type EstatusDoc = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'NO_SUBIDO'

const config: Record<
  EstatusDoc,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode; className: string }
> = {
  APROBADO: {
    label: 'Aprobado',
    variant: 'default',
    icon: <CheckCircle2 className="h-3 w-3" />,
    className:
      'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900 dark:hover:bg-emerald-950/40',
  },
  RECHAZADO: {
    label: 'Rechazado',
    variant: 'destructive',
    icon: <XCircle className="h-3 w-3" />,
    className:
      'bg-red-100 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900 dark:hover:bg-red-950/40',
  },
  PENDIENTE: {
    label: 'En revisión',
    variant: 'secondary',
    icon: <Clock className="h-3 w-3" />,
    className:
      'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900 dark:hover:bg-amber-950/40',
  },
  NO_SUBIDO: {
    label: 'Sin subir',
    variant: 'outline',
    icon: <Upload className="h-3 w-3" />,
    className:
      'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-800/50',
  },
}

interface EstatusDocumentoBadgeProps {
  estatus: EstatusDoc
}

export const EstatusDocumentoBadge = ({ estatus }: EstatusDocumentoBadgeProps) => {
  const { label, icon, className } = config[estatus]
  return (
    <Badge variant="outline" className={`gap-1 font-medium text-xs ${className}`}>
      {icon}
      {label}
    </Badge>
  )
}