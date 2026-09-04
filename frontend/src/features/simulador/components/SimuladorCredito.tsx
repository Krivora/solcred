'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Calculator, RefreshCw, ArrowRight } from 'lucide-react'
import { simuladorApi } from '@/features/simulador/api/simulador.api'
import { calcularPagoEstimado } from '@/features/simulador/lib/pago'
import type { ProgramaPublico } from '@/features/simulador/types/simulador.types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Label } from '@/shared/components/ui/label'
import { Input } from '@/shared/components/ui/input'
import { MontoInput } from '@/shared/components/common/MontoInput'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'

const formatoMXN = (v: number) =>
  v.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })

export function SimuladorCredito() {
  const [programas, setProgramas] = useState<ProgramaPublico[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [programaId, setProgramaId] = useState<string>('')
  const [monto, setMonto] = useState('')
  const [plazo, setPlazo] = useState('')

  // Sin setState síncrono en el cuerpo: `cargando`/`error` arrancan en su
  // valor inicial y solo se tocan dentro de los callbacks async de abajo.
  const cargar = () => {
    simuladorApi
      .listarProgramas()
      .then((data) => {
        setProgramas(data)
        if (data.length > 0) setProgramaId((prev) => prev || data[0].id)
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : 'No se pudieron cargar los programas de crédito.'),
      )
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    cargar()
  }, [])

  const reintentar = () => {
    setCargando(true)
    setError(null)
    cargar()
  }

  const programa = programas.find((p) => p.id === programaId) ?? null

  const montoNum = Number(monto)
  const plazoNum = Number(plazo)

  const montoFueraDeRango =
    programa !== null && monto !== '' && (montoNum < programa.montoMinimo || montoNum > programa.montoMaximo)
  const plazoFueraDeRango =
    programa !== null && plazo !== '' && (plazoNum < programa.plazoMinimoMeses || plazoNum > programa.plazoMaximoMeses)

  const resultado = useMemo(() => {
    if (!programa || !monto || !plazo || montoFueraDeRango || plazoFueraDeRango) return null
    return calcularPagoEstimado(montoNum, plazoNum, programa.tasaAnual)
  }, [programa, monto, plazo, montoNum, plazoNum, montoFueraDeRango, plazoFueraDeRango])

  if (cargando) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (error || programas.length === 0) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-sm text-muted-foreground">
          {error ?? 'No hay programas de crédito disponibles en este momento.'}
        </p>
        <Button variant="outline" size="sm" onClick={reintentar} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label>Programa de crédito</Label>
        <Select value={programaId} onValueChange={setProgramaId}>
          <SelectTrigger className="w-full"><SelectValue placeholder="Selecciona un programa" /></SelectTrigger>
          <SelectContent>
            {programas.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {programa && (
          <p className="text-xs text-muted-foreground">
            Entre {formatoMXN(programa.montoMinimo)} y {formatoMXN(programa.montoMaximo)} ·{' '}
            {programa.plazoMinimoMeses} a {programa.plazoMaximoMeses} meses · Tasa anual {programa.tasaAnual}%
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Monto que necesitas</Label>
          <MontoInput value={monto} onChange={setMonto} />
          {montoFueraDeRango && programa && (
            <p className="text-xs text-destructive">
              Debe estar entre {formatoMXN(programa.montoMinimo)} y {formatoMXN(programa.montoMaximo)}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Plazo (meses)</Label>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Ej. 24"
            value={plazo}
            onChange={(e) => setPlazo(e.target.value)}
          />
          {plazoFueraDeRango && programa && (
            <p className="text-xs text-destructive">
              Debe estar entre {programa.plazoMinimoMeses} y {programa.plazoMaximoMeses} meses
            </p>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4">
        {resultado ? (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Calculator className="h-3.5 w-3.5" />
              Estimación
            </div>
            <p className="text-2xl font-semibold text-foreground">
              {formatoMXN(resultado.pagoMensual)}
              <span className="text-sm font-normal text-muted-foreground"> / mes</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Total a pagar {formatoMXN(resultado.totalPagar)} · Intereses {formatoMXN(resultado.totalIntereses)}
            </p>
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Elige un monto y un plazo dentro del rango del programa para ver tu pago estimado.
          </p>
        )}
        <p className="mt-3 text-[11px] text-muted-foreground/70">
          Estimado, no es una oferta vinculante — sujeto a aprobación y a las condiciones finales del comité de crédito.
        </p>
      </div>

      <Button asChild className="w-full gap-1.5">
        <Link href="/registro">
          Solicita tu crédito
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  )
}
