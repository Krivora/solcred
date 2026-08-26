'use client'

import { useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { cn } from '@/shared/lib/utils/cn'
import {
    CheckCircle2,
    AlertCircle,
    ChevronDown,
    Loader2,
    PartyPopper,
} from 'lucide-react'

interface ResultadoAsignacion {
    solicitudId: string
    exito: boolean
    mensaje?: string
}

interface EstadoAsignacionAutomatica {
    total: number
    exitosas: number
    fallidas: ResultadoAsignacion[]
    enProceso: boolean
    finalizado: boolean
}

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    estado: EstadoAsignacionAutomatica
    folioPorId?: Record<string, string>
}

// Techo hasta donde llega el progreso simulado mientras esperamos al servidor.
// Nunca toca 100% por sí solo — eso solo pasa cuando la respuesta real llega.
const TECHO_SIMULADO = 92

export function AsignacionMasivaDialog({ open, onOpenChange, estado, folioPorId }: Props) {
    const [erroresAbiertos, setErroresAbiertos] = useState(false)
    const [progresoSimulado, setProgresoSimulado] = useState(0)
    const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const procesadas = estado.exitosas + estado.fallidas.length
    const sinErrores = estado.finalizado && estado.fallidas.length === 0
    const conErrores = estado.finalizado && estado.fallidas.length > 0

    // colapsa automáticamente el panel de errores cada vez que se abre un nuevo lote
    useEffect(() => {
        if (open) setErroresAbiertos(false)
    }, [open])

    // ── Progreso simulado: sube rápido al inicio, se frena según se acerca al techo ──
    useEffect(() => {
        if (estado.enProceso) {
            setProgresoSimulado(0)

            intervaloRef.current = setInterval(() => {
                setProgresoSimulado((prev) => {
                    if (prev >= TECHO_SIMULADO) return prev
                    // easing: entre más cerca del techo, pasos más pequeños
                    const distanciaRestante = TECHO_SIMULADO - prev
                    const incremento = Math.max(0.4, distanciaRestante * 0.06)
                    return Math.min(TECHO_SIMULADO, prev + incremento)
                })
            }, 120)
        } else {
            if (intervaloRef.current) clearInterval(intervaloRef.current)
            // al terminar (con o sin errores), completa la barra de una vez
            if (estado.finalizado) setProgresoSimulado(100)
        }

        return () => {
            if (intervaloRef.current) clearInterval(intervaloRef.current)
        }
    }, [estado.enProceso, estado.finalizado])

    const porcentajeMostrado = estado.enProceso
        ? Math.round(progresoSimulado)
        : estado.finalizado
            ? 100
            : 0

    return (
        <Dialog open={open} onOpenChange={estado.enProceso ? undefined : onOpenChange}>
            <DialogContent
                className="sm:max-w-[440px] gap-0 p-0 overflow-hidden"
                onInteractOutside={(e) => estado.enProceso && e.preventDefault()}
                onEscapeKeyDown={(e) => estado.enProceso && e.preventDefault()}
            >
                {/* ── Encabezado ─────────────────────────────────────────── */}
                <div className="px-6 pt-6 pb-5">
                    <DialogHeader className="space-y-1">
                        <div className="flex items-center gap-2.5">
                            <div
                                className={cn(
                                    'flex h-8 w-8 items-center justify-center rounded-full shrink-0 transition-colors duration-300',
                                    estado.enProceso && 'bg-primary/10',
                                    sinErrores && 'bg-emerald-500/10',
                                    conErrores && 'bg-amber-500/10'
                                )}
                            >
                                {estado.enProceso && (
                                    <Loader2 className="h-4 w-4 text-primary animate-spin" />
                                )}
                                {sinErrores && (
                                    <PartyPopper className="h-4 w-4 text-emerald-600" />
                                )}
                                {conErrores && (
                                    <AlertCircle className="h-4 w-4 text-amber-600" />
                                )}
                            </div>
                            <DialogTitle className="text-base font-semibold">
                                {estado.enProceso && 'Asignando solicitudes'}
                                {sinErrores && 'Todo asignado'}
                                {conErrores && 'Asignación completada'}
                            </DialogTitle>
                        </div>
                        <p className="text-sm text-muted-foreground pl-[42px]">
                            {estado.enProceso &&
                                `Procesando ${estado.total} ${estado.total === 1 ? 'solicitud' : 'solicitudes'}, no cierres esta ventana`}
                            {sinErrores &&
                                `${estado.exitosas} ${estado.exitosas === 1 ? 'solicitud fue asignada' : 'solicitudes fueron asignadas'} correctamente`}
                            {conErrores &&
                                `${estado.exitosas} de ${estado.total} asignadas · ${estado.fallidas.length} con error`}
                        </p>
                    </DialogHeader>
                </div>

                {/* ── Barra de progreso ──────────────────────────────────── */}
                <div className="px-6">
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                            className={cn(
                                'h-full rounded-full',
                                estado.enProceso && 'bg-primary transition-[width] duration-150 ease-linear',
                                (sinErrores || conErrores) && 'transition-[width] duration-500 ease-out',
                                sinErrores && 'bg-emerald-500',
                                conErrores && 'bg-amber-500'
                            )}
                            style={{ width: `${porcentajeMostrado}%` }}
                        />
                    </div>
                </div>

                {/* ── Contadores ─────────────────────────────────────────── */}
                <div className="px-6 pt-4 pb-1">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
                            <div className="flex items-center gap-1.5 text-emerald-600">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span className="text-[11px] font-medium uppercase tracking-wide">
                                    Asignadas
                                </span>
                            </div>
                            <p className="mt-1 text-xl font-semibold tabular-nums">
                                {estado.exitosas}
                            </p>
                        </div>
                        <div
                            className={cn(
                                'rounded-lg border px-3 py-2.5 transition-colors',
                                estado.fallidas.length > 0
                                    ? 'border-destructive/20 bg-destructive/5'
                                    : 'border-border/60 bg-muted/30'
                            )}
                        >
                            <div
                                className={cn(
                                    'flex items-center gap-1.5',
                                    estado.fallidas.length > 0 ? 'text-destructive' : 'text-muted-foreground'
                                )}
                            >
                                <AlertCircle className="h-3.5 w-3.5" />
                                <span className="text-[11px] font-medium uppercase tracking-wide">
                                    Con error
                                </span>
                            </div>
                            <p className="mt-1 text-xl font-semibold tabular-nums">
                                {estado.fallidas.length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Panel de errores, colapsable ───────────────────────── */}
                {estado.fallidas.length > 0 && (
                    <div className="px-6 pt-3">
                        <button
                            type="button"
                            onClick={() => setErroresAbiertos((v) => !v)}
                            className="flex w-full items-center justify-between py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <span>Ver detalle de errores</span>
                            <ChevronDown
                                className={cn(
                                    'h-4 w-4 transition-transform duration-200',
                                    erroresAbiertos && 'rotate-180'
                                )}
                            />
                        </button>

                        <div
                            className={cn(
                                'grid transition-[grid-template-rows] duration-300 ease-out',
                                erroresAbiertos ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                            )}
                        >
                            <div className="overflow-hidden">
                                <ScrollArea className="h-44 rounded-lg border border-border/60 mb-1">
                                    <ul className="divide-y divide-border/40">
                                        {estado.fallidas.map((f) => (
                                            <li
                                                key={f.solicitudId}
                                                className="flex items-start gap-2.5 px-3 py-2.5"
                                            >
                                                <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-xs font-medium text-foreground">
                                                        {folioPorId?.[f.solicitudId] ?? `#${f.solicitudId.slice(0, 8)}`}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {f.mensaje}
                                                    </p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </ScrollArea>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Footer ──────────────────────────────────────────────── */}
                <div className="px-6 py-4 mt-2 border-t border-border/60 bg-muted/20">
                    {estado.enProceso ? (
                        <p className="text-center text-xs text-muted-foreground tabular-nums">
                            {porcentajeMostrado}%
                        </p>
                    ) : (
                        <Button onClick={() => onOpenChange(false)} className="w-full" size="sm">
                            Cerrar
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}