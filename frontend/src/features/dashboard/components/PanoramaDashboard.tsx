'use client'

import { useState } from 'react'
import { RefreshCw, Clock, TriangleAlert, ChevronDown } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/components/ui/button'
import { usePanorama } from '@/features/dashboard/hooks/usePanorama'
import { tiempoRelativo } from '@/features/dashboard/lib/dashboard.format'
import { PeriodoSelector } from './PeriodoSelector'
import { PipelineMesas } from './PipelineMesas'
import { KpiBand } from './KpiBand'
import { AlertasPanel } from './AlertasPanel'
import { EmbudoFormulario } from './EmbudoFormulario'
import { TendenciaFlujo } from './TendenciaFlujo'
import { TiempoEtapas } from './TiempoEtapas'
import { CarteraProgramas } from './CarteraProgramas'
import { TendenciaAprobacion } from './TendenciaAprobacion'
import { ComposicionDemanda } from './ComposicionDemanda'
import { CargaEquipo } from './CargaEquipo'
import { ActividadReciente } from './ActividadReciente'
import { PanoramaSkeleton } from './PanoramaSkeleton'

export function PanoramaDashboard() {
  const { panorama, rango, setRango, cargando, refrescando, error, recargar } = usePanorama()
  const [detalleAbierto, setDetalleAbierto] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-title text-foreground">Panorama de crédito</h1>
          <p className="mt-0.5 text-body-sm text-muted-foreground">
            Proceso de originación · de la solicitud al dictamen
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PeriodoSelector value={rango} onChange={setRango} />
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={recargar}
            disabled={refrescando}
          >
            <RefreshCw className={cn('size-3.5', refrescando && 'animate-spin text-brand-ink')} />
            Actualizar
          </Button>
        </div>
      </div>

      {panorama && (
        <p className="flex items-center gap-1.5 text-caption text-muted-foreground">
          <Clock className="size-3" />
          Actualizado {tiempoRelativo(panorama.generadoEn)}
        </p>
      )}

      {error && !panorama ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card py-16 text-center">
          <TriangleAlert className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={recargar}>
            Reintentar
          </Button>
        </div>
      ) : cargando || !panorama ? (
        <PanoramaSkeleton />
      ) : (
        <div className={cn('space-y-8', refrescando && 'opacity-60 transition-opacity')}>
          {/* ── Zona A: lo que responde "¿cómo andamos ahora mismo?" ── */}
          <div className="space-y-6">
            <PipelineMesas panorama={panorama} />

            {panorama.alertas.length > 0 && <AlertasPanel alertas={panorama.alertas} />}

            <KpiBand panorama={panorama} />

            <TendenciaFlujo
              tendencia={panorama.tendencia}
              resolucion={panorama.resolucion}
              rango={panorama.rango}
            />

            <ActividadReciente actividad={panorama.actividad} />
          </div>

          {/* ── Zona B: diagnóstico — no es lo primero que se mira cada día ── */}
          <div className="border-t border-border pt-5">
            <button
              type="button"
              onClick={() => setDetalleAbierto((v) => !v)}
              aria-expanded={detalleAbierto}
              aria-controls="panorama-detalle"
              className="flex items-center gap-1.5 text-caption font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronDown className={cn('size-3.5 transition-transform', detalleAbierto && 'rotate-180')} />
              {detalleAbierto ? 'Ocultar detalle' : 'Ver detalle completo'}
              <span className="font-normal text-ink-subtle">
                — dónde se atora, cartera, composición, equipo y formulario
              </span>
            </button>

            {detalleAbierto && (
              <div id="panorama-detalle" className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
                <div className="lg:col-span-6">
                  <TiempoEtapas data={panorama.tiempoPorEtapa} />
                </div>
                <div className="lg:col-span-6">
                  <CarteraProgramas cartera={panorama.cartera} />
                </div>

                <div className="lg:col-span-12">
                  <TendenciaAprobacion tendencia={panorama.tendenciaAprobacion} />
                </div>

                {panorama.embudoFormulario && (
                  <div className="lg:col-span-12">
                    <EmbudoFormulario embudo={panorama.embudoFormulario} />
                  </div>
                )}

                <div className="lg:col-span-12">
                  <ComposicionDemanda composicion={panorama.composicion} />
                </div>

                <div className="lg:col-span-12">
                  <CargaEquipo equipo={panorama.equipo} desempeno={panorama.desempeno} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
