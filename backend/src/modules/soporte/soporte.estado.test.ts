import { describe, it, expect, vi, afterEach } from "vitest";
import {
  ESTATUS_ABIERTOS,
  ESTATUS_FINALES,
  TRANSICIONES_AGENTE,
  esAbierto,
  esFinal,
  dentroVentanaReapertura,
  DIAS_REAPERTURA,
} from "./soporte.estado";

describe("soporte.estado — clasificación de estatus", () => {
  it("abiertos y finales son disjuntos y cubren todo el enum del mapa", () => {
    const solapan = ESTATUS_ABIERTOS.filter((e) => ESTATUS_FINALES.includes(e));
    expect(solapan).toEqual([]);

    const delMapa = Object.keys(TRANSICIONES_AGENTE);
    const cubiertos = new Set([...ESTATUS_ABIERTOS, ...ESTATUS_FINALES]);
    expect(delMapa.every((e) => cubiertos.has(e as never))).toBe(true);
  });

  it("esAbierto / esFinal responden según las listas", () => {
    expect(esAbierto("EN_PROGRESO")).toBe(true);
    expect(esAbierto("CERRADO")).toBe(false);
    expect(esFinal("CANCELADO")).toBe(true);
    expect(esFinal("NUEVO")).toBe(false);
  });
});

describe("soporte.estado — transiciones de agente", () => {
  it("NUEVO no tiene transiciones por esta vía (asignar va por su ruta)", () => {
    expect(TRANSICIONES_AGENTE.NUEVO).toEqual([]);
  });

  it("EN_PROGRESO puede ir a ESPERANDO_CLIENTE o RESUELTO", () => {
    expect(TRANSICIONES_AGENTE.EN_PROGRESO).toEqual(
      expect.arrayContaining(["ESPERANDO_CLIENTE", "RESUELTO"]),
    );
  });

  it("ESPERANDO_CLIENTE puede volver a EN_PROGRESO o resolver", () => {
    expect(TRANSICIONES_AGENTE.ESPERANDO_CLIENTE).toEqual(
      expect.arrayContaining(["EN_PROGRESO", "RESUELTO"]),
    );
  });

  it("los estatus finales y RESUELTO no permiten transición de agente", () => {
    expect(TRANSICIONES_AGENTE.RESUELTO).toEqual([]);
    expect(TRANSICIONES_AGENTE.CERRADO).toEqual([]);
    expect(TRANSICIONES_AGENTE.CANCELADO).toEqual([]);
  });

  it("ninguna transición apunta a un estatus desconocido", () => {
    const validos = new Set(Object.keys(TRANSICIONES_AGENTE));
    for (const destinos of Object.values(TRANSICIONES_AGENTE)) {
      for (const d of destinos) expect(validos.has(d)).toBe(true);
    }
  });
});

describe("soporte.estado — ventana de reapertura", () => {
  afterEach(() => vi.useRealTimers());

  it("false si el ticket nunca se resolvió", () => {
    expect(dentroVentanaReapertura(null)).toBe(false);
  });

  it("true justo dentro de la ventana, false justo fuera", () => {
    vi.useFakeTimers();
    const ahora = new Date("2026-01-15T12:00:00Z");
    vi.setSystemTime(ahora);

    const dentro = new Date(ahora.getTime() - (DIAS_REAPERTURA - 1) * 24 * 3600 * 1000);
    const fuera = new Date(ahora.getTime() - (DIAS_REAPERTURA + 1) * 24 * 3600 * 1000);

    expect(dentroVentanaReapertura(dentro)).toBe(true);
    expect(dentroVentanaReapertura(fuera)).toBe(false);
  });

  it("true en el límite exacto de los 7 días", () => {
    vi.useFakeTimers();
    const resuelto = new Date("2026-01-01T00:00:00Z");
    vi.setSystemTime(new Date(resuelto.getTime() + DIAS_REAPERTURA * 24 * 3600 * 1000));
    expect(dentroVentanaReapertura(resuelto)).toBe(true);
  });
});
