'use client'

import { useCallback, useEffect, useState } from 'react'
import { getProgramas } from '@/features/solicitudes/api/programas.api'
import type { Programa } from '@/features/settings/types/programa.types'
import type { CrearSolicitudDto } from '@/features/solicitudes/types/solicitud.types'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { FormError } from '@/shared/components/common/FormError'
import { cn } from '@/shared/lib/cn'
import { StepHeader } from './StepHeader'
import {
  ChevronRight, Search, Building2, User,
  ArrowDown, ArrowUp, LayoutGrid, AlertCircle, RefreshCw,
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
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)

  // Solo dispara el fetch; el estado se actualiza en los callbacks (async).
  const ejecutarCarga = useCallback(() => {
    getProgramas()
      .then(setProgramas)
      .catch((e) =>
        setErrorCarga(e instanceof Error ? e.message : 'No se pudieron cargar los programas de crédito.'),
      )
      .finally(() => setCargando(false))
  }, [])

  useEffect(() => {
    ejecutarCarga()
  }, [ejecutarCarga])

  const reintentarCarga = () => {
    setCargando(true)
    setErrorCarga(null)
    ejecutarCarga()
  }

  function handleSelect(p: Programa) {
    setSelected(p)
    setLocalError(null)
  }

  function handleSubmit() {
    if (!selected) return setLocalError('Selecciona un programa para continuar')
    onSubmit({ programaId: selected.id })
  }

  const filtered = programas.filter(
    (p) =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <StepHeader
        icon={LayoutGrid}
        title="Selecciona el programa"
        subtitle="Elige el programa de crédito que mejor se adapte a tus necesidades."
      />

      {/* Buscador */}
      {!cargando && !errorCarga && programas.length > 4 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar programa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {/* Estado: cargando */}
      {cargando && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <div className="border-t border-border pt-3 space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estado: error de carga */}
      {!cargando && errorCarga && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 py-10 px-4 text-center">
          <AlertCircle className="h-6 w-6 text-destructive" />
          <p className="text-sm text-destructive">{errorCarga}</p>
          <Button variant="outline" size="sm" onClick={reintentarCarga} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Reintentar
          </Button>
        </div>
      )}

      {/* Estado: sin programas configurados */}
      {!cargando && !errorCarga && programas.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm font-medium text-foreground">No hay programas de crédito disponibles</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Vuelve más tarde o contacta a un administrador.
          </p>
        </div>
      )}

      {/* Estado: búsqueda sin resultados */}
      {!cargando && !errorCarga && programas.length > 0 && filtered.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No se encontraron programas para «{search}»
        </div>
      )}

      {/* Grid de cards */}
      {!cargando && !errorCarga && filtered.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {filtered.map((p) => (
            <ProgramaCard
              key={p.id}
              programa={p}
              isSelected={selected?.id === p.id}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}

      <FormError message={localError ?? error} />

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={loading || cargando || !selected} className="gap-2">
          Continuar <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

/* ─── Card de programa ─────────────────────────────────────────── */

function ProgramaCard({
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
        'group relative w-full text-left rounded-xl border transition-all duration-150 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'flex flex-col gap-3 p-4',
        isSelected
          ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
          : 'border-border bg-card hover:border-primary/40 hover:bg-accent/10',
      )}
    >
      {/* Indicador de selección */}
      <div
        className={cn(
          'absolute top-3 right-3 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors',
          isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30 group-hover:border-primary/40',
        )}
      >
        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
      </div>

      {/* Nombre */}
      <div className="pr-5">
        <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
          {p.nombre}
        </p>
      </div>

      {/* Descripción / objetivo */}
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 flex-1">
        {p.descripcion ?? 'Sin descripción disponible'}
      </p>

      {/* Separador */}
      <div className="border-t border-border" />

      {/* Montos */}
      <div className="space-y-1.5">
        <MontoRow
          icon={<ArrowDown className="w-3 h-3 text-ok" />}
          label="Monto mín."
          value={`$${(p.montoMinimo ?? 0).toLocaleString('es-MX')}`}
        />
        <MontoRow
          icon={<ArrowUp className="w-3 h-3 text-primary" />}
          label="Monto máx."
          value={`$${p.montoMaximo.toLocaleString('es-MX')}`}
        />
      </div>

      {/* Badges persona */}
      <div className="flex flex-wrap gap-1.5 mt-auto">
        {p.permitePersonaFisica && (
          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">
            <User className="w-2.5 h-2.5" />
            Física
          </span>
        )}
        {p.permitePersonaMoral && (
          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">
            <Building2 className="w-2.5 h-2.5" />
            Moral
          </span>
        )}
      </div>
    </button>
  )
}

function MontoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1 text-muted-foreground">
        {icon}
        <span className="text-[10px]">{label}</span>
      </div>
      <span className="text-xs font-semibold text-foreground tabular-nums">{value}</span>
    </div>
  )
}