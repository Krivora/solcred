import { PERIODOS, type PeriodoKey, type PeriodoMeta, type ValoresCuenta } from '@/features/analisis/types/analisis.types'
import type { CalculoSituacion } from '@/features/analisis/lib/calculo-situacion-financiera'
import type { FilaBalance, FilaResultados } from '@/features/analisis/lib/cuentas'

const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`

export function exportarEstadoCSV(
  nombre: string,
  grupo: 'balance' | 'resultados',
  filas: (FilaBalance | FilaResultados)[],
  periodos: Record<PeriodoKey, PeriodoMeta>,
  valores: Record<string, ValoresCuenta>,
  calc: CalculoSituacion,
) {
  const lineas: string[] = []
  lineas.push(['Cuenta', ...PERIODOS.map((c) => periodos[c].etiqueta)].map(esc).join(','))

  for (const fila of filas) {
    if (fila.tipo === 'seccion') {
      lineas.push(esc(fila.titulo.toUpperCase()))
      continue
    }
    if (fila.tipo === 'total') {
      const vals = PERIODOS.map((c) => {
        const bucket = grupo === 'balance' ? calc[c].balance : calc[c].resultados
        return (bucket as Record<string, number>)[fila.key] ?? 0
      })
      lineas.push([fila.label, ...vals].map(esc).join(','))
      continue
    }
    if (fila.tipo === 'autocuenta') {
      const vals = PERIODOS.map((c) => calc[c].utilEjercicio)
      lineas.push([fila.label, ...vals].map(esc).join(','))
      continue
    }
    const vals = PERIODOS.map((c) => valores?.[fila.key]?.[c] ?? 0)
    const label = 'deduccion' in fila && fila.deduccion ? `${fila.label} (-)` : fila.label
    lineas.push([label, ...vals].map(esc).join(','))
  }

  const csv = '﻿' + lineas.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${nombre}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
