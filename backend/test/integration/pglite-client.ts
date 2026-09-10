/**
 * Cliente de Prisma para las pruebas de integración, respaldado por **PGlite**
 * (Postgres real compilado a WASM, en memoria). Sin Docker, sin servidor, sin
 * variables de entorno.
 *
 * El `vitest.config.mts` del proyecto `integration` aliasa `@config/db` a este
 * módulo, así que los servicios bajo prueba usan esta misma instancia.
 *
 * El esquema se aplica corriendo los `prisma/migrations/*` reales, en orden
 * (mismo SQL que produciría `prisma migrate deploy`).
 */
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { PrismaPGlite } from "pglite-prisma-adapter";
import { PrismaClient } from "../../generated/prisma/client";

const MIGRATIONS_DIR = resolve(__dirname, "../../prisma/migrations");

function sqlDeMigraciones(): string {
  return readdirSync(MIGRATIONS_DIR)
    .filter((d) => /^\d/.test(d))
    .sort()
    .map((d) => readFileSync(resolve(MIGRATIONS_DIR, d, "migration.sql"), "utf8"))
    .join("\n");
}

const pglite = new PGlite();

// Top-level await: cuando `setup.ts` importa este módulo, el esquema ya está listo.
await pglite.exec(sqlDeMigraciones());

const adapter = new PrismaPGlite(pglite);
const prisma = new PrismaClient({ adapter } as never);

/** Vacía todas las tablas de dominio y reinicia las secuencias de folio. */
export async function resetDb(): Promise<void> {
  const filas = (await pglite.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`,
  )) as { rows: { tablename: string }[] };
  const tablas = filas.rows.map((f) => `"${f.tablename}"`).join(", ");
  if (tablas) await pglite.exec(`TRUNCATE ${tablas} RESTART IDENTITY CASCADE`);
  await pglite.exec(`
    ALTER SEQUENCE IF EXISTS solicitud_folio_seq RESTART WITH 1;
    ALTER SEQUENCE IF EXISTS ticket_folio_seq RESTART WITH 1;
  `);
}

export { prisma, pglite };
export default prisma;
