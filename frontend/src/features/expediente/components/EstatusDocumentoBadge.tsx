'use client'

import { Badge } from '@/shared/components/ui/badge'
import { estatusDocumento, TONE, type EstatusDocumentoUI } from '@/shared/config/estatus.tokens'
import { cn } from '@/shared/lib/cn'

interface EstatusDocumentoBadgeProps {
  estatus: EstatusDocumentoUI
}

export const EstatusDocumentoBadge = ({ estatus }: EstatusDocumentoBadgeProps) => {
  const { label, tone, icon: Icon } = estatusDocumento(estatus)
  return (
    <Badge variant="outline" className={cn('gap-1 font-medium text-xs', TONE[tone].badge)}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  )
}
