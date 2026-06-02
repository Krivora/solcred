// app/(dashboard)/dashboard/admin/configuracion/grupos/page.tsx
'use client'

import { useState } from 'react'
import {
    Plus, Trash2, Pencil, Users,
    ShieldCheck, AlertCircle, Layers, Zap
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/shared/components/ui/dialog'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/shared/components/ui/sheet'
import { GrupoForm } from '@/features/asignacion/components/GrupoForm'
import { useGrupos } from '@/features/grupos/hooks/useGrupos'
import type { GrupoGestion, CrearGrupoDto, ActualizarGrupoDto, GestorResumen } from '@/features/asignacion/types/asignacion.types'
import { CAMPO_LABELS, OPERADOR_LABELS } from '@/features/asignacion/types/asignacion.types'
import { cn } from '@/shared/lib/utils/cn'
import { useUsuarios } from '@/features/usuarios/hooks/useUsuarios'
import { PageHeader } from '@/shared/components/ui/PageHeader'


// ─── Helpers ──────────────────────────────────────────────────────────────────

function ReglaChip({ campo, operador, valor }: { campo: string; operador: string; valor: string }) {
    let valorDisplay = valor
    try {
        const parsed = JSON.parse(valor)
        if (Array.isArray(parsed)) valorDisplay = parsed.join(', ')
    } catch { }

    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent/60 border border-border/40 text-[11px] text-accent-foreground font-medium">
            <span className="text-muted-foreground">{CAMPO_LABELS[campo as keyof typeof CAMPO_LABELS] ?? campo}</span>
            <span className="text-muted-foreground/60">·</span>
            <span>{OPERADOR_LABELS[operador as keyof typeof OPERADOR_LABELS] ?? operador}</span>
            <span className="text-muted-foreground/60">·</span>
            <span className="font-semibold">{valorDisplay}</span>
        </span>
    )
}

function GrupoCard({
    grupo,
    onEditar,
    onEliminar,
}: {
    grupo: GrupoGestion
    onEditar: (g: GrupoGestion) => void
    onEliminar: (g: GrupoGestion) => void
}) {
    const esGeneral = grupo.reglas.length === 0
    const gestoresActivos = grupo.gestores.filter(g => g.activo)

    return (
        <div className={cn(
            'group relative flex flex-col gap-4 p-5 rounded-xl border bg-card transition-all duration-150',
            grupo.activo
                ? 'border-border/60 hover:border-primary/30 hover:shadow-sm'
                : 'border-border/40 opacity-60'
        )}>
            {/* Prioridad indicator */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
                {esGeneral && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-semibold text-primary border border-primary/20">
                        <Zap className="h-2.5 w-2.5" />
                        Fallback
                    </span>
                )}
                {!grupo.activo && (
                    <Badge variant="secondary" className="text-[10px] h-5">Inactivo</Badge>
                )}
                <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                    P{grupo.prioridad}
                </span>
            </div>

            {/* Header */}
            <div className="flex items-start gap-3 pr-24">
                <div className="shrink-0 p-2 rounded-lg bg-primary/10">
                    <Layers className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground leading-tight">{grupo.nombre}</h3>
                    {grupo.descripcion && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{grupo.descripcion}</p>
                    )}
                </div>
            </div>

            {/* Reglas */}
            <div className="flex flex-col gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Reglas</p>
                {esGeneral ? (
                    <p className="text-xs text-muted-foreground italic">
                        Sin reglas — recibe todas las solicitudes sin grupo
                    </p>
                ) : (
                    <div className="flex flex-wrap gap-1.5">
                        {grupo.reglas.map(r => (
                            <ReglaChip key={r.id} campo={r.campo} operador={r.operador} valor={r.valor} />
                        ))}
                    </div>
                )}
            </div>

            {/* Gestores */}
            <div className="flex items-center justify-between pt-1 border-t border-border/40">
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                        {gestoresActivos.slice(0, 4).map((gg) => {
                            const iniciales = `${gg.gestor.nombre[0]}${gg.gestor.apellidoPaterno[0]}`.toUpperCase()
                            return (
                                <div
                                    key={gg.gestorId}
                                    className="w-6 h-6 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center text-[9px] font-bold text-primary"
                                    title={`${gg.gestor.nombre} ${gg.gestor.apellidoPaterno}`}
                                >
                                    {iniciales}
                                </div>
                            )
                        })}
                        {gestoresActivos.length > 4 && (
                            <div className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[9px] font-medium text-muted-foreground">
                                +{gestoresActivos.length - 4}
                            </div>
                        )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {gestoresActivos.length} gestor{gestoresActivos.length !== 1 ? 'es' : ''}
                    </span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => onEditar(grupo)}
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onEliminar(grupo)}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

// ─── Dialog de confirmación de eliminación ────────────────────────────────────

function EliminarDialog({
    grupo,
    open,
    onOpenChange,
    onConfirmar,
    cargando,
}: {
    grupo: GrupoGestion | null
    open: boolean
    onOpenChange: (v: boolean) => void
    onConfirmar: () => void
    cargando: boolean
}) {
    if (!grupo) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-destructive/10 rounded-lg">
                            <AlertCircle className="h-4 w-4 text-destructive" />
                        </div>
                        <DialogTitle className="text-base">Desactivar grupo</DialogTitle>
                    </div>
                    <DialogDescription className="text-sm">
                        ¿Desactivar <strong className="text-foreground">{grupo.nombre}</strong>?
                        Las solicitudes activas no se verán afectadas, pero no recibirá nuevas asignaciones.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex gap-3 mt-2">
                    <Button
                        variant="outline"
                        className="flex-1 border-border/60"
                        onClick={() => onOpenChange(false)}
                        disabled={cargando}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={onConfirmar}
                        disabled={cargando}
                    >
                        {cargando ? 'Desactivando...' : 'Desactivar'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default function GruposPage() {
    const { grupos, cargando, error, recargar, crear, actualizar, eliminar } = useGrupos()
    const { usuarios } = useUsuarios()
    const [sheetAbierto, setSheetAbierto] = useState(false)
    const [grupoEditando, setGrupoEditando] = useState<GrupoGestion | null>(null)
    const [grupoEliminando, setGrupoEliminando] = useState<GrupoGestion | null>(null)
    const [guardando, setGuardando] = useState(false)
    const [eliminando, setEliminando] = useState(false)

    const gestoresDisponibles: GestorResumen[] = usuarios
        .filter(u => u.rol === 'GESTOR' && u.activo)
        .map(u => ({
            id: u.id,
            nombre: u.nombre,
            apellidoPaterno: u.apellidoPaterno,
            apellidoMaterno: u.apellidoMaterno,
            correo: u.correo,
            activo: u.activo,
        }))
    const abrirNuevo = () => {
        setGrupoEditando(null)
        setSheetAbierto(true)
    }

    const abrirEditar = (g: GrupoGestion) => {
        setGrupoEditando(g)
        setSheetAbierto(true)
    }

    const abrirEliminar = (g: GrupoGestion) => {
        setGrupoEliminando(g)
    }

    const handleSubmit = async (dto: CrearGrupoDto | ActualizarGrupoDto): Promise<boolean> => {
        setGuardando(true)
        let ok: boolean
        if (grupoEditando) {
            ok = await actualizar(grupoEditando.id, dto as ActualizarGrupoDto)
        } else {
            ok = await crear(dto as CrearGrupoDto)
        }
        setGuardando(false)
        if (ok) setSheetAbierto(false)
        return ok
    }

    const handleEliminar = async () => {
        if (!grupoEliminando) return
        setEliminando(true)
        await eliminar(grupoEliminando.id)
        setEliminando(false)
        setGrupoEliminando(null)
    }

    const gruposActivos = grupos.filter(g => g.activo)
    const gruposInactivos = grupos.filter(g => !g.activo)

    return (
        <div className="flex flex-col gap-8 p-6 max-w-8xl mx-auto">

            {/* Header */}
            <PageHeader
                title="Grupos de gestión"
                description="Define grupos con reglas para enrutar solicitudes automáticamente al equipo correcto."
                backHref="/dashboard/admin/configuracion"
                action={{
                    label: 'Nuevo grupo',
                    onClick: abrirNuevo,
                    icon: <Plus className="h-4 w-4" />,
                    variant: 'default',
                }}
            />

            {/* Stats rápidas */}
            {!cargando && grupos.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Grupos activos', value: gruposActivos.length, icon: ShieldCheck, color: 'text-primary' },
                        {
                            label: 'Gestores asignados',
                            value: [...new Set(grupos.flatMap(g => g.gestores.filter(gg => gg.activo).map(gg => gg.gestorId)))].length,
                            icon: Users,
                            color: 'text-foreground'
                        },
                        { label: 'Solicitudes asignadas', value: grupos.reduce((acc, g) => acc + (g._count?.asignaciones ?? 0), 0), icon: Layers, color: 'text-foreground' },
                    ].map(stat => (
                        <div key={stat.label} className="flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-card">
                            <div className="p-2 bg-muted rounded-lg">
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                                <p className="text-lg font-semibold text-foreground tabular-nums">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2.5 p-4 rounded-xl border border-destructive/25 bg-destructive/5 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                    <Button variant="ghost" size="sm" className="ml-auto h-7 text-xs" onClick={recargar}>
                        Reintentar
                    </Button>
                </div>
            )}

            {/* Cargando */}
            {cargando && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-[180px] rounded-xl" />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!cargando && grupos.length === 0 && (
                <div className="flex flex-col items-center gap-4 py-16 text-center">
                    <div className="p-4 bg-muted rounded-2xl">
                        <Layers className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground">Sin grupos configurados</p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                            Crea grupos para enrutar solicitudes automáticamente a los gestores adecuados.
                        </p>
                    </div>
                    <Button onClick={abrirNuevo} variant="outline" className="gap-2 border-border/60">
                        <Plus className="h-4 w-4" />
                        Crear primer grupo
                    </Button>
                </div>
            )}

            {/* Grupos activos */}
            {!cargando && gruposActivos.length > 0 && (
                <div className="flex flex-col gap-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Activos · {gruposActivos.length}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {gruposActivos
                            .sort((a, b) => b.prioridad - a.prioridad)
                            .map(g => (
                                <GrupoCard key={g.id} grupo={g} onEditar={abrirEditar} onEliminar={abrirEliminar} />
                            ))}
                    </div>
                </div>
            )}

            {/* Grupos inactivos */}
            {!cargando && gruposInactivos.length > 0 && (
                <div className="flex flex-col gap-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Inactivos · {gruposInactivos.length}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {gruposInactivos.map(g => (
                            <GrupoCard key={g.id} grupo={g} onEditar={abrirEditar} onEliminar={abrirEliminar} />
                        ))}
                    </div>
                </div>
            )}

            {/* Sheet crear/editar */}
            <Sheet open={sheetAbierto} onOpenChange={setSheetAbierto}>
                <SheetContent className="w-full sm:max-w-lg flex flex-col gap-0 p-0 overflow-y-auto">
                    <SheetHeader className="px-6 py-5 border-b border-border/60 sticky top-0 bg-background z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Layers className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <SheetTitle className="text-base">
                                    {grupoEditando ? 'Editar grupo' : 'Nuevo grupo'}
                                </SheetTitle>
                                <SheetDescription className="text-xs mt-0.5">
                                    {grupoEditando
                                        ? `Editando "${grupoEditando.nombre}"`
                                        : 'Define el nombre, reglas y gestores del grupo'}
                                </SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>
                    <div className="px-6 py-5">
                        <GrupoForm
                            grupo={grupoEditando ?? undefined}
                            gestoresDisponibles={gestoresDisponibles}
                            onSubmit={handleSubmit}
                            onCancel={() => setSheetAbierto(false)}
                            cargando={guardando}
                        />
                    </div>
                </SheetContent>
            </Sheet>

            {/* Dialog eliminar */}
            <EliminarDialog
                grupo={grupoEliminando}
                open={!!grupoEliminando}
                onOpenChange={(v) => { if (!v) setGrupoEliminando(null) }}
                onConfirmar={handleEliminar}
                cargando={eliminando}
            />
        </div>
    )
}