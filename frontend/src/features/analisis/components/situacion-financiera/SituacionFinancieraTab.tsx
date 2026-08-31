'use client'

import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select'
import { PERIODOS, type PeriodoKey, type SituacionFinancieraData } from '@/features/analisis/types/analisis.types'
import { calcularSituacion } from '@/features/analisis/lib/calculo-situacion-financiera'
import { FILAS_BALANCE, FILAS_RESULTADOS } from '@/features/analisis/lib/cuentas'
import { CuentaGridTabla } from './CuentaGridTabla'
import { CuadreBanner } from './CuadreBanner'
import { exportarEstadoCSV } from '@/features/analisis/lib/export-csv'

const DATA_INICIAL: SituacionFinancieraData = {
  periodos: {
    c1: { etiqueta: 'Año 2', corte: null },
    c2: { etiqueta: 'Año 1', corte: null },
    c3: { etiqueta: 'Parcial', corte: null, meses: 1 },
    c4: { etiqueta: 'Proyección', corte: null },
  },
  balance: {},
  resultados: {},
}

interface Props {
  inicial: SituacionFinancieraData | null
  editable: boolean
  onGuardar: (data: SituacionFinancieraData) => void
}

export function SituacionFinancieraTab({ inicial, editable, onGuardar }: Props) {
  const [data, setData] = useState<SituacionFinancieraData>(() => ({
    ...DATA_INICIAL,
    ...inicial,
    periodos: { ...DATA_INICIAL.periodos, ...inicial?.periodos },
    balance: inicial?.balance ?? {},
    resultados: inicial?.resultados ?? {},
  }))

  const calc = useMemo(() => calcularSituacion(data), [data])

  const actualizar = (next: SituacionFinancieraData) => {
    setData(next)
    if (editable) onGuardar(next)
  }

  const setCelda = (grupo: 'balance' | 'resultados') => (cuenta: string, periodo: PeriodoKey, v: number | null) => {
    const bucket = { ...data[grupo] }
    const fila = { ...(bucket[cuenta] ?? {}) }
    if (v === null) delete fila[periodo]
    else fila[periodo] = v
    bucket[cuenta] = fila
    actualizar({ ...data, [grupo]: bucket })
  }

  const setPeriodo = (c: PeriodoKey, patch: Partial<SituacionFinancieraData['periodos'][PeriodoKey]>) => {
    actualizar({
      ...data,
      periodos: { ...data.periodos, [c]: { ...data.periodos[c], ...patch } },
    })
  }

  return (
    <div className="space-y-6">
      {/* Barra de periodos */}
      <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-muted-foreground/70">Periodos comparativos</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PERIODOS.map((c) => (
            <div key={c} className="space-y-1.5">
              <Input
                value={data.periodos[c].etiqueta}
                onChange={(e) => setPeriodo(c, { etiqueta: e.target.value })}
                disabled={!editable}
                className="h-8 text-xs font-semibold"
              />
              <div className="flex items-center gap-1.5">
                <Input
                  type="date"
                  value={data.periodos[c].corte ?? ''}
                  onChange={(e) => setPeriodo(c, { corte: e.target.value || null })}
                  disabled={!editable}
                  className="h-8 text-[11px]"
                  title="Fecha de corte"
                />
                {c === 'c3' && (
                  <Select
                    value={String(data.periodos.c3.meses ?? 1)}
                    onValueChange={(v) => setPeriodo('c3', { meses: Number(v) })}
                    disabled={!editable}
                  >
                    <SelectTrigger className="h-8 w-[72px] text-[11px]" title="Meses transcurridos (para anualizar)">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <SelectItem key={m} value={String(m)}>{m} m</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cuadre */}
      <CuadreBanner calc={calc} periodos={data.periodos} />

      {/* Balance General */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-primary">1. Estado de Situación Financiera (Balance General)</h3>
          <Button
            variant="outline" size="sm" className="h-7 gap-1.5 text-xs"
            onClick={() => exportarEstadoCSV('Balance_General', 'balance', FILAS_BALANCE, data.periodos, data.balance, calc)}
          >
            <Download className="h-3 w-3" /> CSV
          </Button>
        </div>
        <CuentaGridTabla
          grupo="balance"
          filas={FILAS_BALANCE}
          periodos={data.periodos}
          valores={data.balance}
          calc={calc}
          editable={editable}
          onChange={setCelda('balance')}
        />
      </section>

      {/* Estado de Resultados */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-primary">2. Estado de Resultados</h3>
          <Button
            variant="outline" size="sm" className="h-7 gap-1.5 text-xs"
            onClick={() => exportarEstadoCSV('Estado_Resultados', 'resultados', FILAS_RESULTADOS, data.periodos, data.resultados, calc)}
          >
            <Download className="h-3 w-3" /> CSV
          </Button>
        </div>
        <CuentaGridTabla
          grupo="resultados"
          filas={FILAS_RESULTADOS}
          periodos={data.periodos}
          valores={data.resultados}
          calc={calc}
          editable={editable}
          mostrarDivisor
          onChange={setCelda('resultados')}
        />
      </section>
    </div>
  )
}
