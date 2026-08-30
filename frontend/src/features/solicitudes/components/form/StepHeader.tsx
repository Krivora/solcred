import type { ReactNode } from 'react'

/**
 * Header homologado para todos los pasos del formulario de solicitud.
 * Ícono + título + copy de contexto en una tarjeta que separa el encabezado
 * de los campos. `children` es un slot opcional a la derecha (p. ej. el monto
 * total en el paso de crédito).
 */
export function StepHeader({
    icon: Icon,
    title,
    subtitle,
    children,
}: {
    icon: React.ElementType
    title: string
    subtitle: string
    children?: ReactNode
}) {
    return (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/40 p-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-4.5 w-4.5 text-primary" />
                </div>
                <div className="space-y-0.5">
                    <h2 className="text-base font-semibold text-foreground">{title}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">{subtitle}</p>
                </div>
            </div>
            {children && <div className="shrink-0 sm:text-right">{children}</div>}
        </div>
    )
}
