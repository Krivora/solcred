import { describe, it, expect } from "vitest";
import { prisma } from "./prisma";
import {
  crearCliente,
  crearGrupoConGestor,
  crearPersonal,
  crearPrograma,
  crearSolicitud,
} from "./factories";
import { validarDocumento } from "@modules/expediente/expediente.service";

async function escenario(estatusDoc: string = "PENDIENTE") {
  const cliente = await crearCliente();
  const programa = await crearPrograma();
  const { personal: gestor } = await crearPersonal("GESTOR");
  const grupo = await crearGrupoConGestor(gestor.id);
  const solicitud = await crearSolicitud(cliente.id, programa.id, { estatus: "EN_REVISION" });
  await prisma.asignacionSolicitud.create({
    data: { solicitudId: solicitud.id, gestorId: gestor.id, grupoId: grupo.id, activa: true },
  });
  const tipo = await prisma.tipoDocumento.create({ data: { nombre: `Doc ${solicitud.id}` } });
  const documento = await prisma.documentoSolicitud.create({
    data: {
      solicitudId: solicitud.id,
      tipoDocumentoId: tipo.id,
      urlArchivo: `${solicitud.id}/a.pdf`,
      nombreArchivo: "a.pdf",
      version: 1,
      activo: true,
      estatus: estatusDoc as never,
    },
  });
  return { solicitud, gestor, documento };
}

describe("expediente · validarDocumento", () => {
  it("el gestor asignado aprueba un documento PENDIENTE", async () => {
    const { solicitud, gestor, documento } = await escenario();

    const r = await validarDocumento(solicitud.id, documento.id, gestor.id, { estatus: "APROBADO" });
    expect(r.estatus).toBe("APROBADO");

    const enBd = await prisma.documentoSolicitud.findUnique({ where: { id: documento.id } });
    expect(enBd).toMatchObject({ estatus: "APROBADO", validadoPorId: gestor.id });
    expect(enBd?.fechaValidacion).toBeInstanceOf(Date);
  });

  it("rechazar guarda el motivo", async () => {
    const { solicitud, gestor, documento } = await escenario();
    const r = await validarDocumento(solicitud.id, documento.id, gestor.id, {
      estatus: "RECHAZADO",
      motivoRechazo: "ilegible",
    });
    expect(r.estatus).toBe("RECHAZADO");
    expect(r.motivoRechazo).toBe("ilegible");
  });

  it("un gestor que no es el asignado no puede validar (403)", async () => {
    const { solicitud, documento } = await escenario();
    const { personal: otro } = await crearPersonal("GESTOR");
    await expect(
      validarDocumento(solicitud.id, documento.id, otro.id, { estatus: "APROBADO" }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("no se puede validar un documento que ya no está PENDIENTE (422)", async () => {
    const { solicitud, gestor, documento } = await escenario("APROBADO");
    await expect(
      validarDocumento(solicitud.id, documento.id, gestor.id, {
        estatus: "RECHAZADO",
        motivoRechazo: "x",
      }),
    ).rejects.toMatchObject({ statusCode: 422 });
  });
});
