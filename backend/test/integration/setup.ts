/**
 * setupFiles de integración: importa el cliente PGlite (aplica el esquema al
 * cargarse) y limpia la BD antes de cada test.
 */
import { afterAll, beforeEach } from "vitest";
import { prisma, resetDb } from "./pglite-client";

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});
