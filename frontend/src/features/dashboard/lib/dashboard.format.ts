/** Formateadores compartidos del panorama. */

const nfInt = new Intl.NumberFormat('es-MX')

export const formatEntero = (n: number | null | undefined): string =>
  n == null ? '—' : nfInt.format(Math.round(n))

/** Monto en pesos, compacto: $1.2 M, $840 K, $12,500. */
export function formatMontoCompacto(n: number | null | undefined): string {
  if (n == null) return '—'
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)} M`
  if (abs >= 10_000) return `$${(n / 1_000).toFixed(0)} K`
  return nfInt.format(Math.round(n)).replace(/^/, '$')
}

export const formatDias = (n: number | null | undefined): string =>
  n == null ? '—' : `${n.toFixed(1)} d`

export const formatPct = (n: number | null | undefined, digits = 0): string =>
  n == null ? '—' : `${n.toFixed(digits)}%`

/** Delta formateado según el tipo de KPI. */
export function formatDelta(
  delta: number | null,
  kind: 'pct' | 'puntos' | 'dias',
): string | null {
  if (delta == null) return null
  const signo = delta > 0 ? '+' : delta < 0 ? '−' : ''
  const v = Math.abs(delta)
  if (kind === 'pct') return `${signo}${v.toFixed(1)}%`
  if (kind === 'puntos') return `${signo}${v.toFixed(1)} pp`
  return `${signo}${v.toFixed(1)} d`
}

/** ¿El delta debe pintarse como bueno, malo o neutro? */
export function tonoDelta(
  delta: number | null,
  deltaTipo: 'positivo' | 'negativo' | 'neutro',
): 'up' | 'down' | 'flat' {
  if (delta == null || delta === 0 || deltaTipo === 'neutro') return 'flat'
  const sube = delta > 0
  if (deltaTipo === 'positivo') return sube ? 'up' : 'down'
  return sube ? 'down' : 'up' // 'negativo': subir es malo
}

const RTF = new Intl.RelativeTimeFormat('es-MX', { numeric: 'auto' })

export function tiempoRelativo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.round(diff / 60000)
  if (min < 1) return 'ahora'
  if (min < 60) return RTF.format(-min, 'minute')
  const h = Math.round(min / 60)
  if (h < 24) return RTF.format(-h, 'hour')
  const d = Math.round(h / 24)
  if (d < 30) return RTF.format(-d, 'day')
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
}

export const RANGO_LABELS: Record<string, string> = {
  '7d': '7 días',
  '30d': '30 días',
  '90d': '90 días',
  '12m': '12 meses',
}
