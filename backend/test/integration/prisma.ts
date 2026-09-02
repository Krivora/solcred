/**
 * Cliente de Prisma para las pruebas de integración. Importa `./env` primero
 * para garantizar que `@config/db` (que este re-exporta) lea la URL de pruebas.
 */
import "./env";
import prisma from "@config/db";

export { prisma };

/** Vacía todas las tablas de dominio (deja `_prisma_migrations`). */
export async function resetDb(): Promise<void> {
  const filas = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'
  `;
  const tablas = filas.map((f) => `"public"."${f.tablename}"`).join(", ");
  if (tablas) {
    await prisma.$executeRawUnsafe(`TRUNCATE ${tablas} RESTART IDENTITY CASCADE`);
  }
  // La secuencia del folio no está ligada a una columna: RESTART IDENTITY no la toca.
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE IF EXISTS solicitud_folio_seq RESTART WITH 1`);
}
