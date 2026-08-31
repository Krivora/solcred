'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Check, CloudOff, Lock, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs'
import { ESTATUS_STYLES } from '@/shared/config/solicitudes.config'
import { cn } from '@/shared/lib/cn'
import { TabEnConstruccion } from './TabEnConstruccion'
import { ComentarioTab } from './ComentarioTab'
import { SituacionFinancieraTab } from './situacion-financiera/SituacionFinancieraTab'
import { AjustesCreditoTab } from './ajustes-credito/AjustesCreditoTab'
import type { EstadoGuardado } from '@/features/analisis/hooks/useAnalisis'
import type { Analisis, AnalisisContexto, AnalisisOrigen } from '@/features/analisis/types/analisis.types'

const TABS = [
  { key: 'situacionFinanciera', label: 'Situación Financiera' },
  { key: 'ajustesCredito', label: 'Ajustes del Crédito' },
  { key: 'criteriosEvaluacion', label: 'Criterios de Evaluación' },
  { key: 'amortizacion', label: 'Amortización' },
  { key: 'comentario', label: 'Comentario' },
] as const

function IndicadorGuardado({ estado, editable }: { estado: EstadoGuardado; editable: boolean }) {
  if (!editable) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
        <Lock className="h-3 w-3" /> Solo lectura
      </span>
    )
  }
  const map: Record<EstadoGuardado, { icon: React.ReactNode; text: string; cls: string }> = {
    idle: { icon: <Check className="h-3 w-3" />, text: 'Guardado', cls: 'text-muted-foreground' },
    guardando: { icon: <Loader2 className="h-3 w-3 animate-spin" />, text: 'Guardando…', cls: 'text-primary' },
    ok: { icon: <Check className="h-3 w-3" />, text: 'Guardado', cls: 'text-emerald-600 dark:text-emerald-400' },
    error: { icon: <CloudOff className="h-3 w-3" />, text: 'Sin guardar', cls: 'text-destructive' },
  }
  const s = map[estado]
  return <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-medium', s.cls)}>{s.icon} {s.text}</span>
}

interface Props {
  contexto: AnalisisContexto
  analisis: Analisis
  origen: AnalisisOrigen
  editable: boolean
  guardado: EstadoGuardado
  onGuardarTab: (tab: (typeof TABS)[number]['key'], data: unknown) => void
}

export function AnalisisShell({ contexto, analisis, origen, editable, guardado, onGuardarTab }: Props) {
  const router = useRouter()
  const estatus = ESTATUS_STYLES[contexto.estatus] ?? ESTATUS_STYLES.BORRADOR

  return (
    <div className="p-6">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost" size="icon" className="mt-0.5 h-9 w-9"
              onClick={() => { sessionStorage.setItem('nav-direction', 'atras'); router.back() }}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="rounded-xl bg-primary/10 p-2.5 ring-1 ring-primary/20">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                  Análisis: {contexto.folio}
                </h1>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${estatus.className}`}>
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${estatus.dotClass}`} />
                  {estatus.label}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {contexto.razonSocial ?? 'Solicitante no registrado'} · {contexto.programa}
              </p>
            </div>
          </div>
          <div className="mt-1 shrink-0">
            <IndicadorGuardado estado={guardado} editable={editable} />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="situacionFinanciera" className="gap-4">
          <TabsList className="flex w-full flex-wrap">
            {TABS.map((t) => (
              <TabsTrigger key={t.key} value={t.key}>{t.label}</TabsTrigger>
            ))}
          </TabsList>

          {/* forceMount: conserva el estado (y ediciones sin re-sembrar) al
              cambiar de pestaña — Radix desmonta el contenido inactivo por defecto. */}
          <TabsContent value="situacionFinanciera" forceMount className="data-[state=inactive]:hidden">
            <SituacionFinancieraTab
              inicial={analisis.situacionFinanciera}
              editable={editable}
              onGuardar={(data) => onGuardarTab('situacionFinanciera', data)}
            />
          </TabsContent>

          <TabsContent value="ajustesCredito" forceMount className="data-[state=inactive]:hidden">
            <AjustesCreditoTab
              inicial={analisis.ajustesCredito}
              origen={origen.ajustesCredito}
              editable={editable}
              onGuardar={(data) => onGuardarTab('ajustesCredito', data)}
            />
          </TabsContent>

          <TabsContent value="criteriosEvaluacion"><TabEnConstruccion nombre="Criterios de Evaluación" /></TabsContent>
          <TabsContent value="amortizacion"><TabEnConstruccion nombre="Amortización" /></TabsContent>

          <TabsContent value="comentario" forceMount className="data-[state=inactive]:hidden">
            <ComentarioTab
              inicial={analisis.comentario}
              editable={editable}
              onGuardar={(texto) => onGuardarTab('comentario', texto)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
