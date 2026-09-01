'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, CalendarClock, CalendarRange, Download, Info } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { fmtMoney, seedAjustes } from '@/features/analisis/lib/ajustes-credito'
import { calcularAmortizacion, fechaPago, formatFechaPago } from '@/features/analisis/lib/amortizacion'
import { exportarAmortizacionCSV } from '@/features/analisis/lib/export-csv'
import { TablaAmortizacion } from './TablaAmortizacion'
import type {
  AjustesCreditoData,
  AjustesCreditoOrigen,
  AmortizacionData,
} from '@/features/analisis/types/analisis.types'

interface Props {
  /** Lo que el analista ya guardó en Ajustes del Crédito (null si aún no toca esa pestaña). */
  ajustesGuardados: AjustesCreditoData | null
  /** Lo que pidió el cliente — respaldo mientras no haya ajustes guardados. */
  origen: AjustesCreditoOrigen
  inicial: AmortizacionData | null
  editable: boolean
  onGuardar: (data: AmortizacionData) => void
  onIrAAjustesCredito: () => void
}

function EstadisticaResumen({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">{label}</p>
      <p className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-foreground">{valor}</p>
    </div>
  )
}

export function AmortizacionTab({
  ajustesGuardados, origen, inicial, editable, onGuardar, onIrAAjustesCredito,
}: Props) {
  const [datos, setDatos] = useState<AmortizacionData>(() => ({
    fechaDispersion: inicial?.fechaDispersion ?? null,
    observaciones: inicial?.observaciones ?? '',
  }))

  const actualizar = (patch: Partial<AmortizacionData>) => {
    const next = { ...datos, ...patch }
    setDatos(next)
    if (editable) onGuardar(next)
  }

  const usaOrigen = !ajustesGuardados
  const ajustesEfectivos = useMemo(
    () => ajustesGuardados ?? seedAjustes(origen),
    [ajustesGuardados, origen],
  )

  const tabla = useMemo(() => calcularAmortizacion(ajustesEfectivos), [ajustesEfectivos])

  if (!tabla) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-card py-20 text-center">
        <div className="rounded-2xl bg-muted p-4 text-muted-foreground">
          <CalendarRange className="h-6 w-6" />
        </div>
        <div className="max-w-sm">
          <p className="text-sm font-medium text-foreground">Sin datos de crédito para proyectar</p>
          <p className="mt-1 text-xs text-muted-foreground">
            La tabla de amortización necesita un monto y un plazo. Revisa Ajustes del Crédito.
          </p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={onIrAAjustesCredito}>
          Ir a Ajustes del Crédito <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    )
  }

  const { resumen, filas } = tabla
  const fechaDispersion = datos.fechaDispersion ?? null
  const fechaUltimoPago = fechaDispersion ? formatFechaPago(fechaPago(fechaDispersion, resumen.plazoMeses)) : null

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-xl border border-border/60 bg-card px-4 py-2.5 text-[11px] text-muted-foreground">
        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span>
          Proyección a pago fijo (sistema francés) sobre{' '}
          {usaOrigen ? (
            <>lo que pidió el cliente — <button type="button" onClick={onIrAAjustesCredito} className="font-medium text-primary hover:underline">aún no hay ajustes guardados</button>.</>
          ) : (
            <span className="font-medium text-foreground">los Ajustes del Crédito del analista</span>
          )}
          {' '}Se recalcula automáticamente si cambian.
        </span>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-sm">
        <div className="space-y-1">
          <Label htmlFor="fecha-dispersion" className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <CalendarClock className="h-3.5 w-3.5 text-primary" /> Fecha de dispersión
          </Label>
          <Input
            id="fecha-dispersion"
            type="date"
            value={fechaDispersion ?? ''}
            disabled={!editable}
            onChange={(e) => actualizar({ fechaDispersion: e.target.value || null })}
            className="h-9 w-44 text-sm"
          />
        </div>
        <p className="pb-2 text-[11px] text-muted-foreground">
          {fechaDispersion
            ? <>Primer pago {formatFechaPago(fechaPago(fechaDispersion, 1))} · último {fechaUltimoPago}.</>
            : 'Sin fecha, la tabla solo numera los pagos como "Mes 1, Mes 2…".'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <EstadisticaResumen label="Monto financiado" valor={fmtMoney(resumen.montoFinanciado)} />
        <EstadisticaResumen
          label="Plazo"
          valor={`${resumen.plazoMeses} m${resumen.mesesGracia ? ` (${resumen.mesesGracia} gracia)` : ''}`}
        />
        <EstadisticaResumen label="Tasa anual" valor={`${resumen.tasaAnual}%`} />
        <EstadisticaResumen label="Pago ordinario" valor={fmtMoney(resumen.pagoOrdinario)} />
        <EstadisticaResumen label="Total intereses" valor={fmtMoney(resumen.totalIntereses)} />
        <EstadisticaResumen label="Total a pagar" valor={fmtMoney(resumen.totalPagado)} />
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-primary">Tabla de pagos</h3>
        <Button
          variant="outline" size="sm" className="h-7 gap-1.5 text-xs"
          onClick={() => exportarAmortizacionCSV('Tabla_Amortizacion', tabla, fechaDispersion)}
        >
          <Download className="h-3 w-3" /> CSV
        </Button>
      </div>

      <TablaAmortizacion filas={filas} fechaDispersion={fechaDispersion} />

      <div className="space-y-1.5 rounded-xl border border-border/60 bg-card p-4 shadow-sm">
        <Label htmlFor="amortizacion-observaciones" className="text-xs font-semibold text-foreground">
          Observaciones del analista
        </Label>
        <Textarea
          id="amortizacion-observaciones"
          value={datos.observaciones ?? ''}
          disabled={!editable}
          onChange={(e) => actualizar({ observaciones: e.target.value })}
          placeholder="Capacidad de pago frente a esta proyección, riesgos de la etapa de gracia, etc."
          className="min-h-[100px] resize-y text-sm"
        />
      </div>
    </div>
  )
}
