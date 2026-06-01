'use client'

import { Loader2, Zap, UserCheck, Filter, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils/cn'
import type { GrupoGestion } from '@/lib/types/asignacion.types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface SolicitudesToolbarProps {
    total: number
    cargando: boolean
    seleccionadas: Set<string>
    todoSeleccionado: boolean
    asignandoLote: boolean
    grupoFiltro: string
    grupos: GrupoGestion[]
    onToggleTodos: () => void
    onAsignarLote: () => void
    onAsignarManual: () => void
    onCambiarGrupo: (valor: string) => void
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function SolicitudesToolbar({
    total,
    cargando,
    seleccionadas,
    todoSeleccionado,
    asignandoLote,
    grupoFiltro,
    grupos,
    onToggleTodos,
    onAsignarLote,
    onAsignarManual,
    onCambiarGrupo,
}: SolicitudesToolbarProps) {
    const haySeleccion = seleccionadas.size > 0

    return (
        <div className="px-4 py-3 border-b border-border/40 flex items-center gap-3">

            {/* Checkbox seleccionar todos */}
            <div
                onClick={onToggleTodos}
                className={cn(
                    'shrink-0 w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors',
                    todoSeleccionado
                        ? 'bg-primary border-primary'
                        : 'border-border/60 hover:border-primary/40'
                )}
            >
                {todoSeleccionado && (
                    <span className="text-primary-foreground text-[9px]">✓</span>
                )}
                {!todoSeleccionado && haySeleccion && (
                    <span className="text-primary text-[9px]">—</span>
                )}
            </div>

            {/* Acciones según selección */}
            {haySeleccion ? (
                <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs text-muted-foreground">
                        {seleccionadas.size} seleccionadas
                    </span>
                    <Button
                        size="sm"
                        className="h-7 gap-1.5 text-xs bg-primary hover:bg-primary/90"
                        onClick={onAsignarLote}
                        disabled={asignandoLote}
                    >
                        {asignandoLote
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : <Zap className="h-3 w-3" />
                        }
                        Asignar automáticamente
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1.5 text-xs border-border/60"
                        onClick={onAsignarManual}
                    >
                        <UserCheck className="h-3 w-3" />
                        Asignar manual
                    </Button>
                </div>
            ) : (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-1">
                    <Inbox className="h-3.5 w-3.5" />
                    <span>
                        {cargando ? 'Cargando...' : `${total} pendientes`}
                    </span>
                </div>
            )}

            {/* Filtro por grupo */}
            <Select value={grupoFiltro} onValueChange={onCambiarGrupo}>
                <SelectTrigger className="h-7 w-auto text-xs border-border/60 gap-1.5 pl-2">
                    <Filter className="h-3 w-3 text-muted-foreground" />
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="todos">Todos los grupos</SelectItem>
                    {grupos.filter(g => g.activo).map(g => (
                        <SelectItem key={g.id} value={g.id}>
                            {g.nombre}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}