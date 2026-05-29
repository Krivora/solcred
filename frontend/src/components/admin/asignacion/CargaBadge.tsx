// components/admin/asignacion/CargaBadge.tsx

interface Props {
    carga: number
    max?: number
}

// Semáforo visual: verde < 30%, amber < 70%, rojo >= 70%
function getNivel(carga: number, max: number): 'baja' | 'media' | 'alta' {
    const ratio = carga / max
    if (ratio < 0.3) return 'baja'
    if (ratio < 0.7) return 'media'
    return 'alta'
}

const NIVEL_STYLES = {
    baja: {
        bar: 'bg-emerald-500',
        text: 'text-emerald-700 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-950/30',
        border: 'border-emerald-200/60 dark:border-emerald-800/40',
    },
    media: {
        bar: 'bg-amber-500',
        text: 'text-amber-700 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-950/30',
        border: 'border-amber-200/60 dark:border-amber-800/40',
    },
    alta: {
        bar: 'bg-destructive',
        text: 'text-destructive',
        bg: 'bg-destructive/5',
        border: 'border-destructive/20',
    },
}

export function CargaBadge({ carga, max = 20 }: Props) {
    const nivel = getNivel(carga, max)
    const styles = NIVEL_STYLES[nivel]
    const porcentaje = Math.min((carga / max) * 100, 100)

    return (
        <div className={`inline-flex flex-col gap-1 px-2.5 py-1.5 rounded-lg border ${styles.bg} ${styles.border} min-w-[80px]`}>
            <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-semibold tabular-nums ${styles.text}`}>
                    {carga}
                </span>
                <span className="text-[10px] text-muted-foreground">/{max}</span>
            </div>
            <div className="h-1 w-full bg-muted/60 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-300 ${styles.bar}`}
                    style={{ width: `${porcentaje}%` }}
                />
            </div>
        </div>
    )
}