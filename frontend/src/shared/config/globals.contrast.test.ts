/**
 * Guarda de contraste del sistema de tokens (Fase 0 del rediseño).
 *
 * Lee `src/app/globals.css`, resuelve los custom properties de `:root` (claro) y
 * `.dark` (oscuro) —incluyendo los alias `var(--x)`— y afirma que cada par
 * texto/superficie cumple el ratio WCAG objetivo. Si alguien ajusta un token y
 * rompe la legibilidad, esto falla en CI.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { wcagContrast } from 'culori'

const CSS = readFileSync(
  fileURLToPath(new URL('../../app/globals.css', import.meta.url)),
  'utf8',
)

/** Extrae `{ --name: value }` del primer bloque cuyo encabezado matchea `head`. */
function bloque(head: RegExp): Record<string, string> {
  const start = CSS.search(head)
  if (start === -1) throw new Error(`bloque no encontrado: ${head}`)
  const abre = CSS.indexOf('{', start)
  let depth = 0
  let fin = abre
  for (let i = abre; i < CSS.length; i++) {
    if (CSS[i] === '{') depth++
    else if (CSS[i] === '}' && --depth === 0) {
      fin = i
      break
    }
  }
  const cuerpo = CSS.slice(abre + 1, fin)
  const out: Record<string, string> = {}
  for (const m of cuerpo.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    out[m[1].trim()] = m[2].trim()
  }
  return out
}

const light = bloque(/:root\s*\{/)
const darkOverrides = bloque(/\.dark\s*\{/)
const dark = { ...light, ...darkOverrides }

/** Resuelve un token a su color final (sigue las cadenas de `var(--x)`). */
function resolver(tokens: Record<string, string>, nombre: string, visto = new Set<string>()): string {
  if (visto.has(nombre)) throw new Error(`ciclo de var() en ${nombre}`)
  visto.add(nombre)
  const raw = tokens[nombre.replace(/^var\(|\)$/g, '')] ?? tokens[nombre]
  if (!raw) throw new Error(`token sin definir: ${nombre}`)
  const varMatch = raw.match(/^var\((--[\w-]+)\)$/)
  if (varMatch) return resolver(tokens, varMatch[1], visto)
  return raw
}

function ratio(tokens: Record<string, string>, texto: string, fondo: string): number {
  return wcagContrast(resolver(tokens, texto), resolver(tokens, fondo))
}

// [texto, fondo, ratio mínimo]
const PARES: [string, string, number][] = [
  ['--ink', '--surface', 7],
  ['--ink', '--background', 7],
  ['--ink-muted', '--surface', 4.5],
  ['--ink-subtle', '--surface', 3],
  ['--ok-ink', '--ok-surface', 4.5],
  ['--warn-ink', '--warn-surface', 4.5],
  ['--danger-ink', '--danger-surface', 4.5],
  ['--info-ink', '--info-surface', 4.5],
  ['--brand-ink', '--surface', 4.5],
  ['--brand-contrast', '--brand', 4.5],
  // alias de compatibilidad
  ['--foreground', '--card', 7],
  ['--primary-foreground', '--primary', 4.5],
  ['--muted-foreground', '--card', 4.5],
  ['--destructive', '--card', 4.5],
]

// Categóricos: texto de color sobre su surface — chips cortos, objetivo AA-large.
const CAT_PARES: [string, string, number][] = Array.from({ length: 6 }, (_, i) => [
  `--cat-${i + 1}`,
  `--cat-${i + 1}-surface`,
  3,
])

describe('sistema visual · contraste de tokens', () => {
  describe.each([
    ['claro', light],
    ['oscuro', dark],
  ])('tema %s', (_tema, tokens) => {
    it.each([...PARES, ...CAT_PARES])(
      '%s sobre %s ≥ %s:1',
      (texto, fondo, min) => {
        expect(ratio(tokens, texto, fondo)).toBeGreaterThanOrEqual(min)
      },
    )
  })

  it('no hay alias colgantes: todos los tokens resuelven a un color', () => {
    for (const nombre of Object.keys(light)) {
      if (/color|font|radius|shadow|spacing|tracking/.test(nombre)) continue
      expect(() => resolver(dark, nombre)).not.toThrow()
    }
  })
})
