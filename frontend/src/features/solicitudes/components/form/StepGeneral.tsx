'use client'

import { useState } from 'react'
import type { Solicitud,DatosGenerales } from '@/features/solicitudes/types/solicitud.types'
import { TipoPersona,Sector, TamanoEmpresa } from '@/shared/lib/types/solicitudes.types'
import { Button } from '@/shared/components/ui/button'
import { FormError } from '@/shared/components/ui/FormError'
import {
  ChevronLeft, ChevronRight,
  User, Building2,
  Wheat, Factory, ShoppingBag, Headphones, Cpu, LayoutGrid,
  Store, Landmark, Building, TrendingUp,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils/cn'

interface Props {
  solicitud: Solicitud
  onSubmit: (dto: DatosGenerales) => void
  onBack: () => void
  loading: boolean
  error: string | null
}

/* ─── Data ────────────────────────────────────────────────────────────────── */

const TIPO_PERSONA: {
  value: TipoPersona
  label: string
  sublabel: string
  icon: React.ElementType
}[] = [
  {
    value: 'FISICA',
    label: 'Persona Física',
    sublabel: 'Titular o propietario individual',
    icon: User,
  },
  {
    value: 'MORAL',
    label: 'Persona Moral',
    sublabel: 'Empresa constituida legalmente',
    icon: Building2,
  },
]

const SECTORES: { value: Sector; label: string; icon: React.ElementType }[] = [
  { value: 'AGROPECUARIO', label: 'Agropecuario', icon: Wheat },
  { value: 'INDUSTRIAL',   label: 'Industrial',   icon: Factory },
  { value: 'COMERCIAL',    label: 'Comercial',    icon: ShoppingBag },
  { value: 'SERVICIOS',    label: 'Servicios',    icon: Headphones },
  { value: 'TECNOLOGIA',   label: 'Tecnología',   icon: Cpu },
  { value: 'OTRO',         label: 'Otro',         icon: LayoutGrid },
]

const TAMANOS: { value: TamanoEmpresa; label: string; desc: string; icon: React.ElementType }[] = [
  { value: 'MICRO',   label: 'Micro',   desc: 'Hasta 10 empleados',    icon: Store },
  { value: 'PEQUENA', label: 'Pequeña', desc: '11 – 50 empleados',     icon: Landmark },
  { value: 'MEDIANA', label: 'Mediana', desc: '51 – 250 empleados',    icon: Building },
  { value: 'GRANDE',  label: 'Grande',  desc: 'Más de 250 empleados',  icon: TrendingUp },
]

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function OptionCard<T extends string>({
  value,
  selected,
  label,
  sublabel,
  icon: Icon,
  onClick,
  compact = false,
}: {
  value: T
  selected: boolean
  label: string
  sublabel?: string
  icon: React.ElementType
  onClick: (v: T) => void
  compact?: boolean
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={cn(
        'relative flex items-center gap-3 rounded-xl border-2 text-left transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        compact ? 'p-3' : 'p-4',
        selected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-border bg-card hover:border-primary/40 hover:bg-accent/50',
      )}
    >
      {/* Icon bubble */}
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-lg transition-colors duration-150',
          compact ? 'size-8' : 'size-10',
          selected
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground',
        )}
      >
        <Icon className={compact ? 'size-4' : 'size-5'} />
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'font-medium leading-tight',
            compact ? 'text-sm' : 'text-sm',
            selected ? 'text-foreground' : 'text-foreground/80',
          )}
        >
          {label}
        </p>
        {sublabel && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{sublabel}</p>
        )}
      </div>

      {/* Selected dot */}
      {selected && (
        <span className="ml-auto size-2 shrink-0 rounded-full bg-primary" />
      )}
    </button>
  )
}

/* ─── Section wrapper ────────────────────────────────────────────────────── */

function FormSection({
  step,
  label,
  hint,
  children,
}: {
  step: number
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
          {step}
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────────────────────── */

export function StepGeneral({ solicitud, onSubmit, onBack, loading, error }: Props) {
  const [tipoPersona, setTipoPersona] = useState<TipoPersona>(solicitud.tipoPersona ?? 'FISICA')
  const [sector, setSector]           = useState<Sector | ''>(solicitud.sector ?? '')
  const [tamano, setTamano]           = useState<TamanoEmpresa | ''>(solicitud.tamanoEmpresa ?? '')
  const [localError, setLocalError]   = useState<string | null>(null)

  function handleSubmit() {
    if (!sector) return setLocalError('Por favor selecciona un sector para continuar.')
    if (!tamano) return setLocalError('Por favor selecciona el tamaño de empresa para continuar.')
    setLocalError(null)
    onSubmit({ tipoPersona, sector, tamanoEmpresa: tamano })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Datos generales
        </h2>
        <p className="text-sm text-muted-foreground">
          Información sobre el solicitante y su actividad económica.
        </p>
      </div>

      {/* ① Tipo de persona */}
      <FormSection step={1} label="Tipo de solicitante">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TIPO_PERSONA.map((t) => (
            <OptionCard
              key={t.value}
              value={t.value}
              selected={tipoPersona === t.value}
              label={t.label}
              sublabel={t.sublabel}
              icon={t.icon}
              onClick={setTipoPersona}
            />
          ))}
        </div>
      </FormSection>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* ② Sector */}
      <FormSection
        step={2}
        label="Sector económico"
        hint="Sector al que pertenece el negocio"
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SECTORES.map((s) => (
            <OptionCard
              key={s.value}
              value={s.value}
              selected={sector === s.value}
              label={s.label}
              icon={s.icon}
              onClick={(v) => { setSector(v); setLocalError(null) }}
              compact
            />
          ))}
        </div>
      </FormSection>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* ③ Tamaño (opcional) */}
      <FormSection
        step={3}
        label="Tamaño de empresa"
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TAMANOS.map((t) => (
            <OptionCard
              key={t.value}
              value={t.value}
              selected={tamano === t.value}
              label={t.label}
              sublabel={t.desc}
              icon={t.icon}
              onClick={(v) => setTamano(v)}
              compact
            />
          ))}
        </div>
      </FormSection>

      {/* Error */}
      <FormError message={localError ?? error} />

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="size-4" />
          Atrás
        </Button>
        <Button onClick={handleSubmit} disabled={loading} className="gap-2 px-6">
          {loading ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              Guardando…
            </>
          ) : (
            <>
              Continuar
              <ChevronRight className="size-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}