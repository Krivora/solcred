'use client'

import { CheckCircle2, AlertTriangle } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { PERIODOS, type PeriodoKey, type PeriodoMeta } from '@/features/analisis/types/analisis.types'
import type { CalculoSituacion } from '@/features/analisis/lib/calculo-situacion-financiera'

const fmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })

// Tolerancia de redondeo (centavos)
const TOL = 0.5

export function CuadreBanner({
  calc,
  periodos,
}: {
  calc: CalculoSituacion
  periodos: Record<PeriodoKey, PeriodoMeta>
}) {
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      {PERIODOS.map((c) => {
        const dif = calc[c].cuadre
        const cuadrado = Math.abs(dif) <= TOL
        return (
          <div
            key={c}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs',
              cuadrado
                ? 'border-ok/25 bg-ok-surface text-ok-ink'
                : 'border-danger/25 bg-danger-surface text-danger-ink',
            )}
          >
            {cuadrado ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <AlertTriangle className="h-3.5 w-3.5 shrink-0" />}
            <div className="min-w-0">
              <p className="font-semibold">{periodos[c].etiqueta}</p>
              <p className="text-[11px] tabular-nums">
                {cuadrado ? 'Balance cuadrado' : `Descuadre: ${fmt.format(dif)}`}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
