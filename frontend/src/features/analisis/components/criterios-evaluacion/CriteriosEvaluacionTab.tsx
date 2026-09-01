'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, ClipboardList } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { cn } from '@/shared/lib/cn'
import type { CriteriosEvaluacionData, SituacionFinancieraData } from '@/features/analisis/types/analisis.types'
import {
  NIVEL_ESTILO,
  NIVEL_LABEL,
  calcularCriterios,
  tieneSituacionFinanciera,
} from '@/features/analisis/lib/criterios-evaluacion'
import { CriteriosTable } from './CriteriosTable'

interface Props {
  situacionFinanciera: SituacionFinancieraData | null
  inicial: CriteriosEvaluacionData | null
  editable: boolean
  onGuardar: (data: CriteriosEvaluacionData) => void
  /** Salta a la pestaña de Situación Financiera cuando aún no hay nada capturado. */
  onIrASituacionFinanciera: () => void
}

const NIVELES_LEYENDA = ['bien', 'atencion', 'riesgo'] as const

export function CriteriosEvaluacionTab({
  situacionFinanciera, inicial, editable, onGuardar, onIrASituacionFinanciera,
}: Props) {
  const [observaciones, setObservaciones] = useState(inicial?.observaciones ?? '')

  const hayDatos = tieneSituacionFinanciera(situacionFinanciera)
  const calc = useMemo(
    () => (situacionFinanciera && hayDatos ? calcularCriterios(situacionFinanciera) : null),
    [situacionFinanciera, hayDatos],
  )

  if (!calc || !situacionFinanciera) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-card py-20 text-center">
        <div className="rounded-2xl bg-muted p-4 text-muted-foreground">
          <ClipboardList className="h-6 w-6" />
        </div>
        <div className="max-w-sm">
          <p className="text-sm font-medium text-foreground">Aún no hay Situación Financiera capturada</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Los criterios de evaluación (liquidez, endeudamiento, rentabilidad y cobertura) se calculan
            a partir del Balance General y el Estado de Resultados de esa pestaña.
          </p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={onIrASituacionFinanciera}>
          Ir a Situación Financiera <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-2.5 text-[11px]">
        <span className="font-medium text-muted-foreground">Semáforo:</span>
        {NIVELES_LEYENDA.map((n) => (
          <span key={n} className={cn('rounded-md border px-2 py-0.5 font-medium', NIVEL_ESTILO[n])}>
            {NIVEL_LABEL[n]}
          </span>
        ))}
        <span className="text-muted-foreground/70">
          · se recalcula al guardarse Situación Financiera — esta tabla no se edita directamente.
        </span>
      </div>

      <CriteriosTable calc={calc} periodos={situacionFinanciera.periodos} />

      <div className="space-y-1.5 rounded-xl border border-border/60 bg-card p-4 shadow-sm">
        <Label htmlFor="criterios-observaciones" className="text-xs font-semibold text-foreground">
          Observaciones del analista
        </Label>
        <Textarea
          id="criterios-observaciones"
          value={observaciones}
          disabled={!editable}
          onChange={(e) => {
            const texto = e.target.value
            setObservaciones(texto)
            if (editable) onGuardar({ observaciones: texto })
          }}
          placeholder="Lectura de los criterios: qué explica un ratio fuera de rango, contexto del negocio, comparación contra periodos anteriores…"
          className="min-h-[100px] resize-y text-sm"
        />
      </div>
    </div>
  )
}
