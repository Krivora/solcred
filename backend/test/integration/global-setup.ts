/**
 * globalSetup de la suite de integración: aplica el esquema de Prisma a la BD
 * de pruebas una sola vez antes de correr los tests.
 *
 * Requiere que el contenedor de `docker-compose.test.yml` esté arriba
 * (`npm run test:db:up`, encadenado en `pretest:int`).
 */
import { execSync } from "node:child_process";
import { resolve } from "node:path";
import { TEST_DATABASE_URL } from "./env";

export default function setup() {
  const cwd = resolve(__dirname, "../..");
  execSync("npx prisma migrate deploy", {
    cwd,
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
  });
}
