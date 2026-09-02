/**
 * Carga `.env.test` y BLINDA que las pruebas de integración solo puedan tocar
 * la BD de pruebas. Se importa lo primero, antes que cualquier código que lea
 * `process.env.DATABASE_URL` (p. ej. `@config/db`).
 */
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";

// `.env.test` está en la raíz de `backend/`.
loadEnv({ path: resolve(__dirname, "../../.env.test"), override: true });

const url = process.env.DATABASE_URL ?? "";

// Candado: la URL DEBE ser la de pruebas. Evita que un `.env` mal configurado
// haga que los tests trunquen la base de desarrollo.
if (!/solcred_test/.test(url) || !/:55432\b/.test(url)) {
  throw new Error(
    `[test] DATABASE_URL no apunta a la BD de pruebas (solcred_test:55432).\n` +
      `        Valor actual: ${url || "(vacío)"}\n` +
      `        Revisa backend/.env.test y no corras integración contra dev.`,
  );
}

export const TEST_DATABASE_URL = url;
