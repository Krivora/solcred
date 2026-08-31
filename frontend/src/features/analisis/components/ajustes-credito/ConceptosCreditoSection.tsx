'use client'

import { Plus, Trash2, Target } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'
import type { CategoriaCredito } from '@/shared/types/domain.enums'
import type { ConceptoAjuste } from '@/features/analisis/types/analisis.types'
import { CATEGORIAS_CREDITO, conceptoVacio, fmtMoney } from '@/features/analisis/lib/ajustes-credito'
import { CeldaMonto } from '../CeldaMonto'

interface Props {
  conceptos: ConceptoAjuste[]
  subtotales: Record<CategoriaCredito, number>
  montoSolicitado: number
  montoAjustado: number
  editable: boolean
  onChange: (conceptos: ConceptoAjuste[]) => void
}

export function ConceptosCreditoSection({
  conceptos, subtotales, montoSolicitado, montoAjustado, editable, onChange,
}: Props) {
  const setConcepto = (idx: number, patch: Partial<ConceptoAjuste>) =>
    onChange(conceptos.map((c, i) => (i === idx ? { ...c, ...patch } : c)))
  const quitar = (idx: number) => onChange(conceptos.filter((_, i) => i !== idx))
  const agregar = (categoria: CategoriaCredito) => onChange([...conceptos, conceptoVacio(categoria)])

  const delta = montoAjustado - montoSolicitado

  return (
    <section className="space-y-3 rounded-xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-primary">Para qué solicita el dinero</h3>
        </div>
        <div className="flex items-center gap-3 text-[11px] tabular-nums">
          <span className="text-muted-foreground">
            Solicitado <span className="font-semibold text-foreground">{fmtMoney(montoSolicitado)}</span>
          </span>
          <span className="text-muted-foreground">
            Ajustado <span className="font-semibold text-foreground">{fmtMoney(montoAjustado)}</span>
          </span>
          {delta !== 0 && (
            <span
              className={cn(
                'rounded-md px-1.5 py-0.5 font-semibold',
                delta < 0 ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400' : 'bg-primary/10 text-primary',
              )}
            >
              {delta > 0 ? '+' : ''}
              {fmtMoney(delta)}
            </span>
          )}
        </div>
      </div>

      {CATEGORIAS_CREDITO.map(({ key, label, descripcion }) => {
        const items = conceptos
          .map((c, index) => ({ c, index }))
          .filter(({ c }) => c.categoria === key)

        return (
          <div key={key} className="overflow-hidden rounded-lg border border-border/50">
            <div className="flex items-center justify-between gap-3 border-b border-border/50 bg-muted/30 px-3 py-2">
              <div>
                <p className="text-xs font-semibold text-foreground">{label}</p>
                <p className="text-[10px] text-muted-foreground">{descripcion}</p>
              </div>
              <span className="text-xs font-semibold tabular-nums text-foreground">
                {fmtMoney(subtotales[key] ?? 0)}
              </span>
            </div>

            <div className="space-y-2 p-3">
              {items.length === 0 ? (
                <p className="text-[11px] text-muted-foreground/70">Sin conceptos en esta categoría.</p>
              ) : (
                items.map(({ c, index }) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={c.concepto}
                      disabled={!editable}
                      placeholder="Concepto (ej. Compra de torno CNC)"
                      onChange={(e) => setConcepto(index, { concepto: e.target.value })}
                      className="h-8 flex-1 text-xs"
                    />
                    <CeldaMonto
                      valor={c.monto}
                      disabled={!editable}
                      onChange={(v) => setConcepto(index, { monto: v ?? 0 })}
                      className="h-8 w-36 text-xs"
                    />
                    {editable && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => quitar(index)}
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))
              )}

              {editable && (
                <button
                  type="button"
                  onClick={() => agregar(key)}
                  className="flex items-center gap-1.5 pt-0.5 text-[11px] font-medium text-primary hover:text-primary/80"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Agregar concepto
                </button>
              )}
            </div>
          </div>
        )
      })}
    </section>
  )
}
