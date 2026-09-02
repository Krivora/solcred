import { describe, it, expect } from "vitest";
import { prisma } from "./prisma";
import {
  crearCliente,
  crearGrupoConGestor,
  crearPersonal,
  crearPrograma,
  crearSolicitud,
} from "./factories";
import { asignarAutomaticamente } from "@modules/admin/asignacion/asignacion.service";

describe("asignación automática", () => {
  it("asigna al gestor de un grupo cuya regla coincide y pasa a EN_REVISION", async () => {
    const cliente = await crearCliente();
    const programa = await crearPrograma();
    const { personal: gestor } = await crearPersonal("GESTOR");
    await crearGrupoConGestor(gestor.id, {
      reglas: [{ campo: "TIPO_PERSONA", operador: "IGUAL", valor: "FISICA" }],
    });
    const solicitud = await crearSolicitud(cliente.id, programa.id, {
      estatus: "PENDIENTE",
      tipoPersona: "FISICA",
    });

    const [res] = await asignarAutomaticamente([solicitud.id]);
    expect(res.exito).toBe(true);

    const enBd = await prisma.solicitud.findUnique({ where: { id: solicitud.id } });
    expect(enBd?.estatus).toBe("EN_REVISION");

    const asignacion = await prisma.asignacionSolicitud.findFirst({
      where: { solicitudId: solicitud.id, activa: true },
    });
    expect(asignacion?.gestorId).toBe(gestor.id);
    expect(asignacion?.asignadoPorId).toBeNull(); // automática
  });

  it("no asigna si ninguna regla coincide y no hay grupo general", async () => {
    const cliente = await crearCliente();
    const programa = await crearPrograma();
    const { personal: gestor } = await crearPersonal("GESTOR");
    await crearGrupoConGestor(gestor.id, {
      reglas: [{ campo: "TIPO_PERSONA", operador: "IGUAL", valor: "MORAL" }],
    });
    const solicitud = await crearSolicitud(cliente.id, programa.id, { tipoPersona: "FISICA" });

    const [res] = await asignarAutomaticamente([solicitud.id]);
    expect(res.exito).toBe(false);

    const enBd = await prisma.solicitud.findUnique({ where: { id: solicitud.id } });
    expect(enBd?.estatus).toBe("PENDIENTE");
  });

  it("usa el grupo general (sin reglas) como respaldo", async () => {
    const cliente = await crearCliente();
    const programa = await crearPrograma();
    const { personal: gestor } = await crearPersonal("GESTOR");
    await crearGrupoConGestor(gestor.id); // sin reglas
    const solicitud = await crearSolicitud(cliente.id, programa.id, { tipoPersona: "MORAL" });

    const [res] = await asignarAutomaticamente([solicitud.id]);
    expect(res.exito).toBe(true);
  });

  it("omite (sin error) una solicitud que ya tiene asignación activa", async () => {
    const cliente = await crearCliente();
    const programa = await crearPrograma();
    const { personal: gestor } = await crearPersonal("GESTOR");
    const grupo = await crearGrupoConGestor(gestor.id);
    const solicitud = await crearSolicitud(cliente.id, programa.id, { estatus: "EN_REVISION" });
    await prisma.asignacionSolicitud.create({
      data: { solicitudId: solicitud.id, gestorId: gestor.id, grupoId: grupo.id, activa: true },
    });

    const [res] = await asignarAutomaticamente([solicitud.id]);
    expect(res).toMatchObject({ exito: true, mensaje: expect.stringMatching(/ya ten/i) });
  });

  it("balancea: la nueva solicitud va al gestor con menos carga activa", async () => {
    const cliente = await crearCliente();
    const programa = await crearPrograma();
    const { personal: gestorA } = await crearPersonal("GESTOR");
    const { personal: gestorB } = await crearPersonal("GESTOR");

    const grupo = await prisma.grupoGestion.create({
      data: {
        nombre: "Grupo balanceo",
        gestores: { create: [{ gestorId: gestorA.id }, { gestorId: gestorB.id }] },
      },
    });

    // gestorA ya carga una asignación activa
    const previa = await crearSolicitud(cliente.id, programa.id, { estatus: "EN_REVISION" });
    await prisma.asignacionSolicitud.create({
      data: { solicitudId: previa.id, gestorId: gestorA.id, grupoId: grupo.id, activa: true },
    });

    const nueva = await crearSolicitud(cliente.id, programa.id, { estatus: "PENDIENTE" });
    const [res] = await asignarAutomaticamente([nueva.id]);
    expect(res.exito).toBe(true);

    const asignacion = await prisma.asignacionSolicitud.findFirst({
      where: { solicitudId: nueva.id, activa: true },
    });
    expect(asignacion?.gestorId).toBe(gestorB.id);
  });
});
