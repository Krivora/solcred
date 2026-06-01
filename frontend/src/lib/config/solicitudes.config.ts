// ─── Estatus ──────────────────────────────────────────────────────────────────

export interface EstatusStyle {
    label: string
    className: string
    dotClass: string
}

export const ESTATUS_STYLES: Record<string, EstatusStyle> = {
    BORRADOR: {
        label: 'Borrador',
        className: 'border-border/60 text-muted-foreground bg-muted/40',
        dotClass: 'bg-muted-foreground/50',
    },
    PENDIENTE: {
        label: 'Pendiente',
        className: 'border-amber-300/70 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30',
        dotClass: 'bg-amber-500',
    },
    EN_REVISION: {
        label: 'En revisión',
        className: 'border-primary/30 text-primary bg-primary/5',
        dotClass: 'bg-primary',
    },
    APROBADO: {
        label: 'Aprobado',
        className: 'border-emerald-300/70 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30',
        dotClass: 'bg-emerald-500',
    },
    RECHAZADO: {
        label: 'Rechazado',
        className: 'border-destructive/30 text-destructive bg-destructive/5',
        dotClass: 'bg-destructive',
    },
}

// ─── Sector ───────────────────────────────────────────────────────────────────

export const SECTOR_LABELS: Record<string, string> = {
    AGROPECUARIO: 'Agropecuario',
    INDUSTRIAL: 'Industrial',
    COMERCIAL: 'Comercial',
    SERVICIOS: 'Servicios',
    TECNOLOGIA: 'Tecnología',
    OTRO: 'Otro',
}

// ─── Tamaño empresa ───────────────────────────────────────────────────────────

export const TAMANO_LABELS: Record<string, string> = {
    MICRO: 'Micro',
    PEQUENA: 'Pequeña',
    MEDIANA: 'Mediana',
    GRANDE: 'Grande',
}

// ─── Tipo persona ─────────────────────────────────────────────────────────────

export const TIPO_PERSONA_LABELS: Record<string, string> = {
    FISICA: 'Persona física',
    MORAL: 'Persona moral',
}

// ─── Formatters ───────────────────────────────────────────────────────────────

export function formatFecha(iso: string): string {
    return new Date(iso).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

export function formatMonto(monto: number | null | undefined): string | null {
    if (!monto) return null
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        maximumFractionDigits: 0,
    }).format(monto)
}