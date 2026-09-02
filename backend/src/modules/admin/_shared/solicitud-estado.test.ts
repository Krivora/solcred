import { describe, it, expect } from "vitest";
import { calcularMetricas, ESTATUS_FINALES } from "./solicitud-estado";

/** Arma un objeto `solicitud` mínimo para `calcularMetricas`. */
function fixture(opts: {
  tipoPersona?: "FISICA" | "MORAL" | null;
  requeridos: { tipoDocumentoId: string; esObligatorio: boolean; aplicaA: string | null }[];
  documentos: { tipoDocumentoId: string; estatus: string; activo: boolean }[];
}) {
  return {
    tipoPersona: opts.tipoPersona ?? "FISICA",
    programa: { documentosRequeridos: opts.requeridos },
    documentos: opts.documentos,
  };
}

describe("calcularMetricas", () => {
  it("sin documentos requeridos => 0 en todo y 0%", () => {
    const m = calcularMetricas(fixture({ requeridos: [], documentos: [] }));
    expect(m).toMatchObject({
      totalRequeridos: 0,
      totalAprobados: 0,
      totalNoSubidos: 0,
      porcentajeCompletado: 0,
    });
  });

  it("solo cuenta los obligatorios en totalRequeridos", () => {
    const m = calcularMetricas(
      fixture({
        requeridos: [
          { tipoDocumentoId: "a", esObligatorio: true, aplicaA: null },
          { tipoDocumentoId: "b", esObligatorio: false, aplicaA: null },
        ],
        documentos: [],
      }),
    );
    expect(m.totalRequeridos).toBe(1);
    expect(m.totalNoSubidos).toBe(1);
  });

  it("clasifica cada obligatorio por el estatus de su documento activo", () => {
    const m = calcularMetricas(
      fixture({
        requeridos: [
          { tipoDocumentoId: "a", esObligatorio: true, aplicaA: null },
          { tipoDocumentoId: "b", esObligatorio: true, aplicaA: null },
          { tipoDocumentoId: "c", esObligatorio: true, aplicaA: null },
          { tipoDocumentoId: "d", esObligatorio: true, aplicaA: null },
        ],
        documentos: [
          { tipoDocumentoId: "a", estatus: "APROBADO", activo: true },
          { tipoDocumentoId: "b", estatus: "RECHAZADO", activo: true },
          { tipoDocumentoId: "c", estatus: "PENDIENTE", activo: true },
          // "d" no subido
        ],
      }),
    );
    expect(m).toMatchObject({
      totalRequeridos: 4,
      totalAprobados: 1,
      totalRechazados: 1,
      totalPendientes: 1,
      totalNoSubidos: 1,
      totalSubidos: 3,
      porcentajeCompletado: 25,
    });
  });

  it("ignora versiones inactivas del documento", () => {
    const m = calcularMetricas(
      fixture({
        requeridos: [{ tipoDocumentoId: "a", esObligatorio: true, aplicaA: null }],
        documentos: [
          { tipoDocumentoId: "a", estatus: "RECHAZADO", activo: false },
          { tipoDocumentoId: "a", estatus: "APROBADO", activo: true },
        ],
      }),
    );
    expect(m.totalAprobados).toBe(1);
    expect(m.totalRechazados).toBe(0);
  });

  it("excluye documentos cuyo aplicaA no corresponde al tipo de persona", () => {
    const m = calcularMetricas(
      fixture({
        tipoPersona: "FISICA",
        requeridos: [
          { tipoDocumentoId: "acta", esObligatorio: true, aplicaA: "MORAL" },
          { tipoDocumentoId: "ine", esObligatorio: true, aplicaA: "FISICA" },
          { tipoDocumentoId: "rfc", esObligatorio: true, aplicaA: "AMBOS" },
        ],
        documentos: [],
      }),
    );
    // acta (MORAL) queda fuera para una persona física
    expect(m.totalRequeridos).toBe(2);
  });

  it("redondea el porcentaje (2 de 3 => 67%)", () => {
    const m = calcularMetricas(
      fixture({
        requeridos: ["a", "b", "c"].map((id) => ({
          tipoDocumentoId: id,
          esObligatorio: true,
          aplicaA: null,
        })),
        documentos: [
          { tipoDocumentoId: "a", estatus: "APROBADO", activo: true },
          { tipoDocumentoId: "b", estatus: "APROBADO", activo: true },
        ],
      }),
    );
    expect(m.porcentajeCompletado).toBe(67);
  });
});

describe("ESTATUS_FINALES", () => {
  it("son exactamente APROBADO, RECHAZADO y CANCELADO", () => {
    expect([...ESTATUS_FINALES].sort()).toEqual(["APROBADO", "CANCELADO", "RECHAZADO"]);
  });
});
