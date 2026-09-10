import { describe, it, expect } from "vitest";
import { prisma } from "./pglite-client";
import { crearCliente, crearPersonal, crearPrograma, crearSolicitud } from "./factories";
import {
  enviarAAprobacion,
  devolverAlSolicitante,
  rechazar,
  cancelar,
} from "@modules/admin/promocion/promocion.service";

async function escenario(estatus: string) {
  const cliente = await crearCliente();
  const programa = await crearPrograma();
  const { usuario: staff } = await crearPersonal("ADMIN");
  const solicitud = await crearSolicitud(cliente.id, programa.id, { estatus });
  return { solicitud, staffId: staff.id };
}

describe("promoción · transiciones de estatus", () => {
  it("enviarAAprobacion: EN_REVISION → EN_APROBACION y deja rastro en HistorialEstatus", async () => {
    const { solicitud, staffId } = await escenario("EN_REVISION");

    const actualizada = await enviarAAprobacion(solicitud.id, { motivo: "todo en orden" }, staffId);
    expect(actualizada.estatus).toBe("EN_APROBACION");

    const historial = await prisma.historialEstatus.findMany({ where: { solicitudId: solicitud.id } });
    expect(historial).toHaveLength(1);
    expect(historial[0]).toMatchObject({
      estatusAnterior: "EN_REVISION",
      estatusNuevo: "EN_APROBACION",
      motivo: "todo en orden",
      usuarioId: staffId,
    });
  });

  it("devolverAlSolicitante: EN_REVISION → EN_CORRECCION", async () => {
    const { solicitud, staffId } = await escenario("EN_REVISION");
    const r = await devolverAlSolicitante(solicitud.id, { motivo: "falta comprobante" }, staffId);
    expect(r.estatus).toBe("EN_CORRECCION");
  });

  it("rechazar: EN_APROBACION → RECHAZADO", async () => {
    const { solicitud, staffId } = await escenario("EN_APROBACION");
    const r = await rechazar(solicitud.id, { motivo: "capacidad de pago insuficiente" }, staffId);
    expect(r.estatus).toBe("RECHAZADO");
  });

  it("rechaza la transición desde un estatus no permitido (422)", async () => {
    const { solicitud, staffId } = await escenario("PENDIENTE");
    await expect(
      enviarAAprobacion(solicitud.id, { motivo: "x" }, staffId),
    ).rejects.toMatchObject({ statusCode: 422 });
  });

  it("no permite ninguna transición desde un estatus final (400)", async () => {
    const { solicitud, staffId } = await escenario("APROBADO");
    await expect(cancelar(solicitud.id, { motivo: "x" }, staffId)).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("404 si la solicitud no existe", async () => {
    const { staffId } = await escenario("EN_REVISION");
    await expect(
      enviarAAprobacion("00000000-0000-0000-0000-000000000000", { motivo: "x" }, staffId),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});
