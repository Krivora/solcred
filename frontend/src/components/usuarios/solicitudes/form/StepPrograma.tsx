'use client'

import { useEffect, useState } from 'react'
import { getProgramas } from '@/lib/api/programas'
import type { Programa } from '@/lib/types/programa.types'
import type { CrearSolicitudDto } from '@/lib/types/solicitudes.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormError } from '@/components/ui/FormError'
import { cn } from '@/lib/utils/cn'
import {
  BadgePercent, Clock, Wallet, ChevronRight,
  Search, Building2, User
} from 'lucide-react'

interface Props {
  onSubmit: (dto: CrearSolicitudDto) => void
  loading: boolean
  error: string | null
}

export function StepPrograma({ onSubmit, loading, error }: Props) {
  const [programas, setProgramas] = useState<Programa[]>([])
  const [selected, setSelected] = useState<Programa | null>(null)
  const [search, setSearch] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    getProgramas().then(setProgramas).catch(() => {})
  }, [])

  function handleSelect(p: Programa) {
    setSelected(p)
    setLocalError(null)
  }

  function handleSubmit() {
    if (!selected) return setLocalError('Selecciona un programa')
    onSubmit({
      programaId: selected.id,

    })
  }

  const filtered = programas.filter((p) =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.descripcion?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Selecciona el programa</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Elige el programa de crédito que mejor se adapte a tus necesidades
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start">

        {/* Lista de programas */}
        <div className="space-y-3">
          {/* Buscador — visible solo si hay más de 4 programas */}
          {programas.length > 4 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar programa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          )}

          <div className="space-y-2">
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No se encontraron programas
              </p>
            )}
            {filtered.map((p) => (
              <ProgramaRow
                key={p.id}
                programa={p}
                isSelected={selected?.id === p.id}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>

        {/* Panel lateral de detalle + inputs */}
        <div className="space-y-3">
          {selected ? (
            <>
              <ProgramaDetail programa={selected} />
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 flex flex-col items-center justify-center text-center gap-2 min-h-[180px]">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Building2 className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Selecciona un programa para ver sus detalles
              </p>
            </div>
          )}
        </div>
      </div>

      <FormError message={localError ?? error} />

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={loading || !selected} className="gap-2">
          Continuar <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

/* ─── Sub-componentes ──────────────────────────────────────────── */

function ProgramaRow({
  programa: p,
  isSelected,
  onSelect,
}: {
  programa: Programa
  isSelected: boolean
  onSelect: (p: Programa) => void
}) {
  return (
    <button
      onClick={() => onSelect(p)}
      className={cn(
        'w-full text-left px-4 py-3 rounded-lg border transition-all duration-150 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isSelected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-border bg-card hover:border-primary/40 hover:bg-accent/20',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Indicador de selección */}
          <div className={cn(
            'shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors',
            isSelected ? 'border-primary' : 'border-muted-foreground/40',
          )}>
            {isSelected && (
              <div className="w-2 h-2 rounded-full bg-primary" />
            )}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{p.nombre}</p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{p.descripcion}</p>
          </div>
        </div>

        {/* Pills de info rápida */}
        <div className="shrink-0 hidden sm:flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {p.tasaOrdinaria}% anual
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground whitespace-nowrap">
            ${(p.montoMaximo / 1000).toFixed(0)}k máx
          </span>
        </div>
      </div>
    </button>
  )
}

function ProgramaDetail({ programa: p }: { programa: Programa }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <div>
        <p className="text-sm font-semibold text-foreground">{p.nombre}</p>
        <p className="text-xs text-muted-foreground mt-1">{p.descripcion}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat
          icon={<Wallet className="w-3.5 h-3.5" />}
          label="Monto máx."
          value={`$${p.montoMaximo.toLocaleString()}`}
        />
        <Stat
          icon={<Clock className="w-3.5 h-3.5" />}
          label="Plazo máx."
          value={`${p.plazoMaximoMeses} meses`}
        />
        <Stat
          icon={<BadgePercent className="w-3.5 h-3.5" />}
          label="Tasa"
          value={`${p.tasaOrdinaria}%`}
        />
      </div>

      <div className="pt-1 border-t border-border flex gap-3">
        {p.permitePersonaFisica && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <User className="w-3.5 h-3.5" />
            Persona Física
          </div>
        )}
        {p.permitePersonaMoral && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Building2 className="w-3.5 h-3.5" />
            Persona Moral
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1 text-muted-foreground">
        {icon}
        <span className="text-[10px]">{label}</span>
      </div>
      <span className="text-xs font-semibold text-foreground">{value}</span>
    </div>
  )
}