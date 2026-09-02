/**
 * Factories mínimas para las pruebas de integración. Crean filas directamente
 * con Prisma (no vía servicios) para montar el escenario de cada test.
 */
import { randomUUID } from "node:crypto";
import { prisma } from "./pglite-client";

export async function crearPrograma(over: Record<string, unknown> = {}) {
  return prisma.programa.create({
    data: {
      nombre: "Programa de prueba",
      descripcion: "desc",
      objetivo: "obj",
      montoMinimo: 100_000,
      montoMaximo: 1_000_000,
      tasaOrdinaria: 18,
      tasaMoratoria: 36,
      tasaAnual: 18,
      plazoMinimoMeses: 6,
      plazoMaximoMeses: 36,
      ...over,
    },
  });
}

export async function crearCliente(over: Record<string, unknown> = {}) {
  return prisma.usuario.create({
    data: {
      correo: `cliente-${randomUUID()}@test.mx`,
      contrasena: "hash",
      tipoUsuario: "CLIENTE",
      tipoPersona: "FISICA",
      nombre: "Cli",
      apellidoPaterno: "Ente",
      apellidoMaterno: "Prueba",
      ...over,
    },
  });
}

/** Usuario PERSONAL + su fila Personal con el rol dado (GESTOR por defecto). */
export async function crearPersonal(rol: string = "GESTOR", over: Record<string, unknown> = {}) {
  const usuario = await prisma.usuario.create({
    data: {
      correo: `staff-${randomUUID()}@test.mx`,
      contrasena: "hash",
      tipoUsuario: "PERSONAL",
      tipoPersona: "FISICA",
      nombre: "Staff",
      apellidoPaterno: rol,
      apellidoMaterno: "Prueba",
      ...over,
    },
  });
  const personal = await prisma.personal.create({
    data: { userId: usuario.id, rol: rol as never },
  });
  return { usuario, personal };
}

/** Grupo activo con reglas opcionales y un gestor asignado. */
export async function crearGrupoConGestor(
  gestorId: string,
  opts: {
    prioridad?: number;
    reglas?: { campo: string; operador: string; valor: string }[];
  } = {},
) {
  const grupo = await prisma.grupoGestion.create({
    data: {
      nombre: `Grupo ${randomUUID()}`,
      prioridad: opts.prioridad ?? 0,
      reglas: opts.reglas
        ? { create: opts.reglas.map((r) => ({ campo: r.campo as never, operador: r.operador as never, valor: r.valor })) }
        : undefined,
      gestores: { create: { gestorId } },
    },
  });
  return grupo;
}

export async function crearSolicitud(
  solicitanteId: string,
  programaId: string,
  over: Record<string, unknown> = {},
) {
  const folio = randomUUID().slice(0, 8);
  return prisma.solicitud.create({
    data: { folio, solicitanteId, programaId, estatus: "PENDIENTE", tipoPersona: "FISICA", ...over },
  });
}
