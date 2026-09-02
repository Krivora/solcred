import { defineConfig } from "vitest/config";

// Pruebas de logica pura del frontend (calculo financiero de Analisis, flujo de
// pasos del formulario, etc.). Tests colocados junto al codigo con sufijo
// .test.ts. Componentes/e2e quedan para una fase posterior.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    environment: "node",
  },
});
