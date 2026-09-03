import { StatusChip } from '@/shared/components/ui/status-chip'
import { Tag } from '@/shared/components/ui/tag'
import { LABEL_RESULTADO, LABEL_TIPO, RESULTADO_TONE, TIPO_TONE } from '@/features/crm/lib/crm.config'
import type { ComunicacionResultado, ComunicacionTipo } from '@/features/crm/types/crm.types'

export function TipoTag({ tipo }: { tipo: ComunicacionTipo }) {
  return <Tag tone={TIPO_TONE[tipo]}>{LABEL_TIPO[tipo]}</Tag>
}

export function ResultadoChip({ resultado }: { resultado: ComunicacionResultado }) {
  return <StatusChip tone={RESULTADO_TONE[resultado]}>{LABEL_RESULTADO[resultado]}</StatusChip>
}
