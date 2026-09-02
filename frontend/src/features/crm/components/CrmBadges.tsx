import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/shared/lib/cn'
import {
  LABEL_MOTIVO,
  LABEL_RESULTADO,
  LABEL_TIPO,
  TONO_CLASS,
  TONO_RESULTADO,
} from '@/features/crm/lib/crm.config'
import type {
  ComunicacionMotivo,
  ComunicacionResultado,
  ComunicacionTipo,
} from '@/features/crm/types/crm.types'

export function TipoBadge({ tipo }: { tipo: ComunicacionTipo }) {
  return (
    <Badge
      variant="outline"
      className="border-transparent bg-accent font-medium text-accent-foreground"
    >
      {LABEL_TIPO[tipo]}
    </Badge>
  )
}

export function MotivoBadge({ motivo }: { motivo: ComunicacionMotivo }) {
  return (
    <Badge variant="outline" className="font-normal text-muted-foreground">
      {LABEL_MOTIVO[motivo]}
    </Badge>
  )
}

export function ResultadoBadge({ resultado }: { resultado: ComunicacionResultado }) {
  return (
    <Badge
      variant="outline"
      className={cn('font-medium', TONO_CLASS[TONO_RESULTADO[resultado]])}
    >
      {LABEL_RESULTADO[resultado]}
    </Badge>
  )
}
