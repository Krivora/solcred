import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { aplicarMarcaAgua } from "./watermark";

async function pdfDePrueba(paginas = 2): Promise<Buffer> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < paginas; i++) doc.addPage([612, 792]);
  return Buffer.from(await doc.save());
}

describe("aplicarMarcaAgua", () => {
  it("devuelve un PDF válido con el mismo número de páginas", async () => {
    const original = await pdfDePrueba(3);

    const marcado = await aplicarMarcaAgua(original, [
      "Folio SC-2026-0001",
      "Consultado por Juan Pérez (Gestor)",
      "03/09/2026 14:22",
    ]);

    expect(marcado.length).toBeGreaterThan(0);
    expect(marcado.subarray(0, 5).toString()).toBe("%PDF-");

    const recargado = await PDFDocument.load(marcado);
    expect(recargado.getPageCount()).toBe(3);
    // La marca agrega contenido: el archivo crece.
    expect(marcado.length).toBeGreaterThan(original.length);
  });

  it("sin líneas devuelve el buffer original tal cual", async () => {
    const original = await pdfDePrueba();
    const resultado = await aplicarMarcaAgua(original, []);
    expect(resultado).toBe(original);
  });

  it("ante un archivo que no es PDF, devuelve el buffer original (fallback)", async () => {
    const basura = Buffer.from("esto no es un pdf");
    const resultado = await aplicarMarcaAgua(basura, ["Folio SC-2026-0002"]);
    expect(resultado).toBe(basura);
  });
});
