'use client'

import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { fmtMoney } from '@/features/analisis/lib/ajustes-credito'

interface Props {
  cobertura: number | null
  valorGarantias: number
  montoAjustado: number
}

/** Cobertura = valor total de garantías ÷ monto ajustado del crédito. */
export function CoberturaBanner({ cobertura, valorGarantias, montoAjustado }: Props) {
  const nivel = cobertura === null ? 'sin' : cobertura >= 1 ? 'ok' : cobertura >= 0.7 ? 'baja' : 'critica'

  const estilo = {
    sin: 'border-border/60 bg-muted/40 text-muted-foreground',
    ok: 'border-emerald-500/25 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400',
    baja: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    critica: 'border-destructive/25 bg-destructive/5 text-destructive',
  }[nivel]

  const Icono = nivel === 'ok' ? ShieldCheck : nivel === 'critica' ? ShieldX : ShieldAlert

  return (
    <div className={cn('flex items-center gap-3 rounded-xl border px-4 py-3', estilo)}>
      <Icono className="h-5 w-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">
          Cobertura de garantía:{' '}
          {cobertura === null ? '—' : `${(cobertura * 100).toFixed(0)}%`}
        </p>
        <p className="text-[11px] tabular-nums opacity-90">
          {fmtMoney(valorGarantias)} en garantías / {fmtMoney(montoAjustado)} de crédito
          {nivel === 'baja' && ' · por debajo de 1×'}
          {nivel === 'critica' && ' · cobertura insuficiente'}
        </p>
      </div>
    </div>
  )
}
