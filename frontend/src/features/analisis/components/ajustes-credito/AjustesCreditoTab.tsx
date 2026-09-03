'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, Info } from 'lucide-react'
import type {
  AjustesCreditoData,
  AjustesCreditoOrigen,
  ConceptoAjuste,
  CondicionesCredito,
  GarantiaAjuste,
} from '@/features/analisis/types/analisis.types'
import { calcularAjustes, normalizarAjustes } from '@/features/analisis/lib/ajustes-credito'
import { CondicionesCreditoSection } from './CondicionesCreditoSection'
import { ConceptosCreditoSection } from './ConceptosCreditoSection'
import { GarantiasSection } from './GarantiasSection'
import { CoberturaBanner } from './CoberturaBanner'

interface Props {
  inicial: AjustesCreditoData | null
  origen: AjustesCreditoOrigen
  editable: boolean
  onGuardar: (data: AjustesCreditoData) => void
}

export function AjustesCreditoTab({ inicial, origen, editable, onGuardar }: Props) {
  const [data, setData] = useState<AjustesCreditoData>(() => normalizarAjustes(inicial, origen))

  const calc = useMemo(() => calcularAjustes(data, origen), [data, origen])

  /** Guarda solo estados sin errores de rango — la "validación dura". */
  const actualizar = (next: AjustesCreditoData) => {
    setData(next)
    if (editable && calcularAjustes(next, origen).errores.length === 0) {
      onGuardar(next)
    }
  }

  const setCondiciones = (patch: Partial<CondicionesCredito>) =>
    actualizar({ ...data, condiciones: { ...data.condiciones, ...patch } })
  const setConceptos = (conceptos: ConceptoAjuste[]) => actualizar({ ...data, conceptos })
  const setGarantias = (garantias: GarantiaAjuste[]) => actualizar({ ...data, garantias })
  const setObservaciones = (observaciones: string) => actualizar({ ...data, observaciones })

  return (
    <div className="space-y-4">
      {calc.errores.length > 0 && (
        <div className="space-y-1.5 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-destructive">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Los cambios no se guardan mientras haya valores fuera de rango
          </div>
          <ul className="ml-6 list-disc space-y-0.5 text-xs">
            {calc.errores.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {calc.errores.length === 0 && calc.avisos.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-warn/25 bg-warn-surface px-4 py-2.5 text-xs text-warn-ink">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>{calc.avisos.join(' · ')}</span>
        </div>
      )}

      <CoberturaBanner
        cobertura={calc.cobertura}
        valorGarantias={calc.valorGarantias}
        montoAjustado={calc.montoAjustado}
      />

      <CondicionesCreditoSection
        value={data.condiciones}
        observaciones={data.observaciones ?? ''}
        programa={origen.programa}
        editable={editable}
        onChange={setCondiciones}
        onObservaciones={setObservaciones}
      />

      <ConceptosCreditoSection
        conceptos={data.conceptos}
        subtotales={calc.subtotalPorCategoria}
        montoSolicitado={calc.montoSolicitado}
        montoAjustado={calc.montoAjustado}
        editable={editable}
        onChange={setConceptos}
      />

      <GarantiasSection
        garantias={data.garantias}
        valorTotal={calc.valorGarantias}
        editable={editable}
        onChange={setGarantias}
      />
    </div>
  )
}
