import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Dos suites:
//   - "unit"        -> logica pura (sin BD). Tests colocados junto al codigo,
//                      con sufijo .test.ts bajo src/. Rapidos, sin infra.
//   - "integration" -> tocan la BD. Viven en test/integration/ y corren contra
//                      PGlite (Postgres en memoria, WASM) — sin Docker ni
//                      servidor. El alias de @config/db hace que los servicios
//                      usen la misma instancia PGlite.
//
//   npm test          -> solo unit
//   npm run test:int  -> solo integracion
//   npm run test:all  -> ambas
const src = (p: string) => fileURLToPath(new URL(`./src/${p}`, import.meta.url));
const pgliteClient = fileURLToPath(
  new URL("./test/integration/pglite-client.ts", import.meta.url),
);

// Alias de los tsconfig `paths` del backend. En `unit` los tests viven en `src/`
// y `resolve.tsconfigPaths` basta; en `integration` viven fuera de `src/` (que
// es el `baseUrl`), así que hay que declararlos a mano.
const aliasBackend = [
  { find: "@config/db", replacement: pgliteClient },
  { find: /^@config\//, replacement: `${src("config")}/` },
  { find: /^@modules\//, replacement: `${src("modules")}/` },
  { find: /^@middlewares\//, replacement: `${src("middlewares")}/` },
  { find: /^@utils\//, replacement: `${src("utils")}/` },
  { find: /^@\//, replacement: `${src("")}` },
];

export default defineConfig({
  test: {
    projects: [
      {
        resolve: { tsconfigPaths: true },
        test: {
          name: "unit",
          include: ["src/**/*.test.ts"],
          environment: "node",
          sequence: { groupOrder: 0 },
        },
      },
      {
        resolve: { alias: aliasBackend },
        test: {
          name: "integration",
          include: ["test/integration/**/*.test.ts"],
          environment: "node",
          setupFiles: ["test/integration/setup.ts"],
          // Un solo proceso sin aislar entre archivos: la instancia PGlite (y su
          // esquema) se comparte; el reset por test lo aisla.
          pool: "forks",
          fileParallelism: false,
          isolate: false,
          sequence: { groupOrder: 1 },
          testTimeout: 15_000,
        },
      },
    ],
  },
});
