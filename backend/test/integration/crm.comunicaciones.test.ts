import { describe, it, expect } from "vitest";
import { prisma } from "./pglite-client";
import {
  crearCliente,
  crearComunicacion,
  crearGrupoConGestor,
  crearPersonal,
  crearPrograma,
  crearSolicitud,
} from "./factories";
import {
  crearComunicacion as registrar,
  listarComunicaciones,
  obtenerResumen,
  editarComunicacion,
  type Actor,
} from "@modules/crm/crm.service";

const DIA_MS = 24 * 60 * 60 * 1000;

async function escenario() {
  const cliente = await crearCliente();
  const programa = await crearPrograma();

  const { usuario: gestorU, personal: gestor } = await crearPersonal("GESTOR");
  const { usuario: adminU, personal: admin } = await crearPersonal("ADMIN");

  const grupo = await crearGrupoConGestor(gestor.id);
  const solicitud = await crearSolicitud(cliente.id, programa.id, { estatus: "EN_REVISION" });
  await prisma.asignacionSolicitud.create({
    data: { solicitudId: solicitud.id, gestorId: gestor.id, grupoId: grupo.id, activa: true },
  });

  const actorGestor: Actor = { id: gestorU.id, rol: "GESTOR", personalId: gestor.id };
  const actorAdmin: Actor = { id: adminU.id, rol: "ADMIN", personalId: admin.id };
  const actorCliente: Actor = { id: cliente.id, rol: "CLIENTE" };

  return { cliente, programa, gestor, admin, solicitud, actorGestor, actorAdmin, actorCliente };
}

describe("crm · comunicaciones", () => {
  it("el gestor asignado registra una comunicación y deriva cliente + autor", async () => {
    const { solicitud, cliente, gestor, actorGestor } = await escenario();

    const com = await registrar(actorGestor, {
      solicitudId: solicitud.id,
      tipo: "LLAMADA",
      motivo: "DOCUMENTACION_FALTANTE",
      resultado: "CONTACTADO",
      observaciones: "Enviará el acta esta semana",
    });

    expect(com.clienteId).toBe(cliente.id);
    expect(com.registradoPor.id).toBe(gestor.id);
    expect(com.solicitud.folio).toBe(solicitud.folio);
    expect(com.editadoEn).toBeNull();

    const enBd = await prisma.comunicacion.findUnique({ where: { id: com.id } });
    expect(enBd).toMatchObject({ solicitudId: solicitud.id, clienteId: cliente.id });
  });

  it("un gestor NO asignado no puede registrar (403)", async () => {
    const { solicitud } = await escenario();
    const { usuario, personal } = await crearPersonal("GESTOR");
    const otro: Actor = { id: usuario.id, rol: "GESTOR", personalId: personal.id };

    await expect(
      registrar(otro, {
        solicitudId: solicitud.id,
        tipo: "CORREO",
        motivo: "SEGUIMIENTO_SOLICITUD",
        resultado: "SIN_RESPUESTA",
      }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("un ADMIN puede registrar en cualquier solicitud", async () => {
    const { solicitud, actorAdmin } = await escenario();
    const com = await registrar(actorAdmin, {
      solicitudId: solicitud.id,
      tipo: "PRESENCIAL",
      motivo: "ACLARACION_INFORMACION",
      resultado: "INFORMACION_ACLARADA",
    });
    expect(com.id).toBeTruthy();
  });

  it("el CLIENTE no tiene acceso al CRM (403)", async () => {
    const { solicitud, actorCliente } = await escenario();
    await expect(
      registrar(actorCliente, {
        solicitudId: solicitud.id,
        tipo: "LLAMADA",
        motivo: "OTRO",
        resultado: "OTRO",
      }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("rechaza una fecha de contacto futura (422)", async () => {
    const { solicitud, actorAdmin } = await escenario();
    await expect(
      registrar(actorAdmin, {
        solicitudId: solicitud.id,
        tipo: "LLAMADA",
        motivo: "OTRO",
        resultado: "OTRO",
        fechaContacto: new Date(Date.now() + 3 * DIA_MS).toISOString(),
      }),
    ).rejects.toMatchObject({ statusCode: 422 });
  });

  it("lista el historial de una solicitud en orden cronológico inverso", async () => {
    const { solicitud, cliente, gestor, actorGestor } = await escenario();

    const vieja = await crearComunicacion({
      solicitudId: solicitud.id,
      clienteId: cliente.id,
      registradoPorId: gestor.id,
      fechaContacto: new Date(Date.now() - 10 * DIA_MS),
    });
    const nueva = await crearComunicacion({
      solicitudId: solicitud.id,
      clienteId: cliente.id,
      registradoPorId: gestor.id,
      fechaContacto: new Date(Date.now() - 1 * DIA_MS),
    });

    const res = await listarComunicaciones(actorGestor, { solicitudId: solicitud.id });
    expect(res.data.map((c) => c.id)).toEqual([nueva.id, vieja.id]);
    expect(res.pagination.total).toBe(2);
  });

  it("el historial por cliente agrega varias solicitudes (ADMIN)", async () => {
    const { cliente, programa, gestor, actorAdmin } = await escenario();
    const s1 = await crearSolicitud(cliente.id, programa.id);
    const s2 = await crearSolicitud(cliente.id, programa.id);
    await crearComunicacion({ solicitudId: s1.id, clienteId: cliente.id, registradoPorId: gestor.id });
    await crearComunicacion({ solicitudId: s2.id, clienteId: cliente.id, registradoPorId: gestor.id });

    const res = await listarComunicaciones(actorAdmin, { clienteId: cliente.id });
    expect(res.pagination.total).toBe(2);
  });

  it("el gestor solo ve, por cliente, las comunicaciones de solicitudes que tiene asignadas", async () => {
    const { cliente, programa, gestor, solicitud, actorGestor } = await escenario();
    // Comunicación en la solicitud asignada
    await crearComunicacion({ solicitudId: solicitud.id, clienteId: cliente.id, registradoPorId: gestor.id });
    // Comunicación en OTRA solicitud del mismo cliente, no asignada al gestor
    const otra = await crearSolicitud(cliente.id, programa.id);
    await crearComunicacion({ solicitudId: otra.id, clienteId: cliente.id, registradoPorId: gestor.id });

    const res = await listarComunicaciones(actorGestor, { clienteId: cliente.id });
    expect(res.pagination.total).toBe(1);
    expect(res.data[0].solicitudId).toBe(solicitud.id);
  });

  it("resumen: total, última y seguimiento reciente", async () => {
    const { solicitud, cliente, gestor, actorAdmin } = await escenario();

    const vacio = await obtenerResumen(actorAdmin, solicitud.id);
    expect(vacio).toMatchObject({ total: 0, ultima: null, seguimientoReciente: false });

    await crearComunicacion({
      solicitudId: solicitud.id,
      clienteId: cliente.id,
      registradoPorId: gestor.id,
      fechaContacto: new Date(Date.now() - 30 * DIA_MS),
    });
    const antiguo = await obtenerResumen(actorAdmin, solicitud.id);
    expect(antiguo.total).toBe(1);
    expect(antiguo.seguimientoReciente).toBe(false);

    await crearComunicacion({
      solicitudId: solicitud.id,
      clienteId: cliente.id,
      registradoPorId: gestor.id,
      fechaContacto: new Date(Date.now() - 1 * DIA_MS),
    });
    const reciente = await obtenerResumen(actorAdmin, solicitud.id);
    expect(reciente.total).toBe(2);
    expect(reciente.seguimientoReciente).toBe(true);
    expect(reciente.ultima?.id).toBeTruthy();
  });

  it("solo el autor edita su comunicación y se marca editadoEn", async () => {
    const { solicitud, gestor, actorGestor, actorAdmin } = await escenario();

    const com = await registrar(actorGestor, {
      solicitudId: solicitud.id,
      tipo: "LLAMADA",
      motivo: "SEGUIMIENTO_SOLICITUD",
      resultado: "CONTACTADO",
    });

    await expect(
      editarComunicacion(actorAdmin, com.id, { resultado: "SIN_RESPUESTA" }),
    ).rejects.toMatchObject({ statusCode: 403 });

    const editada = await editarComunicacion(actorGestor, com.id, {
      resultado: "SOLICITA_RECONTACTO",
      observaciones: "Pide que le llamen el lunes",
    });
    expect(editada.resultado).toBe("SOLICITA_RECONTACTO");
    expect(editada.editadoEn).not.toBeNull();
    expect(editada.registradoPor.id).toBe(gestor.id);
  });
});
