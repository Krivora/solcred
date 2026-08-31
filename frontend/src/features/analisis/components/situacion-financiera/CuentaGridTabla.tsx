'use client'

import { Fragment, useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { PERIODOS, type PeriodoKey, type PeriodoMeta, type ValoresCuenta } from '@/features/analisis/types/analisis.types'
import type { CalculoSituacion } from '@/features/analisis/lib/calculo-situacion-financiera'
import type { FilaBalance, FilaResultados } from '@/features/analisis/lib/cuentas'
import { CeldaMonto } from '../CeldaMonto'

const fmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })
const money = (n: number) => fmt.format(n)

interface Props {
  grupo: 'balance' | 'resultados'
  filas: (FilaBalance | FilaResultados)[]
  periodos: Record<PeriodoKey, PeriodoMeta>
  valores: Record<string, ValoresCuenta>
  calc: CalculoSituacion
  editable: boolean
  onChange: (cuenta: string, periodo: PeriodoKey, v: number | null) => void
  /** Estado de Resultados: muestra la columna de promedio mensual. */
  mostrarDivisor?: boolean
}

export function CuentaGridTabla({
  grupo, filas, periodos, valores, calc, editable, onChange, mostrarDivisor,
}: Props) {
  const [colapsadas, setColapsadas] = useState<Set<string>>(new Set())
  const toggle = (t: string) =>
    setColapsadas((prev) => {
      const n = new Set(prev)
      if (n.has(t)) n.delete(t)
      else n.add(t)
      return n
    })

  // Anota cada fila con la sección a la que pertenece (para poder ocultarla al
  // colapsar) sin mutar variables durante el render.
  const filasAnotadas = useMemo(() => {
    const res: { fila: (typeof filas)[number]; seccion: string }[] = []
    for (const fila of filas) {
      const seccion = fila.tipo === 'seccion' ? fila.titulo : (res[res.length - 1]?.seccion ?? '')
      res.push({ fila, seccion })
    }
    return res
  }, [filas])

  // Enter → siguiente input del grid (orden del DOM), como en la herramienta original.
  const onKeyDownGrid = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter') return
    const target = e.target as HTMLElement
    if (target.tagName !== 'INPUT') return
    e.preventDefault()
    const inputs = Array.from(
      e.currentTarget.querySelectorAll<HTMLInputElement>('input:not([disabled])'),
    )
    const i = inputs.indexOf(target as HTMLInputElement)
    if (i > -1 && i < inputs.length - 1) {
      inputs[i + 1].focus()
      inputs[i + 1].select()
    }
  }

  const totalDe = (key: string, c: PeriodoKey): number => {
    const bucket = grupo === 'balance' ? calc[c].balance : calc[c].resultados
    return (bucket as Record<string, number>)[key] ?? 0
  }

  // colspan de la primera columna
  const colDivisor = mostrarDivisor ? PERIODOS.length : 0
  const totalCols = 1 + PERIODOS.length + colDivisor

  return (
    <div className="overflow-x-auto rounded-xl border border-border/60 bg-card shadow-sm" onKeyDown={onKeyDownGrid}>
      <table className="w-full border-collapse text-[11px]">
        <thead className="sticky top-0 z-10">
          <tr className="bg-muted/40">
            <th className="w-[34%] border-b border-border/60 px-2 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-muted-foreground/70">
              Cuenta
            </th>
            {PERIODOS.map((c) => (
              <th
                key={c}
                colSpan={mostrarDivisor ? 2 : 1}
                className="border-b border-l border-border/60 px-2 py-1.5 text-center text-[10px] font-bold uppercase tracking-wide text-muted-foreground/70"
              >
                {periodos[c].etiqueta}
                {periodos[c].corte && (
                  <span className="block font-normal normal-case text-[9px] text-muted-foreground/60">
                    al {new Date(periodos[c].corte + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                )}
              </th>
            ))}
          </tr>
          {mostrarDivisor && (
            <tr className="bg-muted/25">
              <th className="border-b border-border/60" />
              {PERIODOS.map((c) => (
                <Fragment key={c}>
                  <th className="border-b border-l border-border/60 px-2 py-1 text-center text-[9px] font-semibold text-muted-foreground/60">
                    Monto
                  </th>
                  <th className="border-b border-border/60 bg-primary/5 px-2 py-1 text-center text-[9px] font-semibold text-primary/70">
                    ÷ {calc[c].divisor}
                  </th>
                </Fragment>
              ))}
            </tr>
          )}
        </thead>

        <tbody>
          {filasAnotadas.map(({ fila, seccion }, idx) => {
            if (fila.tipo === 'seccion') {
              const cerrada = colapsadas.has(fila.titulo)
              return (
                <tr key={`s-${idx}`}>
                  <td
                    colSpan={totalCols}
                    className="cursor-pointer select-none border-y border-border/60 bg-primary/6 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide text-primary"
                    onClick={() => toggle(fila.titulo)}
                  >
                    <ChevronDown className={cn('mr-1 inline h-3 w-3 transition-transform', cerrada && '-rotate-90')} />
                    {fila.titulo}
                  </td>
                </tr>
              )
            }

            if (colapsadas.has(seccion)) return null

            if (fila.tipo === 'total') {
              const grand = fila.enfasis === 'grand'
              const medio = fila.enfasis === 'medio'
              return (
                <tr
                  key={`t-${idx}`}
                  className={cn(
                    'font-semibold',
                    grand ? 'bg-primary text-primary-foreground' : medio ? 'bg-muted' : 'bg-muted/40',
                  )}
                >
                  <td className={cn('px-2 py-1.5', grand && 'text-primary-foreground')}>{fila.label}</td>
                  {PERIODOS.map((c) => {
                    const v = totalDe(fila.key, c)
                    return (
                      <td
                        key={c}
                        colSpan={mostrarDivisor ? 2 : 1}
                        className={cn(
                          'border-l border-border/40 px-2 py-1.5 text-right font-mono tabular-nums',
                          !grand && v < 0 && 'text-destructive',
                        )}
                      >
                        {money(v)}
                      </td>
                    )
                  })}
                </tr>
              )
            }

            // cuenta capturable o autocuenta (utilidad del ejercicio)
            const esAuto = fila.tipo === 'autocuenta'
            const key = fila.key
            return (
              <tr key={key} className="border-b border-border/40 last:border-0 hover:bg-accent/30">
                <td className={cn('px-2 py-1', 'deduccion' in fila && fila.deduccion && 'italic text-destructive/80')}>
                  {fila.label}
                  {'deduccion' in fila && fila.deduccion && ' (-)'}
                </td>
                {PERIODOS.map((c) => {
                  if (esAuto) {
                    const v = calc[c].utilEjercicio
                    return (
                      <td
                        key={c}
                        colSpan={mostrarDivisor ? 2 : 1}
                        className={cn('border-l border-border/40 bg-amber-500/5 px-2 py-1 text-right font-mono tabular-nums', v < 0 && 'text-destructive')}
                      >
                        {money(v)}
                      </td>
                    )
                  }
                  const valor = valores?.[key]?.[c]
                  const divVal = (valor ?? 0) / calc[c].divisor
                  return (
                    <Fragment key={c}>
                      <td className="border-l border-border/40 px-1 py-0.5">
                        <CeldaMonto
                          valor={valor}
                          onChange={(v) => onChange(key, c, v)}
                          disabled={!editable}
                        />
                      </td>
                      {mostrarDivisor && (
                        <td className="bg-primary/5 px-2 py-1 text-right font-mono text-[10px] tabular-nums text-primary/70">
                          {money(divVal)}
                        </td>
                      )}
                    </Fragment>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
