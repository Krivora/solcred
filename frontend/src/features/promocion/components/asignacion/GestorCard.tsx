import { cn } from '@/shared/lib/cn'
import { CargaBadge } from './CargaBadge'
import type { GestorConCarga } from '@/features/promocion/types/asignacion.types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

type NivelCarga = 'libre' | 'ocupado' | 'lleno'

function getNivelCarga(cargaActual: number, maximo = 20): NivelCarga {
    const ratio = cargaActual / maximo
    if (ratio < 0.3) return 'libre'
    if (ratio < 0.7) return 'ocupado'
    return 'lleno'
}

const NIVEL_STYLES: Record<NivelCarga, string> = {
    libre: 'bg-ok-surface text-ok-ink',
    ocupado: 'bg-warn-surface text-warn-ink',
    lleno: 'bg-danger-surface text-danger-ink',
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface GestorCardProps {
    gestor: GestorConCarga
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function GestorCard({ gestor }: GestorCardProps) {
    const iniciales = `${gestor.nombre[0]}${gestor.apellidoPaterno[0]}`.toUpperCase()
    const nivel = getNivelCarga(gestor.cargaActual)

    return (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40 last:border-0">
            <div className={cn(
                'shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold',
                NIVEL_STYLES[nivel]
            )}>
                {iniciales}
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                    {gestor.nombre} {gestor.apellidoPaterno}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                    {gestor.correo}
                </p>
            </div>

            <CargaBadge carga={gestor.cargaActual} />
        </div>
    )
}