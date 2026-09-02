import { describe, it, expect } from "vitest";
import { compararValor } from "./asignacion.service";

describe("asignacion — compararValor (regla de grupo)", () => {
  it("valor de solicitud nulo o indefinido nunca matchea", () => {
    expect(compararValor("IGUAL", null, "FISICA")).toBe(false);
    expect(compararValor("IGUAL", undefined, "FISICA")).toBe(false);
    expect(compararValor("DIFERENTE", null, "FISICA")).toBe(false);
  });

  it("IGUAL / DIFERENTE comparan como texto", () => {
    expect(compararValor("IGUAL", "COMERCIAL", "COMERCIAL")).toBe(true);
    expect(compararValor("IGUAL", "COMERCIAL", "INDUSTRIAL")).toBe(false);
    expect(compararValor("DIFERENTE", "COMERCIAL", "INDUSTRIAL")).toBe(true);
    expect(compararValor("DIFERENTE", "COMERCIAL", "COMERCIAL")).toBe(false);
  });

  it("EN_LISTA acepta un JSON array y hace includes por texto", () => {
    expect(compararValor("EN_LISTA", "MICRO", '["MICRO","PEQUENA"]')).toBe(true);
    expect(compararValor("EN_LISTA", "GRANDE", '["MICRO","PEQUENA"]')).toBe(false);
    expect(compararValor("EN_LISTA", 3, "[1,2,3]")).toBe(true);
  });

  it("EN_LISTA con JSON inválido => false (no revienta)", () => {
    expect(compararValor("EN_LISTA", "MICRO", "no-json")).toBe(false);
  });

  it("comparadores numéricos", () => {
    expect(compararValor("MAYOR_QUE", 100, "50")).toBe(true);
    expect(compararValor("MAYOR_QUE", 50, "50")).toBe(false);
    expect(compararValor("MENOR_QUE", 10, "50")).toBe(true);
    expect(compararValor("MAYOR_IGUAL", 50, "50")).toBe(true);
    expect(compararValor("MENOR_IGUAL", 50, "50")).toBe(true);
    expect(compararValor("MENOR_IGUAL", 51, "50")).toBe(false);
  });

  it("comparadores numéricos sobre strings numéricas", () => {
    expect(compararValor("MAYOR_QUE", "100", "50")).toBe(true);
  });
});
