'use client'

import { RefreshCw, Clock, TriangleAlert } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/components/ui/button'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { usePanorama } from '@/features/dashboard/hooks/usePanorama'
import { tiempoRelativo } from '@/features/dashboard/lib/dashboard.format'
import { PeriodoSelector } from './PeriodoSelector'
import { KpiBand } from './KpiBand'
import { EmbudoProceso } from './EmbudoProceso'
import { ResolucionDonut } from './ResolucionDonut'
import { TendenciaFlujo } from './TendenciaFlujo'
import { TiempoEtapas } from './TiempoEtapas'
import { CarteraProgramas } from './CarteraProgramas'
import { ComposicionDemanda } from './ComposicionDemanda'
import { CargaEquipo } from './CargaEquipo'
import { AlertasPanel } from './AlertasPanel'
import { ActividadReciente } from './ActividadReciente'
import { PanoramaSkeleton } from './PanoramaSkeleton'

export function PanoramaDashboard() {
  const { panorama, rango, setRango, cargando, refrescando, error, recargar } = usePanorama()

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title="¿Cómo andamos?" description="Panorama general del proceso de crédito" />
        <div className="flex flex-wrap items-center gap-2">
          <PeriodoSelector value={rango} onChange={setRango} />
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={recargar}
            disabled={refrescando}
          >
            <RefreshCw className={cn('size-3.5', refrescando && 'animate-spin text-primary')} />
            Actualizar
          </Button>
        </div>
      </div>

      {panorama && (
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock className="size-3" />
          Actualizado {tiempoRelativo(panorama.generadoEn)}
        </p>
      )}

      {error && !panorama ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border/70 bg-card py-16 text-center">
          <TriangleAlert className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={recargar}>
            Reintentar
          </Button>
        </div>
      ) : cargando || !panorama ? (
        <PanoramaSkeleton />
      ) : (
        <div className={cn('space-y-5', refrescando && 'opacity-60 transition-opacity')}>
          <KpiBand panorama={panorama} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <EmbudoProceso embudo={panorama.embudo} />
            </div>
            <div className="lg:col-span-5">
              <ResolucionDonut resolucion={panorama.resolucion} rango={panorama.rango} />
            </div>

            <div className="lg:col-span-12">
              <TendenciaFlujo tendencia={panorama.tendencia} />
            </div>

            <div className="lg:col-span-6">
              <TiempoEtapas data={panorama.tiempoPorEtapa} />
            </div>
            <div className="lg:col-span-6">
              <CarteraProgramas cartera={panorama.cartera} />
            </div>

            <div className="lg:col-span-12">
              <ComposicionDemanda composicion={panorama.composicion} />
            </div>

            <div className="lg:col-span-4">
              <CargaEquipo equipo={panorama.equipo} />
            </div>
            <div className="lg:col-span-8">
              <AlertasPanel alertas={panorama.alertas} />
            </div>

            <div className="lg:col-span-12">
              <ActividadReciente actividad={panorama.actividad} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
