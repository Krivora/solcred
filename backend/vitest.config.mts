import { defineConfig } from "vitest/config";

// Dos suites:
//   - "unit"        -> logica pura (sin BD). Tests colocados junto al codigo,
//                      con sufijo .test.ts bajo src/. Rapidos, sin infra.
//   - "integration" -> tocan Postgres. Viven en test/integration/, corren en
//                      serie contra la BD de pruebas (docker-compose.test.yml).
//
//   npm test          -> solo unit
//   npm run test:int  -> solo integracion (necesita la BD levantada)
//   npm run test:all  -> ambas
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["src/**/*.test.ts"],
          environment: "node",
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          include: ["test/integration/**/*.test.ts"],
          environment: "node",
          globalSetup: ["test/integration/global-setup.ts"],
          setupFiles: ["test/integration/setup.ts"],
          // Una sola conexion a la BD y limpieza determinista entre archivos.
          fileParallelism: false,
          pool: "forks",
          poolOptions: { forks: { singleFork: true } },
          hookTimeout: 30_000,
          testTimeout: 15_000,
        },
      },
    ],
  },
});
