import { describe, it, expect } from "vitest";
import { prisma } from "./pglite-client";
import { crearCliente, crearPersonal, crearPrograma, crearSolicitud } from "./factories";
import {
  desactivarUsuario,
  desbloquearUsuario,
  revocarAccesoPersonal,
} from "@modules/admin/usuarios/usuarios.service";

describe("baja de personal: solicitudes huérfanas", () => {
  it("revocarAccesoPersonal libera la asignación activa del gestor y notifica al encargado de respaldo", async () => {
    const cliente = await crearCliente();
    const programa = await crearPrograma();
    const { usuario: usuarioGestor, personal: gestor } = await crearPersonal("GESTOR");
    const { usuario: usuarioEncargado } = await crearPersonal("ENCARGADO_PROMOCION");

    const grupo = await prisma.grupoGestion.create({
      data: { nombre: "Grupo", gestores: { create: { gestorId: gestor.id } } },
    });
    const solicitud = await crearSolicitud(cliente.id, programa.id, { estatus: "EN_REVISION" });
    await prisma.asignacionSolicitud.create({
      data: { solicitudId: solicitud.id, gestorId: gestor.id, grupoId: grupo.id, activa: true },
    });

    await revocarAccesoPersonal(usuarioGestor.id);

    const asignacion = await prisma.asignacionSolicitud.findFirst({
      where: { solicitudId: solicitud.id },
    });
    expect(asignacion?.activa).toBe(false);
    expect(asignacion?.motivoReasignacion).toMatch(/dado de baja/i);

    const notificacion = await prisma.notificacion.findFirst({
      where: { usuarioId: usuarioEncargado.id, tipo: "REASIGNACION_REQUERIDA" },
    });
    expect(notificacion).not.toBeNull();
    expect(notificacion?.solicitudId).toBe(solicitud.id);
    expect(notificacion?.titulo).toContain(solicitud.folio);
  });

  it("desactivarUsuario libera la asignación activa del analista y prioriza al supervisor directo sobre el encargado", async () => {
    const cliente = await crearCliente();
    const programa = await crearPrograma();
    const { usuario: admin } = await crearPersonal("ADMIN");
    const { usuario: usuarioAnalista, personal: analista } = await crearPersonal("ANALISTA");
    const { usuario: usuarioSupervisor, personal: supervisor } = await crearPersonal("ENCARGADO_FINANCIAMIENTO");
    // Encargado "de respaldo" adicional: no debe recibir nada porque el
    // analista sí tiene un supervisor directo asignado.
    const { usuario: usuarioOtroEncargado } = await crearPersonal("ENCARGADO_FINANCIAMIENTO");

    await prisma.personal.update({
      where: { id: analista.id },
      data: { supervisorId: supervisor.id },
    });

    const solicitud = await crearSolicitud(cliente.id, programa.id, { estatus: "EN_ANALISIS" });
    await prisma.asignacionFinanciamiento.create({
      data: { solicitudId: solicitud.id, analistaId: analista.id, activa: true },
    });

    await desactivarUsuario(usuarioAnalista.id, admin.id);

    const asignacion = await prisma.asignacionFinanciamiento.findFirst({
      where: { solicitudId: solicitud.id },
    });
    expect(asignacion?.activa).toBe(false);

    const notifSupervisor = await prisma.notificacion.findFirst({
      where: { usuarioId: usuarioSupervisor.id, tipo: "REASIGNACION_REQUERIDA" },
    });
    expect(notifSupervisor).not.toBeNull();

    const notifOtro = await prisma.notificacion.findFirst({
      where: { usuarioId: usuarioOtroEncargado.id, tipo: "REASIGNACION_REQUERIDA" },
    });
    expect(notifOtro).toBeNull();
  });

  it("no crea notificación si el gestor dado de baja no tiene asignaciones activas", async () => {
    const { usuario: admin } = await crearPersonal("ADMIN");
    const { usuario: usuarioGestor } = await crearPersonal("GESTOR");
    await crearPersonal("ENCARGADO_PROMOCION");

    await desactivarUsuario(usuarioGestor.id, admin.id);

    const notificaciones = await prisma.notificacion.count({
      where: { tipo: "REASIGNACION_REQUERIDA" },
    });
    expect(notificaciones).toBe(0);
  });
});

describe("desbloqueo manual de cuenta", () => {
  it("desbloquearUsuario limpia intentosFallidos y bloqueadoHasta de una cuenta bloqueada", async () => {
    const { usuario } = await crearPersonal("GESTOR");
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        intentosFallidos: 5,
        bloqueadoHasta: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    await desbloquearUsuario(usuario.id);

    const actualizado = await prisma.usuario.findUniqueOrThrow({ where: { id: usuario.id } });
    expect(actualizado.intentosFallidos).toBe(0);
    expect(actualizado.bloqueadoHasta).toBeNull();
  });
});
