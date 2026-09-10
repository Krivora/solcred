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
        bar: 'bg-ok',
        text: 'text-ok-ink',
        bg: 'bg-ok-surface',
        border: 'border-ok/20',
    },
    media: {
        bar: 'bg-warn',
        text: 'text-warn-ink',
        bg: 'bg-warn-surface',
        border: 'border-warn/20',
    },
    alta: {
        bar: 'bg-danger',
        text: 'text-danger-ink',
        bg: 'bg-danger-surface',
        border: 'border-danger/20',
    },
}

export function CargaBadge({ carga, max = 20 }: Props) {
    const nivel = getNivel(carga, max)
    const styles = NIVEL_STYLES[nivel]
    const porcentaje = Math.min((carga / max) * 100, 100)

    return (
        <div className={`inline-flex flex-col gap-1 px-3.5 py-1.5 rounded-lg border ${styles.bg} ${styles.border} min-w-20`}>
            <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-semibold tabular-nums ${styles.text}`}>
                    {carga}
                </span>
                <span className="text-caption text-ink-subtle">/{max}</span>
            </div>
            <div className="h-1 w-full bg-hairline rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-300 ${styles.bar}`}
                    style={{ width: `${porcentaje}%` }}
                />
            </div>
        </div>
    )
}