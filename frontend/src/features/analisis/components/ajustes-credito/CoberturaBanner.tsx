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
    sin: 'border-hairline bg-surface-sunken text-ink-muted',
    ok: 'border-ok/25 bg-ok-surface text-ok-ink',
    baja: 'border-warn/25 bg-warn-surface text-warn-ink',
    critica: 'border-danger/25 bg-danger-surface text-danger-ink',
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
