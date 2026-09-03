'use client'

import { cn } from '@/shared/lib/cn'
import { fmtMoney } from '@/features/analisis/lib/ajustes-credito'
import { fechaPago, formatFechaPago, type FilaAmortizacion } from '@/features/analisis/lib/amortizacion'

interface Props {
  filas: FilaAmortizacion[]
  /** Fecha ISO de dispersión. Sin ella, la columna de fecha muestra "—". */
  fechaDispersion: string | null
}

// Anchos explícitos (tabla de layout fijo): "No." muy angosto — es 1-2 dígitos.
const COLUMNAS = [
  { label: 'No.', width: 'w-20' },
  { label: 'Fecha', width: 'w-24' },
  { label: 'Saldo inicial', width: 'w-auto' },
  { label: 'Interés', width: 'w-auto' },
  { label: 'Capital', width: 'w-auto' },
  { label: 'Pago', width: 'w-auto' },
  { label: 'Saldo final', width: 'w-auto' },
]

export function TablaAmortizacion({ filas, fechaDispersion }: Props) {
  return (
    <div className="max-h-[520px] overflow-auto rounded-xl border border-border/60 bg-card shadow-sm">
      <table className="w-full table-fixed border-collapse text-[11px]">
        <thead className="sticky top-0 z-10">
          <tr className="bg-muted/40">
            {COLUMNAS.map(({ label, width }, i) => (
              <th
                key={label}
                className={cn(
                  width,
                  'border-b border-border/60 px-2 py-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground/70',
                  i === 0 ? 'text-left' : 'border-l text-right',
                )}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr
              key={f.numero}
              className={cn(
                'border-b border-hairline last:border-0 hover:bg-accent/30',
                f.enGracia && 'bg-warn-surface/40',
              )}
            >
              <td className="px-2 py-1.5">
                <div className="flex items-center gap-1">
                  <span className="font-medium text-foreground">{f.numero}</span>
                  {f.enGracia && (
                    <span className="rounded-md border border-warn/25 bg-warn-surface px-1 py-0.5 text-[8px] font-medium uppercase leading-none tracking-wide text-warn-ink">
                      Gracia
                    </span>
                  )}
                </div>
              </td>
              <td className="border-l border-border/40 px-2 py-1.5 text-right tabular-nums text-muted-foreground">
                {fechaDispersion ? formatFechaPago(fechaPago(fechaDispersion, f.numero)) : '—'}
              </td>
              <td className="border-l border-border/40 px-2 py-1.5 text-right font-mono tabular-nums">
                {fmtMoney(f.saldoInicial)}
              </td>
              <td className="border-l border-border/40 px-2 py-1.5 text-right font-mono tabular-nums text-muted-foreground">
                {fmtMoney(f.interes)}
              </td>
              <td className="border-l border-border/40 px-2 py-1.5 text-right font-mono tabular-nums">
                {fmtMoney(f.capital)}
              </td>
              <td className="border-l border-border/40 px-2 py-1.5 text-right font-mono font-semibold tabular-nums text-foreground">
                {fmtMoney(f.pago)}
              </td>
              <td className="border-l border-border/40 px-2 py-1.5 text-right font-mono tabular-nums">
                {fmtMoney(f.saldoFinal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
