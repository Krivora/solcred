/**
 * setupFiles de integración: limpia la BD antes de cada test y cierra la
 * conexión al final.
 */
import { afterAll, beforeEach } from "vitest";
import { prisma, resetDb } from "./prisma";

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});
