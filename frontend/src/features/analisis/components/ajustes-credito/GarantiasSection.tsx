'use client'

import { Plus, Trash2, ShieldCheck } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select'
import { TIPO_GARANTIA_VALUES, type TipoGarantia } from '@/shared/types/domain.enums'
import type { GarantiaAjuste } from '@/features/analisis/types/analisis.types'
import { TIPO_GARANTIA_LABEL, garantiaVacia, fmtMoney } from '@/features/analisis/lib/ajustes-credito'
import { CeldaMonto } from '../CeldaMonto'
import { CampoNumero } from './CampoNumero'

interface Props {
  garantias: GarantiaAjuste[]
  valorTotal: number
  editable: boolean
  onChange: (garantias: GarantiaAjuste[]) => void
}

function CampoTexto({
  label, value, onChange, disabled, className,
}: {
  label: string
  value: string | null
  onChange: (v: string | null) => void
  disabled?: boolean
  className?: string
}) {
  return (
    <div className={className}>
      <Label className="text-[11px] font-medium text-muted-foreground">{label}</Label>
      <Input
        value={value ?? ''}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value || null)}
        className="mt-1 h-8 text-xs"
      />
    </div>
  )
}

export function GarantiasSection({ garantias, valorTotal, editable, onChange }: Props) {
  const setGarantia = (idx: number, patch: Partial<GarantiaAjuste>) =>
    onChange(garantias.map((g, i) => (i === idx ? { ...g, ...patch } : g)))
  const quitar = (idx: number) => onChange(garantias.filter((_, i) => i !== idx))
  const agregar = (tipo: TipoGarantia) => onChange([...garantias, garantiaVacia(tipo)])

  return (
    <section className="space-y-3 rounded-xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-primary">Garantías</h3>
        </div>
        <span className="text-xs font-semibold tabular-nums text-foreground">
          Total {fmtMoney(valorTotal)}
        </span>
      </div>

      {garantias.length === 0 && (
        <p className="text-[11px] text-muted-foreground/70">Sin garantías capturadas.</p>
      )}

      {garantias.map((g, idx) => (
        <div key={idx} className="space-y-3 rounded-lg border border-border/50 p-3">
          <div className="flex items-center gap-2">
            <Select
              value={g.tipo}
              disabled={!editable}
              onValueChange={(v) => setGarantia(idx, { tipo: v as TipoGarantia })}
            >
              <SelectTrigger className="h-8 w-56 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPO_GARANTIA_VALUES.map((t) => (
                  <SelectItem key={t} value={t}>{TIPO_GARANTIA_LABEL[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex-1" />
            {editable && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => quitar(idx)}
                className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <CampoTexto
              label="Propietario"
              value={g.nombrePropietario}
              disabled={!editable}
              onChange={(v) => setGarantia(idx, { nombrePropietario: v ?? '' })}
            />
            <div>
              <Label className="text-[11px] font-medium text-muted-foreground">Valor</Label>
              <CeldaMonto
                valor={g.valor}
                disabled={!editable}
                onChange={(v) => setGarantia(idx, { valor: v ?? 0 })}
                className="mt-1 h-8 w-full text-xs"
              />
            </div>
          </div>

          <div>
            <Label className="text-[11px] font-medium text-muted-foreground">Descripción</Label>
            <Textarea
              value={g.descripcion ?? ''}
              disabled={!editable}
              onChange={(e) => setGarantia(idx, { descripcion: e.target.value || null })}
              className="mt-1 min-h-[56px] resize-y text-xs"
            />
          </div>

          <details className="group rounded-md border border-border/50 bg-muted/20 px-3 py-2">
            <summary className="cursor-pointer select-none text-[11px] font-semibold text-muted-foreground">
              Detalle del bien
            </summary>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {g.tipo === 'PRENDARIA' ? (
                <>
                  <CampoTexto label="Marca" value={g.marca} disabled={!editable} onChange={(v) => setGarantia(idx, { marca: v })} />
                  <CampoTexto label="Modelo" value={g.modelo} disabled={!editable} onChange={(v) => setGarantia(idx, { modelo: v })} />
                  <CampoNumero
                    label="Año"
                    value={g.anio}
                    disabled={!editable}
                    min={1900}
                    max={new Date().getFullYear() + 1}
                    step={1}
                    onChange={(v) => setGarantia(idx, { anio: v })}
                  />
                  <CampoTexto label="No. de serie / VIN" value={g.numeroSerie} disabled={!editable} onChange={(v) => setGarantia(idx, { numeroSerie: v })} />
                </>
              ) : (
                <>
                  <CampoTexto label="Calle" value={g.calle} disabled={!editable} onChange={(v) => setGarantia(idx, { calle: v })} />
                  <CampoTexto label="No. exterior" value={g.numeroExterior} disabled={!editable} onChange={(v) => setGarantia(idx, { numeroExterior: v })} />
                  <CampoTexto label="No. interior" value={g.numeroInterior} disabled={!editable} onChange={(v) => setGarantia(idx, { numeroInterior: v })} />
                  <CampoTexto label="Colonia" value={g.colonia} disabled={!editable} onChange={(v) => setGarantia(idx, { colonia: v })} />
                  <CampoTexto label="Ciudad" value={g.ciudad} disabled={!editable} onChange={(v) => setGarantia(idx, { ciudad: v })} />
                  <CampoTexto label="Estado" value={g.estado} disabled={!editable} onChange={(v) => setGarantia(idx, { estado: v })} />
                  <CampoTexto label="Código postal" value={g.codigoPostal} disabled={!editable} onChange={(v) => setGarantia(idx, { codigoPostal: v })} />
                  <CampoTexto label="No. de escritura" value={g.numeroEscritura} disabled={!editable} onChange={(v) => setGarantia(idx, { numeroEscritura: v })} />
                  <CampoTexto label="Folio real" value={g.folioReal} disabled={!editable} onChange={(v) => setGarantia(idx, { folioReal: v })} />
                </>
              )}
            </div>
          </details>
        </div>
      ))}

      {editable && (
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => agregar('PRENDARIA')}>
            <Plus className="h-3.5 w-3.5" /> Prendaria
          </Button>
          <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => agregar('HIPOTECARIA')}>
            <Plus className="h-3.5 w-3.5" /> Hipotecaria
          </Button>
        </div>
      )}
    </section>
  )
}
