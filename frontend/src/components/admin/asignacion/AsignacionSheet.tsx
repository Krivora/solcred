// components/admin/asignacion/AsignacionSheet.tsx
'use client'

import { useEffect, useState } from 'react'
import { UserCheck, Loader2, User, AlertCircle } from 'lucide-react'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { CargaBadge } from './CargaBadge'
import { useAsignacion } from '@/lib/hooks/useAsignacion'
import type { GestorConCarga } from '@/lib/types/asignacion.types'

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    solicitudId: string
    folio: string
    gestorActualId?: string
    onAsignado?: () => void
}

function GestorCard({
    gestor,
    seleccionado,
    onSeleccionar,
}: {
    gestor: GestorConCarga
    seleccionado: boolean
    onSeleccionar: () => void
}) {
    const iniciales = `${gestor.nombre[0]}${gestor.apellidoPaterno[0]}`.toUpperCase()

    return (
        <button
            onClick={onSeleccionar}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150 ${seleccionado
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border/60 hover:border-primary/30 hover:bg-accent/40'
                }`}
        >
            {/* Avatar */}
            <div
                className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${seleccionado
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-accent text-accent-foreground'
                    }`}
            >
                {iniciales}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                    {gestor.nombre} {gestor.apellidoPaterno}
                </p>
                <p className="text-xs text-muted-foreground truncate">{gestor.correo}</p>
            </div>

            {/* Carga */}
            <CargaBadge carga={gestor.cargaActual} />
        </button>
    )
}

export function AsignacionSheet({
    open,
    onOpenChange,
    solicitudId,
    folio,
    gestorActualId,
    onAsignado,
}: Props) {
    const { gestores, cargandoGestores, asignando, cargarGestores, asignarManualmente } =
        useAsignacion()

    const [gestorSeleccionado, setGestorSeleccionado] = useState<string | null>(null)
    const [motivo, setMotivo] = useState('')

    // Cargar gestores cuando abre el sheet
    useEffect(() => {
        if (open) {
            cargarGestores()
            setGestorSeleccionado(null)
            setMotivo('')
        }
    }, [open, cargarGestores])

    const esReasignacion = !!gestorActualId
    const puedeConfirmar =
        !!gestorSeleccionado && gestorSeleccionado !== gestorActualId

    const handleConfirmar = async () => {
        if (!gestorSeleccionado) return

        const ok = await asignarManualmente(
            solicitudId,
            {
                gestorId: gestorSeleccionado,
                motivo: motivo.trim() || undefined,
            },
            () => {
                onOpenChange(false)
                onAsignado?.()
            }
        )
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md flex flex-col gap-0 p-0">
                {/* Header */}
                <SheetHeader className="px-6 py-5 border-b border-border/60">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <UserCheck className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <SheetTitle className="text-base">
                                {esReasignacion ? 'Reasignar solicitud' : 'Asignar solicitud'}
                            </SheetTitle>
                            <SheetDescription className="text-xs mt-0.5">
                                Folio{' '}
                                <span className="font-mono font-semibold text-foreground">
                                    {folio}
                                </span>
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                {/* Contenido con scroll */}
                <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

                    {/* Lista de gestores */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between mb-1">
                            <Label className="text-xs font-semibold text-foreground">
                                Selecciona un gestor
                            </Label>
                            <span className="text-[10px] text-muted-foreground">
                                {gestores.length} disponibles
                            </span>
                        </div>

                        {cargandoGestores ? (
                            <div className="flex flex-col gap-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-[60px] w-full rounded-xl" />
                                ))}
                            </div>
                        ) : gestores.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-8 text-center">
                                <div className="p-3 bg-muted rounded-full">
                                    <User className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    No hay gestores disponibles
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {gestores.map((gestor) => (
                                    <GestorCard
                                        key={gestor.id}
                                        gestor={gestor}
                                        seleccionado={gestorSeleccionado === gestor.id}
                                        onSeleccionar={() => setGestorSeleccionado(gestor.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Motivo — solo en reasignación o si hay gestor seleccionado */}
                    {(esReasignacion || gestorSeleccionado) && (
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="motivo" className="text-xs font-semibold text-foreground">
                                {esReasignacion ? 'Motivo de reasignación' : 'Comentario'}
                                {!esReasignacion && (
                                    <span className="text-muted-foreground font-normal ml-1">(opcional)</span>
                                )}
                            </Label>
                            <Textarea
                                id="motivo"
                                placeholder={
                                    esReasignacion
                                        ? 'Indica el motivo de la reasignación...'
                                        : 'Algún comentario sobre esta asignación...'
                                }
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
                                className="resize-none text-sm border-border/60 focus-visible:border-primary/50 focus-visible:ring-primary/20"
                                rows={3}
                            />
                            {esReasignacion && !motivo.trim() && (
                                <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                                    <AlertCircle className="h-3 w-3 shrink-0" />
                                    <span>Se recomienda indicar el motivo de la reasignación</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer con acciones */}
                <div className="px-6 py-4 border-t border-border/60 flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="flex-1 border-border/60"
                        onClick={() => onOpenChange(false)}
                        disabled={asignando}
                    >
                        Cancelar
                    </Button>
                    <Button
                        className="flex-1 bg-primary hover:bg-primary/90"
                        onClick={handleConfirmar}
                        disabled={!puedeConfirmar || asignando}
                    >
                        {asignando ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                                Asignando...
                            </>
                        ) : esReasignacion ? (
                            'Reasignar'
                        ) : (
                            'Asignar'
                        )}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}