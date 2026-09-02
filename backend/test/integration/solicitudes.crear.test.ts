import { describe, it, expect } from "vitest";
import { prisma } from "./prisma";
import { crearCliente, crearPrograma, crearSolicitud } from "./factories";
import { crearSolicitud as crearSolicitudService } from "@modules/clientes/solicitudes/solicitudes.service";
import { AppError } from "@middlewares/error.middleware";

describe("solicitudes.service · crearSolicitud", () => {
  it("crea la solicitud en BORRADOR con folio de 5 dígitos", async () => {
    const cliente = await crearCliente();
    const programa = await crearPrograma();

    const s = await crearSolicitudService({ programaId: programa.id }, cliente.id);

    expect(s.estatus).toBe("BORRADOR");
    expect(s.folio).toMatch(/^\d{5}$/);
    expect(s.programa.nombre).toBe(programa.nombre);

    const enBd = await prisma.solicitud.findUnique({ where: { id: s.id } });
    expect(enBd).not.toBeNull();
  });

  it("rechaza una segunda solicitud si el cliente ya tiene una activa (409)", async () => {
    const cliente = await crearCliente();
    const programa = await crearPrograma();
    await crearSolicitudService({ programaId: programa.id }, cliente.id);

    await expect(
      crearSolicitudService({ programaId: programa.id }, cliente.id),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("permite una nueva solicitud si la anterior está en un estatus final", async () => {
    const cliente = await crearCliente();
    const programa = await crearPrograma();
    await crearSolicitud(cliente.id, programa.id, { estatus: "RECHAZADO" });

    const nueva = await crearSolicitudService({ programaId: programa.id }, cliente.id);
    expect(nueva.estatus).toBe("BORRADOR");
  });

  it("falla si el programa no existe o está inactivo", async () => {
    const cliente = await crearCliente();
    const inactivo = await crearPrograma({ activo: false });

    await expect(
      crearSolicitudService({ programaId: "no-existe" }, cliente.id),
    ).rejects.toBeInstanceOf(AppError);
    await expect(
      crearSolicitudService({ programaId: inactivo.id }, cliente.id),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});
