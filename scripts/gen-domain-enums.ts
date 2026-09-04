/**
 * Genera frontend/src/shared/types/domain.enums.ts a partir de los enums que
 * Prisma emite en backend/generated/prisma/enums.ts (que a su vez son fuente de
 * verdad = schema.prisma).
 *
 * Ejecutar: `npm run gen:enums` (raíz) — también corre en predev/prebuild del front.
 * NO editar domain.enums.ts a mano.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = resolve(ROOT, 'backend/generated/prisma/enums.ts')
const OUT = resolve(ROOT, 'frontend/src/shared/types/domain.enums.ts')

/** Enums del dominio que el frontend necesita. */
const WHITELIST = [
    'TipoUsuario', 'Rol', 'TipoPersona', 'TipoPersonaDocumento',
    'EstatusSolicitud', 'EstadoCivil', 'NivelEstudio', 'TamanoEmpresa', 'Sector',
    'Requerimiento', 'TipoVivienda', 'EstatusDocumento', 'CategoriaCredito',
    'TipoGarantia', 'TipoLocal', 'SeccionSolicitud', 'AccionLog', 'ModuloLog',
    'OperadorRegla', 'CampoRegla',
    'TicketEstatus', 'TicketPrioridad', 'TicketCategoria', 'TicketTipoEvento',
    'TicketAutorTipo',
    'ComunicacionTipo', 'ComunicacionMotivo', 'ComunicacionResultado',
    'PasoFormulario',
] as const

/** Nombre del array de valores para cada enum (para poblar <Select> etc.). */
const nombreArray = (name: string): string =>
    `${name.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase()}_VALUES`

const source = readFileSync(SRC, 'utf8')

// Cada bloque: export const NAME = {\n  KEY: 'VALUE',\n ... \n} as const
const blockRe = /export const (\w+) = \{([^}]*)\} as const/g
const found = new Map<string, string[]>()

for (const m of source.matchAll(blockRe)) {
    const [, name, body] = m
    const values = [...body.matchAll(/'([^']+)'/g)].map((v) => v[1])
    if (values.length) found.set(name, values)
}

const missing = WHITELIST.filter((n) => !found.has(n))
if (missing.length) {
    console.error(`gen-domain-enums: enums no encontrados en ${SRC}:\n  ${missing.join(', ')}`)
    process.exit(1)
}

const lines: string[] = [
    '/* ─────────────────────────────────────────────────────────────────────────',
    ' * GENERADO — no editar a mano.  Fuente: backend/prisma/schema.prisma',
    ' * Regenerar: `npm run gen:enums` (también corre en predev/prebuild del front)',
    ' * ───────────────────────────────────────────────────────────────────────── */',
    '',
]

for (const name of WHITELIST) {
    const values = found.get(name)!
    const union = values.map((v) => `'${v}'`).join(' | ')
    lines.push(`export type ${name} = ${union}`)
    lines.push(`export const ${nombreArray(name)} = [${values.map((v) => `'${v}'`).join(', ')}] as const satisfies readonly ${name}[]`)
    lines.push('')
}

const output = lines.join('\n')

// idempotencia: no reescribir si no cambió (evita ruido en git / watchers)
let current = ''
try { current = readFileSync(OUT, 'utf8') } catch { /* no existe aún */ }
if (current === output) {
    console.log('gen-domain-enums: sin cambios')
} else {
    writeFileSync(OUT, output)
    console.log(`gen-domain-enums: escrito ${OUT} (${WHITELIST.length} enums)`)
}
