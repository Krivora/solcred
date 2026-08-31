'use client'

import { CalendarClock } from 'lucide-react'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import type { CondicionesCredito, ProgramaReferencia } from '@/features/analisis/types/analisis.types'
import { CampoNumero } from './CampoNumero'

interface Props {
  value: CondicionesCredito
  observaciones: string
  programa: ProgramaReferencia
  editable: boolean
  onChange: (patch: Partial<CondicionesCredito>) => void
  onObservaciones: (texto: string) => void
}

export function CondicionesCreditoSection({
  value, observaciones, programa, editable, onChange, onObservaciones,
}: Props) {
  const plazoFuera = value.plazoMeses < programa.plazoMinimoMeses || value.plazoMeses > programa.plazoMaximoMeses
  const graciaFuera = value.mesesGracia > value.plazoMeses

  return (
    <section className="space-y-3 rounded-xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-bold text-primary">Condiciones del crédito</h3>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CampoNumero
          label="Plazo"
          sufijo="meses"
          value={value.plazoMeses}
          min={programa.plazoMinimoMeses}
          max={programa.plazoMaximoMeses}
          step={1}
          disabled={!editable}
          invalido={plazoFuera}
          hint={`Programa: ${programa.plazoMinimoMeses}–${programa.plazoMaximoMeses} meses`}
          onChange={(v) => onChange({ plazoMeses: v ?? 0 })}
        />
        <CampoNumero
          label="Meses de gracia"
          sufijo="meses"
          value={value.mesesGracia}
          min={0}
          max={value.plazoMeses}
          step={1}
          disabled={!editable}
          invalido={graciaFuera}
          hint={graciaFuera ? 'No puede superar el plazo' : 'Solo intereses durante este periodo'}
          onChange={(v) => onChange({ mesesGracia: v ?? 0 })}
        />
        <CampoNumero
          label="Tasa anual"
          sufijo="%"
          value={value.tasaAnual}
          min={0}
          max={100}
          step={0.01}
          disabled={!editable}
          hint={`Programa: ${programa.tasaAnual}% anual`}
          onChange={(v) => onChange({ tasaAnual: v ?? 0 })}
        />
      </div>

      <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
        <span className="rounded-md border border-border/60 bg-muted/40 px-2 py-1">
          Tasa ordinaria programa: <span className="font-semibold text-foreground">{programa.tasaOrdinaria}%</span>
        </span>
        <span className="rounded-md border border-border/60 bg-muted/40 px-2 py-1">
          Tasa moratoria programa: <span className="font-semibold text-foreground">{programa.tasaMoratoria}%</span>
        </span>
      </div>

      <div className="space-y-1">
        <Label htmlFor="ajustes-observaciones" className="text-[11px] font-medium text-muted-foreground">
          Observaciones del ajuste <span className="font-normal">(opcional)</span>
        </Label>
        <Textarea
          id="ajustes-observaciones"
          value={observaciones}
          disabled={!editable}
          onChange={(e) => onObservaciones(e.target.value)}
          placeholder="Por qué se ajustan el monto, el plazo o la tasa…"
          className="min-h-[72px] resize-y text-sm"
        />
      </div>
    </section>
  )
}
