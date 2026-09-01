'use client'

import { Fragment } from 'react'
import { cn } from '@/shared/lib/cn'
import { PERIODOS, type PeriodoKey, type PeriodoMeta } from '@/features/analisis/types/analisis.types'
import {
  GRUPOS_CRITERIOS,
  NIVEL_ESTILO,
  NIVEL_LABEL,
  formatValorCriterio,
  type CalculoCriterios,
} from '@/features/analisis/lib/criterios-evaluacion'

interface Props {
  calc: CalculoCriterios
  periodos: Record<PeriodoKey, PeriodoMeta>
}

export function CriteriosTable({ calc, periodos }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border/60 bg-card shadow-sm">
      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr className="bg-muted/40">
            <th className="w-[36%] border-b border-border/60 px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-muted-foreground/70">
              Criterio
            </th>
            {PERIODOS.map((c) => (
              <th
                key={c}
                className="border-b border-l border-border/60 px-2 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-muted-foreground/70"
              >
                {periodos[c].etiqueta}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {GRUPOS_CRITERIOS.map((grupo) => (
            <Fragment key={grupo.titulo}>
              <tr>
                <td
                  colSpan={1 + PERIODOS.length}
                  className="border-y border-border/60 bg-primary/6 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-primary"
                >
                  {grupo.titulo}
                </td>
              </tr>
              {grupo.criterios.map((crit) => (
                <tr key={crit.key} className="border-b border-border/40 last:border-0 hover:bg-accent/30">
                  <td className="px-3 py-2">
                    <p className="font-medium text-foreground">{crit.label}</p>
                    <p className="text-[10px] text-muted-foreground/70">{crit.formula}</p>
                  </td>
                  {PERIODOS.map((c) => {
                    const r = calc[c][crit.key]
                    return (
                      <td key={c} className="border-l border-border/40 px-1.5 py-1.5 text-center">
                        <span
                          className={cn(
                            'inline-flex min-w-[70px] flex-col items-center gap-0.5 rounded-md border px-2 py-1',
                            NIVEL_ESTILO[r.nivel],
                          )}
                        >
                          <span className="font-mono font-semibold tabular-nums">
                            {formatValorCriterio(r.valor, crit.unidad)}
                          </span>
                          <span className="text-[9px] font-medium uppercase tracking-wide opacity-80">
                            {NIVEL_LABEL[r.nivel]}
                          </span>
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
