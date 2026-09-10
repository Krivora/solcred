import { describe, it, expect, vi, afterEach } from "vitest";
import { estadoDeCampo, ticketEnRiesgoOVencido } from "./soporte.sla";

const arranque = new Date("2026-01-10T00:00:00Z");
// objetivo total de 8 h a partir del arranque
const limite8h = new Date(arranque.getTime() + 8 * 3600 * 1000);

describe("soporte.sla — estadoDeCampo", () => {
  afterEach(() => vi.useRealTimers());

  const campo = (over: Partial<Parameters<typeof estadoDeCampo>[0]> = {}) => ({
    limite: limite8h,
    cumplida: null as boolean | null,
    hitoAlcanzado: false,
    ...over,
  });

  it("sin límite o sin arranque => sin_iniciar", () => {
    expect(estadoDeCampo(campo({ limite: null }), arranque)).toBe("sin_iniciar");
    expect(estadoDeCampo(campo(), null)).toBe("sin_iniciar");
  });

  it("cumplida true / hito alcanzado => cumplido; cumplida false => vencido", () => {
    expect(estadoDeCampo(campo({ cumplida: true }), arranque)).toBe("cumplido");
    expect(estadoDeCampo(campo({ hitoAlcanzado: true }), arranque)).toBe("cumplido");
    expect(estadoDeCampo(campo({ cumplida: false }), arranque)).toBe("vencido");
  });

  it("en curso mientras queda > 25% del tiempo objetivo", () => {
    vi.useFakeTimers();
    // a las 3 h de 8 -> quedan 5 h = 62.5% > 25%
    vi.setSystemTime(new Date(arranque.getTime() + 3 * 3600 * 1000));
    expect(estadoDeCampo(campo(), arranque)).toBe("en_curso");
  });

  it("en riesgo cuando queda <= 25% del tiempo objetivo", () => {
    vi.useFakeTimers();
    // a las 6.5 h de 8 -> quedan 1.5 h = 18.75% <= 25%
    vi.setSystemTime(new Date(arranque.getTime() + 6.5 * 3600 * 1000));
    expect(estadoDeCampo(campo(), arranque)).toBe("en_riesgo");
  });

  it("vencido cuando ya pasó el límite y no se cumplió el hito", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(limite8h.getTime() + 60_000));
    expect(estadoDeCampo(campo(), arranque)).toBe("vencido");
  });
});

describe("soporte.sla — ticketEnRiesgoOVencido", () => {
  afterEach(() => vi.useRealTimers());

  const base = {
    slaArrancadoEn: arranque,
    slaRespuestaLimite: limite8h,
    slaResolucionLimite: new Date(arranque.getTime() + 72 * 3600 * 1000),
    primeraRespuestaEn: null as Date | null,
    slaRespuestaCumplida: null as boolean | null,
    slaResolucionCumplida: null as boolean | null,
    resueltoEn: null as Date | null,
  };

  it("sin arrancar => no hay alerta", () => {
    const r = ticketEnRiesgoOVencido({ ...base, slaArrancadoEn: null });
    expect(r.alerta).toBe(false);
    expect(r.respuesta).toBe("sin_iniciar");
  });

  it("alerta cuando la respuesta está en riesgo", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(arranque.getTime() + 7 * 3600 * 1000));
    const r = ticketEnRiesgoOVencido(base);
    expect(r.respuesta).toBe("en_riesgo");
    expect(r.alerta).toBe(true);
  });

  it("sin alerta si ambos hitos ya se cumplieron", () => {
    const r = ticketEnRiesgoOVencido({
      ...base,
      primeraRespuestaEn: new Date(arranque.getTime() + 3600 * 1000),
      resueltoEn: new Date(arranque.getTime() + 2 * 3600 * 1000),
    });
    expect(r.alerta).toBe(false);
    expect(r.respuesta).toBe("cumplido");
    expect(r.resolucion).toBe("cumplido");
  });
});
