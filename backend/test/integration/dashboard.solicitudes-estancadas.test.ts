import { describe, it, expect } from "vitest";
import { prisma } from "./pglite-client";
import { crearCliente, crearGrupoConGestor, crearPersonal, crearPrograma, crearSolicitud } from "./factories";
import { notificarSolicitudesEstancadas } from "@modules/admin/dashboard/dashboard.service";
import { DIAS_ESTANCADA, MS_DIA } from "../../src/shared/sla-solicitudes";

/** Crea una solicitud EN_REVISION con gestor activo asignado. */
async function crearSolicitudConGestor(diasSinAvance: number) {
  const cliente = await crearCliente();
  const programa = await crearPrograma();
  const { usuario: usuarioGestor, personal: gestor } = await crearPersonal("GESTOR");
  const grupo = await crearGrupoConGestor(gestor.id);
  const solicitud = await crearSolicitud(cliente.id, programa.id, { estatus: "EN_REVISION" });
  await prisma.asignacionSolicitud.create({
    data: { solicitudId: solicitud.id, gestorId: gestor.id, grupoId: grupo.id, activa: true },
  });

  const fecha = new Date(Date.now() - diasSinAvance * MS_DIA);
  await prisma.solicitud.update({ where: { id: solicitud.id }, data: { actualizadoEn: fecha } });

  return { solicitud, usuarioGestor };
}

describe("barrido de solicitudes estancadas", () => {
  it("notifica al gestor dueño de una solicitud sin avance más allá del umbral", async () => {
    const { solicitud, usuarioGestor } = await crearSolicitudConGestor(DIAS_ESTANCADA + 1);

    await notificarSolicitudesEstancadas(new Date());

    const notificaciones = await prisma.notificacion.findMany({
      where: { tipo: "SOLICITUD_ESTANCADA" },
    });
    expect(notificaciones).toHaveLength(1);
    expect(notificaciones[0]).toMatchObject({
      usuarioId: usuarioGestor.id,
      solicitudId: solicitud.id,
    });
  });

  it("no duplica la notificación si el barrido corre dos veces seguidas", async () => {
    await crearSolicitudConGestor(DIAS_ESTANCADA + 1);

    await notificarSolicitudesEstancadas(new Date());
    await notificarSolicitudesEstancadas(new Date());

    const notificaciones = await prisma.notificacion.findMany({
      where: { tipo: "SOLICITUD_ESTANCADA" },
    });
    expect(notificaciones).toHaveLength(1);
  });

  it("no notifica una solicitud recién creada (dentro del umbral)", async () => {
    await crearSolicitudConGestor(1);

    await notificarSolicitudesEstancadas(new Date());

    const notificaciones = await prisma.notificacion.findMany({
      where: { tipo: "SOLICITUD_ESTANCADA" },
    });
    expect(notificaciones).toHaveLength(0);
  });
});
