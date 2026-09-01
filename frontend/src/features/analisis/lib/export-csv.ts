import { PERIODOS, type PeriodoKey, type PeriodoMeta, type ValoresCuenta } from '@/features/analisis/types/analisis.types'
import type { CalculoSituacion } from '@/features/analisis/lib/calculo-situacion-financiera'
import type { FilaBalance, FilaResultados } from '@/features/analisis/lib/cuentas'
import { fechaPago, type TablaAmortizacion } from '@/features/analisis/lib/amortizacion'

const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`

function descargarCSV(nombre: string, lineas: string[]) {
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

  descargarCSV(nombre, lineas)
}

export function exportarAmortizacionCSV(
  nombre: string,
  tabla: TablaAmortizacion,
  fechaDispersion: string | null,
) {
  const lineas: string[] = []
  lineas.push(
    ['No. de pago', 'Fecha', 'Saldo inicial', 'Interés', 'Capital', 'Pago', 'Saldo final', 'Gracia']
      .map(esc)
      .join(','),
  )

  for (const f of tabla.filas) {
    lineas.push(
      [
        f.numero,
        fechaDispersion ? fechaPago(fechaDispersion, f.numero) : '',
        f.saldoInicial,
        f.interes,
        f.capital,
        f.pago,
        f.saldoFinal,
        f.enGracia ? 'Sí' : '',
      ]
        .map(esc)
        .join(','),
    )
  }

  lineas.push('')
  lineas.push(['Monto financiado', tabla.resumen.montoFinanciado].map(esc).join(','))
  lineas.push(['Plazo (meses)', tabla.resumen.plazoMeses].map(esc).join(','))
  lineas.push(['Meses de gracia', tabla.resumen.mesesGracia].map(esc).join(','))
  lineas.push(['Tasa anual (%)', tabla.resumen.tasaAnual].map(esc).join(','))
  lineas.push(['Pago ordinario', tabla.resumen.pagoOrdinario].map(esc).join(','))
  lineas.push(['Total de intereses', tabla.resumen.totalIntereses].map(esc).join(','))
  lineas.push(['Total pagado', tabla.resumen.totalPagado].map(esc).join(','))

  descargarCSV(nombre, lineas)
}
