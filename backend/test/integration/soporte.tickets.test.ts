import { randomUUID } from "node:crypto";
import { describe, it, expect } from "vitest";
import { prisma } from "./pglite-client";
import { crearCliente, crearEventoTicket, crearPersonal, crearTicket } from "./factories";
import {
  crearTicket as crear,
  obtenerTicket,
  comentarTicket,
  cerrarTicket,
  reabrirTicket,
  calificarTicket,
  listarTickets,
  listarMisTickets,
  obtenerStats,
  obtenerMetricas,
  listarAgentes,
  asignarTicket,
  cambiarEstatus,
  cancelarTicket,
  type Actor,
} from "@modules/soporte/soporte.service";

const DIA_MS = 24 * 60 * 60 * 1000;

async function escenario() {
  const cliente = await crearCliente();
  const { usuario: adminU, personal: admin } = await crearPersonal("ADMIN");
  const { usuario: admin2U, personal: admin2 } = await crearPersonal("ADMIN");
  const { usuario: supervisorU, personal: supervisor } = await crearPersonal("SUPERVISOR");
  const { usuario: soporteU, personal: soporte } = await crearPersonal("SOPORTE");

  const actorCliente: Actor = { id: cliente.id, rol: "CLIENTE" };
  const actorAdmin: Actor = { id: adminU.id, rol: "ADMIN", personalId: admin.id };
  const actorAdmin2: Actor = { id: admin2U.id, rol: "ADMIN", personalId: admin2.id };
  const actorSupervisor: Actor = { id: supervisorU.id, rol: "SUPERVISOR", personalId: supervisor.id };
  const actorSoporte: Actor = { id: soporteU.id, rol: "SOPORTE", personalId: soporte.id };

  return {
    cliente,
    admin,
    admin2,
    supervisor,
    soporte,
    actorCliente,
    actorAdmin,
    actorAdmin2,
    actorSupervisor,
    actorSoporte,
  };
}

const dtoBase = {
  titulo: "No puedo entrar al portal",
  descripcion: "Me marca error al iniciar sesión desde ayer por la tarde",
  categoria: "ACCESO_PERMISOS" as const,
};

describe("soporte · tickets", () => {
  it("el solicitante crea un ticket con folio, estatus NUEVO y evento CREADO", async () => {
    const { cliente, actorCliente } = await escenario();

    const ticket = await crear(actorCliente, randomUUID(), dtoBase, []);

    expect(ticket.folio).toMatch(/^TKT-\d{4}-\d{4}$/);
    expect(ticket.estatus).toBe("NUEVO");
    expect(ticket.esSolicitante).toBe(true);
    expect(ticket.eventos.map((e) => e.tipo)).toEqual(["CREADO"]);

    const enBd = await prisma.ticket.findUnique({ where: { id: ticket.id } });
    expect(enBd).toMatchObject({ solicitanteId: cliente.id, estatus: "NUEVO" });
  });

  it("un tercero no puede ver el ticket de otro (404)", async () => {
    const { actorCliente } = await escenario();
    const otroCliente = await crearCliente();
    const ticket = await crearTicket(otroCliente.id);

    await expect(obtenerTicket(actorCliente, ticket.id)).rejects.toMatchObject({ statusCode: 404 });
  });

  it("ADMIN y SUPERVISOR pueden ver el ticket de cualquiera; SUPERVISOR no puede comentar", async () => {
    const { cliente, actorAdmin, actorSupervisor } = await escenario();
    const ticket = await crearTicket(cliente.id);

    const comoAdmin = await obtenerTicket(actorAdmin, ticket.id);
    const comoSupervisor = await obtenerTicket(actorSupervisor, ticket.id);
    expect(comoAdmin.id).toBe(ticket.id);
    expect(comoSupervisor.id).toBe(ticket.id);

    await expect(
      comentarTicket(actorSupervisor, ticket.id, { cuerpo: "Reviso esto", esNotaInterna: false }, []),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("una nota interna de un ADMIN queda oculta para el solicitante", async () => {
    const { cliente, actorCliente, actorAdmin } = await escenario();
    const ticket = await crearTicket(cliente.id, { estatus: "ASIGNADO" });

    await comentarTicket(actorAdmin, ticket.id, { cuerpo: "Nota solo para el equipo", esNotaInterna: true }, []);
    await comentarTicket(actorAdmin, ticket.id, { cuerpo: "Ya lo estamos revisando", esNotaInterna: false }, []);

    const paraCliente = await obtenerTicket(actorCliente, ticket.id);
    const paraAdmin = await obtenerTicket(actorAdmin, ticket.id);

    expect(paraCliente.comentarios).toHaveLength(1);
    expect(paraCliente.comentarios[0].esNotaInterna).toBe(false);
    expect(paraAdmin.comentarios).toHaveLength(2);
  });

  it("el primer comentario público de un agente marca la primera respuesta", async () => {
    const { cliente, actorAdmin } = await escenario();
    const ahora = new Date();
    const ticket = await crearTicket(cliente.id, {
      estatus: "ASIGNADO",
      slaArrancadoEn: ahora,
      slaRespuestaLimite: new Date(ahora.getTime() + DIA_MS),
    });

    await comentarTicket(actorAdmin, ticket.id, { cuerpo: "Estamos en ello", esNotaInterna: false }, []);

    const enBd = await prisma.ticket.findUnique({ where: { id: ticket.id } });
    expect(enBd?.primeraRespuestaEn).not.toBeNull();
    expect(enBd?.slaRespuestaCumplida).toBe(true);
  });

  it("no se puede comentar un ticket cerrado (409)", async () => {
    const { cliente, actorCliente } = await escenario();
    const ticket = await crearTicket(cliente.id, { estatus: "CERRADO", cerradoEn: new Date() });

    await expect(
      comentarTicket(actorCliente, ticket.id, { cuerpo: "¿Sigue abierto?", esNotaInterna: false }, []),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("asignar arranca el SLA una sola vez; reasignar no lo reinicia", async () => {
    const { cliente, admin, admin2, actorAdmin } = await escenario();
    const ticket = await crearTicket(cliente.id);

    const asignado = await asignarTicket(actorAdmin, ticket.id, { agenteId: admin.id });
    expect(asignado.estatus).toBe("ASIGNADO");

    const trasAsignar = await prisma.ticket.findUnique({ where: { id: ticket.id } });
    expect(trasAsignar?.slaArrancadoEn).not.toBeNull();
    const arranqueOriginal = trasAsignar!.slaArrancadoEn;

    const reasignado = await asignarTicket(actorAdmin, ticket.id, { agenteId: admin2.id });
    expect(reasignado.eventos.map((e) => e.tipo)).toContain("REASIGNADO");

    const trasReasignar = await prisma.ticket.findUnique({ where: { id: ticket.id } });
    expect(trasReasignar?.slaArrancadoEn).toEqual(arranqueOriginal);
    expect(trasReasignar?.agenteId).toBe(admin2.id);
  });

  it("no se puede asignar a alguien que no es ADMIN activo (400)", async () => {
    const { cliente, supervisor, actorAdmin } = await escenario();
    const ticket = await crearTicket(cliente.id);

    await expect(
      asignarTicket(actorAdmin, ticket.id, { agenteId: supervisor.id }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("respeta la máquina de estados: transición inválida se rechaza (409)", async () => {
    const { cliente, actorAdmin } = await escenario();
    const ticket = await crearTicket(cliente.id, { estatus: "NUEVO" });

    await expect(
      cambiarEstatus(actorAdmin, ticket.id, { estatus: "RESUELTO" }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("pasar a RESUELTO sella resueltoEn y evalúa el SLA de resolución", async () => {
    const { cliente, actorAdmin } = await escenario();
    const ahora = new Date();
    const ticket = await crearTicket(cliente.id, {
      estatus: "EN_PROGRESO",
      slaArrancadoEn: ahora,
      slaResolucionLimite: new Date(ahora.getTime() + DIA_MS),
    });

    const resuelto = await cambiarEstatus(actorAdmin, ticket.id, { estatus: "RESUELTO" });
    expect(resuelto.resueltoEn).not.toBeNull();
    expect(resuelto.slaResolucionCumplida).toBe(true);
  });

  it("cerrar solo funciona sobre un ticket RESUELTO", async () => {
    const { cliente, actorCliente } = await escenario();
    const nuevo = await crearTicket(cliente.id, { estatus: "NUEVO" });
    await expect(cerrarTicket(actorCliente, nuevo.id)).rejects.toMatchObject({ statusCode: 409 });

    const resuelto = await crearTicket(cliente.id, { estatus: "RESUELTO" });
    const cerrado = await cerrarTicket(actorCliente, resuelto.id);
    expect(cerrado.estatus).toBe("CERRADO");
    expect(cerrado.cerradoEn).not.toBeNull();
  });

  it("el solicitante reabre dentro de la ventana de 7 días; fuera de ventana solo el ADMIN puede", async () => {
    const { cliente, actorCliente, actorAdmin } = await escenario();

    const reciente = await crearTicket(cliente.id, { estatus: "RESUELTO", resueltoEn: new Date() });
    const reabierto = await reabrirTicket(actorCliente, reciente.id, "El problema volvió a aparecer");
    expect(reabierto.estatus).toBe("EN_PROGRESO");
    expect(reabierto.reabierto).toBe(true);

    const antiguo = await crearTicket(cliente.id, {
      estatus: "RESUELTO",
      resueltoEn: new Date(Date.now() - 10 * DIA_MS),
    });
    await expect(
      reabrirTicket(actorCliente, antiguo.id, "Sigue sin funcionar"),
    ).rejects.toMatchObject({ statusCode: 409 });

    const porAdmin = await reabrirTicket(actorAdmin, antiguo.id, "Reabre soporte a petición telefónica");
    expect(porAdmin.estatus).toBe("EN_PROGRESO");
  });

  it("un ticket cerrado no se reabre ni se vuelve a calificar dos veces", async () => {
    const { cliente, actorCliente } = await escenario();
    const cerrado = await crearTicket(cliente.id, { estatus: "CERRADO", cerradoEn: new Date() });

    await expect(
      reabrirTicket(actorCliente, cerrado.id, "Necesito reabrirlo"),
    ).rejects.toMatchObject({ statusCode: 409 });

    const calificado = await calificarTicket(actorCliente, cerrado.id, { calificacion: 5 });
    expect(calificado.calificacion).toBe(5);

    await expect(
      calificarTicket(actorCliente, cerrado.id, { calificacion: 1 }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("cancelar es exclusivo de ADMIN y solo sobre tickets no finales", async () => {
    const { cliente, actorCliente, actorAdmin } = await escenario();
    const ticket = await crearTicket(cliente.id, { estatus: "EN_PROGRESO" });

    await expect(cancelarTicket(actorCliente, ticket.id, "Ya no aplica")).rejects.toMatchObject({
      statusCode: 403,
    });

    const cancelado = await cancelarTicket(actorAdmin, ticket.id, "Duplicado de otro ticket");
    expect(cancelado.estatus).toBe("CANCELADO");

    await expect(cancelarTicket(actorAdmin, ticket.id, "Otra vez")).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it("listarTickets y stats son exclusivos de staff (403 para el solicitante)", async () => {
    const { cliente, actorCliente, actorAdmin, actorSupervisor } = await escenario();
    await crearTicket(cliente.id);
    await crearTicket(cliente.id, { estatus: "CERRADO", cerradoEn: new Date() });

    await expect(listarTickets(actorCliente, {})).rejects.toMatchObject({ statusCode: 403 });
    await expect(obtenerStats(actorCliente)).rejects.toMatchObject({ statusCode: 403 });

    const lista = await listarTickets(actorAdmin, {});
    expect(lista.pagination.total).toBe(2);

    const sinAsignar = await listarTickets(actorSupervisor, { sinAsignar: true });
    expect(sinAsignar.pagination.total).toBe(2);

    const stats = await obtenerStats(actorAdmin);
    expect(stats.porEstatus.NUEVO).toBe(1);
    expect(stats.porEstatus.CERRADO).toBe(1);
    expect(stats.abiertos).toBe(1);
  });

  it("listarMisTickets solo trae los del propio solicitante", async () => {
    const { cliente, actorCliente } = await escenario();
    const otroCliente = await crearCliente();
    const propio = await crearTicket(cliente.id);
    await crearTicket(otroCliente.id);

    const propios = await listarMisTickets(actorCliente, {});
    expect(propios.pagination.total).toBe(1);
    expect(propios.data[0].id).toBe(propio.id);
  });

  it("listarAgentes devuelve ADMIN y SOPORTE activos, con su carga de tickets abiertos", async () => {
    const { cliente, admin, soporte, actorAdmin } = await escenario();
    const ticket = await crearTicket(cliente.id);
    await asignarTicket(actorAdmin, ticket.id, { agenteId: admin.id });

    const agentes = await listarAgentes(actorAdmin);
    const yo = agentes.find((a) => a.id === admin.id);
    const deSoporte = agentes.find((a) => a.id === soporte.id);
    expect(yo).toBeDefined();
    expect(yo?.ticketsAbiertos).toBe(1);
    expect(deSoporte).toBeDefined();
  });

  it("un usuario con rol SOPORTE actúa como agente: se le puede asignar, comenta, cambia estatus y cancela", async () => {
    const { cliente, soporte, actorSoporte } = await escenario();
    const ticket = await crearTicket(cliente.id);

    const asignado = await asignarTicket(actorSoporte, ticket.id, { agenteId: soporte.id });
    expect(asignado.estatus).toBe("ASIGNADO");

    await comentarTicket(actorSoporte, ticket.id, { cuerpo: "Reviso tu caso", esNotaInterna: false }, []);
    const enProgreso = await cambiarEstatus(actorSoporte, ticket.id, { estatus: "EN_PROGRESO" });
    expect(enProgreso.estatus).toBe("EN_PROGRESO");

    const cancelado = await cancelarTicket(actorSoporte, ticket.id, "Duplicado");
    expect(cancelado.estatus).toBe("CANCELADO");
  });

  it("SOPORTE ve notas internas (es staff) y puede reabrir un RESUELTO fuera de la ventana de 7 días", async () => {
    const { cliente, actorAdmin, actorSoporte } = await escenario();
    const ticket = await crearTicket(cliente.id, { estatus: "ASIGNADO" });
    await comentarTicket(actorAdmin, ticket.id, { cuerpo: "Nota interna", esNotaInterna: true }, []);

    const vista = await obtenerTicket(actorSoporte, ticket.id);
    expect(vista.comentarios).toHaveLength(1);

    const antiguo = await crearTicket(cliente.id, {
      estatus: "RESUELTO",
      resueltoEn: new Date(Date.now() - 10 * DIA_MS),
    });
    const reabierto = await reabrirTicket(actorSoporte, antiguo.id, "Reabre soporte a petición del cliente");
    expect(reabierto.estatus).toBe("EN_PROGRESO");
  });

  it("obtenerMetricas agrupa eventos por día dentro del rango y es exclusivo de staff", async () => {
    const { cliente, actorAdmin, actorCliente } = await escenario();
    const ticket = await crearTicket(cliente.id);

    const hoy = new Date();
    const hace2 = new Date(hoy.getTime() - 2 * DIA_MS);
    const fueraDeRango = new Date(hoy.getTime() - 40 * DIA_MS);
    const clave = (d: Date) => d.toISOString().slice(0, 10);

    await crearEventoTicket({ ticketId: ticket.id, tipo: "CREADO", creadoEn: hoy });
    await crearEventoTicket({
      ticketId: ticket.id,
      tipo: "CAMBIO_ESTATUS",
      valorNuevo: "RESUELTO",
      creadoEn: hace2,
    });
    await crearEventoTicket({ ticketId: ticket.id, tipo: "SLA_INCUMPLIDO", creadoEn: hace2 });
    await crearEventoTicket({ ticketId: ticket.id, tipo: "CREADO", creadoEn: fueraDeRango });

    await expect(obtenerMetricas(actorCliente, {})).rejects.toMatchObject({ statusCode: 403 });

    const metricas = await obtenerMetricas(actorAdmin, { rango: "30d" });
    expect(metricas.rango).toBe("30d");
    expect(metricas.serie).toHaveLength(30);

    const filaHoy = metricas.serie.find((f) => f.fecha === clave(hoy));
    const filaHace2 = metricas.serie.find((f) => f.fecha === clave(hace2));
    expect(filaHoy?.creados).toBe(1);
    expect(filaHace2?.resueltos).toBe(1);
    expect(filaHace2?.slaIncumplidos).toBe(1);

    const totalCreados = metricas.serie.reduce((s, f) => s + f.creados, 0);
    expect(totalCreados).toBe(1); // el evento de hace 40 días queda fuera del rango de 30d

    expect(metricas.cargaPorAgente.length).toBeGreaterThan(0);
    expect(metricas.cargaPorAgente.every((a) => typeof a.ticketsAbiertos === "number")).toBe(true);
  });
});
