// ─── Estatus ──────────────────────────────────────────────────────────────────

// El estilo por estatus vive en `@/shared/config/estatus.tokens`. Aquí se
// re-expone con la forma `{ label, className, dotClass }` que ya consumen las
// tablas y el timeline de promoción.
import { ESTATUS_SOLICITUD, TONE } from './estatus.tokens'

export interface EstatusStyle {
    label: string
    className: string
    dotClass: string
}

export const ESTATUS_STYLES: Record<string, EstatusStyle> = Object.fromEntries(
    Object.entries(ESTATUS_SOLICITUD).map(([estatus, { label, tone }]) => [
        estatus,
        { label, className: TONE[tone].badge, dotClass: TONE[tone].solid },
    ]),
) as Record<string, EstatusStyle>

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