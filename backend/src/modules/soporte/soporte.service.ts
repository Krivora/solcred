import prisma from "@config/db";
import { AppError } from "@middlewares/error.middleware";
import { RolAplicacion } from "@utils/jwt";
import {
  Prisma,
  TicketEstatus,
  TicketPrioridad,
  TicketTipoEvento,
} from "../../../generated/prisma/client";
import { generarFolioTicket } from "./helper/generar-folio";
import {
  dentroVentanaReapertura,
  esFinal,
  TRANSICIONES_AGENTE,
} from "./soporte.estado";
import { calcularLimites, ticketEnRiesgoOVencido } from "./soporte.sla";
import {
  AdjuntoGuardado,
  rutaAbsolutaAdjunto,
} from "./soporte.archivos";
import {
  ActualizarSlaPoliticaDto,
  AsignarTicketDto,
  CalificarTicketDto,
  CambiarCategoriaDto,
  CambiarEstatusDto,
  CambiarPrioridadDto,
  ComentarTicketDto,
  CrearTicketDto,
  listarMisTicketsQuerySchema,
  listarTicketsQuerySchema,
  metricasQuerySchema,
} from "./soporte.schema";
import { paginado } from "@utils/pagination";

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXTO Y PERMISOS
// ─────────────────────────────────────────────────────────────────────────────

export interface Actor {
  id: string; // Usuario.id
  rol: RolAplicacion;
  personalId?: string; // Personal.id — presente para staff
}

/** Agente = quien puede resolver tickets. ADMIN y SOPORTE. */
const esAgente = (rol: RolAplicacion): boolean => rol === "ADMIN" || rol === "SOPORTE";
const esStaff = (rol: RolAplicacion): boolean => esAgente(rol) || rol === "SUPERVISOR";

/** ¿Puede ver el ticket? Dueño o staff (agentes/SUPERVISOR). */
const puedeVer = (solicitanteId: string, actor: Actor): boolean =>
  solicitanteId === actor.id || esStaff(actor.rol);

/**
 * ¿Puede ejecutar una acción de "solicitante" (comentar, cerrar, reabrir)?
 * El dueño siempre; un agente también (actúa en nombre del ticket). SUPERVISOR
 * NO, salvo que sea su propio ticket — es solo lectura sobre tickets de terceros.
 */
const puedeActuar = (solicitanteId: string, actor: Actor): boolean =>
  solicitanteId === actor.id || esAgente(actor.rol);

// ─────────────────────────────────────────────────────────────────────────────
// SELECTS
// ─────────────────────────────────────────────────────────────────────────────

const CAMPOS_SLA = {
  slaArrancadoEn: true,
  slaRespuestaLimite: true,
  slaResolucionLimite: true,
  primeraRespuestaEn: true,
  slaRespuestaCumplida: true,
  slaResolucionCumplida: true,
  resueltoEn: true,
} satisfies Prisma.TicketSelect;

const SELECT_LISTA = {
  id: true,
  folio: true,
  titulo: true,
  categoria: true,
  prioridad: true,
  estatus: true,
  reabierto: true,
  creadoEn: true,
  actualizadoEn: true,
  ...CAMPOS_SLA,
  agente: { select: { usuario: { select: { nombre: true, apellidoPaterno: true } } } },
  _count: { select: { comentarios: true, adjuntos: true } },
} satisfies Prisma.TicketSelect;

const SELECT_STAFF_LISTA = {
  ...SELECT_LISTA,
  solicitante: { select: { id: true, nombre: true, apellidoPaterno: true } },
  agenteId: true,
} satisfies Prisma.TicketSelect;

const SELECT_COMENTARIO = {
  id: true,
  cuerpo: true,
  esNotaInterna: true,
  autorTipo: true,
  creadoEn: true,
  editadoEn: true,
  autor: { select: { id: true, nombre: true, apellidoPaterno: true } },
  adjuntos: {
    select: { id: true, nombreOriginal: true, tipoMime: true, tamanoBytes: true },
  },
} satisfies Prisma.TicketComentarioSelect;

const SELECT_DETALLE = {
  id: true,
  folio: true,
  titulo: true,
  descripcion: true,
  categoria: true,
  prioridad: true,
  estatus: true,
  slaArrancadoEn: true,
  slaRespuestaLimite: true,
  slaResolucionLimite: true,
  primeraRespuestaEn: true,
  slaRespuestaCumplida: true,
  slaResolucionCumplida: true,
  pausadoSegundos: true,
  pausadoDesde: true,
  resueltoEn: true,
  cerradoEn: true,
  reabierto: true,
  calificacion: true,
  calificacionComentario: true,
  creadoEn: true,
  actualizadoEn: true,
  solicitanteId: true,
  solicitante: {
    select: {
      id: true,
      nombre: true,
      apellidoPaterno: true,
      apellidoMaterno: true,
      correo: true,
    },
  },
  agente: {
    select: { id: true, usuario: { select: { nombre: true, apellidoPaterno: true } } },
  },
  comentarios: { orderBy: { creadoEn: "asc" }, take: 200, select: SELECT_COMENTARIO },
  adjuntos: {
    where: { comentarioId: null },
    select: {
      id: true,
      nombreOriginal: true,
      tipoMime: true,
      tamanoBytes: true,
      subidoEn: true,
    },
  },
  eventos: {
    orderBy: { creadoEn: "asc" },
    select: {
      id: true,
      tipo: true,
      descripcion: true,
      valorAnterior: true,
      valorNuevo: true,
      creadoEn: true,
      actor: { select: { id: true, nombre: true, apellidoPaterno: true } },
    },
  },
} satisfies Prisma.TicketSelect;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

type Tx = Prisma.TransactionClient;

const emitirEvento = (
  tx: Tx,
  datos: {
    ticketId: string;
    tipo: TicketTipoEvento;
    actorId: string | null;
    descripcion: string;
    valorAnterior?: string | null;
    valorNuevo?: string | null;
  }
) =>
  tx.ticketEvento.create({
    data: {
      ticketId: datos.ticketId,
      tipo: datos.tipo,
      actorId: datos.actorId,
      descripcion: datos.descripcion,
      valorAnterior: datos.valorAnterior ?? null,
      valorNuevo: datos.valorNuevo ?? null,
    },
  });

const crearAdjuntos = (
  tx: Tx,
  ticketId: string,
  subidoPorId: string,
  archivos: AdjuntoGuardado[],
  comentarioId: string | null
) =>
  tx.ticketAdjunto.createMany({
    data: archivos.map((a) => ({
      ticketId,
      comentarioId,
      subidoPorId,
      urlArchivo: a.urlArchivo,
      nombreArchivo: a.nombreArchivo,
      nombreOriginal: a.nombreOriginal,
      tipoMime: a.tipoMime,
      tamanoBytes: a.tamanoBytes,
    })),
  });

/** Quita las notas internas del payload para quien no es staff. */
const filtrarInterno = <T extends { esNotaInterna: boolean }>(
  comentarios: T[],
  actor: Actor
): T[] => (esStaff(actor.rol) ? comentarios : comentarios.filter((c) => !c.esNotaInterna));

const filtrarEventosInternos = <T extends { tipo: TicketTipoEvento }>(
  eventos: T[],
  actor: Actor
): T[] =>
  esStaff(actor.rol) ? eventos : eventos.filter((e) => e.tipo !== "NOTA_INTERNA");

// ─────────────────────────────────────────────────────────────────────────────
// CREAR
// ─────────────────────────────────────────────────────────────────────────────

export const crearTicket = async (
  actor: Actor,
  ticketId: string,
  dto: CrearTicketDto,
  adjuntos: AdjuntoGuardado[]
) => {
  const folio = await generarFolioTicket();

  const ticket = await prisma.$transaction(async (tx) => {
    const creado = await tx.ticket.create({
      data: {
        id: ticketId,
        folio,
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        categoria: dto.categoria,
        // El solicitante solo sugiere; el SLA arranca cuando un ADMIN asigna (Fase 2).
        prioridad: dto.prioridadSugerida ?? "MEDIA",
        estatus: "NUEVO",
        solicitanteId: actor.id,
      },
      select: { id: true, folio: true },
    });

    if (adjuntos.length > 0) {
      await crearAdjuntos(tx, creado.id, actor.id, adjuntos, null);
    }

    await emitirEvento(tx, {
      ticketId: creado.id,
      tipo: "CREADO",
      actorId: actor.id,
      descripcion: "Ticket creado",
    });

    if (adjuntos.length > 0) {
      await emitirEvento(tx, {
        ticketId: creado.id,
        tipo: "ADJUNTO",
        actorId: actor.id,
        descripcion: `${adjuntos.length} archivo(s) adjuntado(s) al crear`,
      });
    }

    return creado;
  });

  return obtenerTicket(actor, ticket.id);
};

// ─────────────────────────────────────────────────────────────────────────────
// LISTAR (mis tickets)
// ─────────────────────────────────────────────────────────────────────────────

export const listarMisTickets = async (actor: Actor, rawQuery: unknown) => {
  const query = listarMisTicketsQuerySchema.parse(rawQuery ?? {});
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;

  const where: Prisma.TicketWhereInput = { solicitanteId: actor.id };
  if (query.estatus) where.estatus = query.estatus;
  if (query.categoria) where.categoria = query.categoria;
  if (query.q) {
    where.OR = [
      { titulo: { contains: query.q, mode: "insensitive" } },
      { folio: { contains: query.q, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      select: SELECT_LISTA,
      orderBy: { actualizadoEn: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.ticket.count({ where }),
  ]);

  return paginado(data.map(conEstadoSla), page, pageSize, total);
};

/** Añade el estado de SLA derivado (chips) a una fila de listado. */
const conEstadoSla = <T extends Parameters<typeof ticketEnRiesgoOVencido>[0]>(t: T) => ({
  ...t,
  sla: ticketEnRiesgoOVencido(t),
});

// ─────────────────────────────────────────────────────────────────────────────
// DETALLE
// ─────────────────────────────────────────────────────────────────────────────

export const obtenerTicket = async (actor: Actor, ticketId: string) => {
  // Detección perezosa de SLA vencido (sin job programado).
  await persistirVencimientosSla(ticketId);

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: SELECT_DETALLE,
  });

  if (!ticket || !puedeVer(ticket.solicitanteId, actor)) {
    throw new AppError("Ticket no encontrado", 404);
  }

  const { solicitanteId: _omit, comentarios, eventos, ...resto } = ticket;

  return {
    ...resto,
    esSolicitante: ticket.solicitanteId === actor.id,
    sla: ticketEnRiesgoOVencido(ticket),
    comentarios: filtrarInterno(comentarios, actor),
    eventos: filtrarEventosInternos(eventos, actor),
  };
};

/**
 * Si algún reloj de SLA ya venció y todavía no se registró, lo marca incumplido
 * y emite el evento `SLA_INCUMPLIDO` una sola vez. Idempotente y barato.
 */
const persistirVencimientosSla = async (ticketId: string): Promise<void> => {
  const t = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: {
      estatus: true,
      slaRespuestaLimite: true,
      slaResolucionLimite: true,
      primeraRespuestaEn: true,
      slaRespuestaCumplida: true,
      slaResolucionCumplida: true,
    },
  });
  if (!t) return;

  const ahora = Date.now();
  const finales: string[] = ["RESUELTO", "CERRADO", "CANCELADO"];

  const respuestaVencida =
    !!t.slaRespuestaLimite &&
    t.slaRespuestaCumplida === null &&
    t.primeraRespuestaEn === null &&
    ahora > t.slaRespuestaLimite.getTime();

  const resolucionVencida =
    !!t.slaResolucionLimite &&
    t.slaResolucionCumplida === null &&
    !finales.includes(t.estatus) &&
    ahora > t.slaResolucionLimite.getTime();

  if (!respuestaVencida && !resolucionVencida) return;

  await prisma.$transaction(async (tx) => {
    const data: Prisma.TicketUpdateInput = {};
    if (respuestaVencida) {
      data.slaRespuestaCumplida = false;
      await emitirEvento(tx, {
        ticketId,
        tipo: "SLA_INCUMPLIDO",
        actorId: null,
        descripcion: "SLA de primera respuesta incumplido",
      });
    }
    if (resolucionVencida) {
      data.slaResolucionCumplida = false;
      await emitirEvento(tx, {
        ticketId,
        tipo: "SLA_INCUMPLIDO",
        actorId: null,
        descripcion: "SLA de resolución incumplido",
      });
    }
    await tx.ticket.update({ where: { id: ticketId }, data });
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// COMENTAR
// ─────────────────────────────────────────────────────────────────────────────

export const comentarTicket = async (
  actor: Actor,
  ticketId: string,
  dto: ComentarTicketDto,
  adjuntos: AdjuntoGuardado[]
) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: {
      id: true,
      solicitanteId: true,
      estatus: true,
      primeraRespuestaEn: true,
      pausadoDesde: true,
      pausadoSegundos: true,
      slaRespuestaLimite: true,
    },
  });

  if (!ticket || !puedeVer(ticket.solicitanteId, actor)) {
    throw new AppError("Ticket no encontrado", 404);
  }
  if (!puedeActuar(ticket.solicitanteId, actor)) {
    throw new AppError("No puedes comentar en tickets de otras personas", 403);
  }
  if (esFinal(ticket.estatus)) {
    throw new AppError("El ticket está cerrado. Reábrelo para poder comentar.", 409);
  }

  const esDueno = ticket.solicitanteId === actor.id;
  const staff = esStaff(actor.rol);
  const autorTipo = esDueno ? "SOLICITANTE" : "AGENTE";
  const esNotaInterna = staff ? dto.esNotaInterna : false;

  // El solicitante responde un ticket que estaba esperando su respuesta → reanuda.
  let nuevoEstatus: TicketEstatus | null = null;
  let pausadoSegundos = ticket.pausadoSegundos;
  let pausadoDesde = ticket.pausadoDesde;
  if (esDueno && ticket.estatus === "ESPERANDO_CLIENTE" && !esNotaInterna) {
    nuevoEstatus = "EN_PROGRESO";
    if (pausadoDesde) {
      pausadoSegundos += Math.floor((Date.now() - pausadoDesde.getTime()) / 1000);
      pausadoDesde = null;
    }
  }

  // Primera respuesta pública de un agente → evalúa el SLA de respuesta.
  const marcaPrimeraRespuesta =
    autorTipo === "AGENTE" && !esNotaInterna && ticket.primeraRespuestaEn === null;

  const ahora = new Date();

  const comentario = await prisma.$transaction(async (tx) => {
    const nuevo = await tx.ticketComentario.create({
      data: {
        ticketId,
        autorId: actor.id,
        autorTipo,
        cuerpo: dto.cuerpo,
        esNotaInterna,
      },
      select: SELECT_COMENTARIO,
    });

    if (adjuntos.length > 0) {
      await crearAdjuntos(tx, ticketId, actor.id, adjuntos, nuevo.id);
    }

    const dataTicket: Prisma.TicketUpdateInput = {};
    if (nuevoEstatus) {
      dataTicket.estatus = nuevoEstatus;
      dataTicket.pausadoSegundos = pausadoSegundos;
      dataTicket.pausadoDesde = pausadoDesde;
    }
    if (marcaPrimeraRespuesta) {
      dataTicket.primeraRespuestaEn = ahora;
      if (ticket.slaRespuestaLimite) {
        dataTicket.slaRespuestaCumplida = ahora <= ticket.slaRespuestaLimite;
      }
    }
    if (Object.keys(dataTicket).length > 0) {
      await tx.ticket.update({ where: { id: ticketId }, data: dataTicket });
    }

    await emitirEvento(tx, {
      ticketId,
      tipo: esNotaInterna ? "NOTA_INTERNA" : "COMENTARIO",
      actorId: actor.id,
      descripcion: esNotaInterna ? "Nota interna" : "Comentario",
    });

    if (adjuntos.length > 0) {
      await emitirEvento(tx, {
        ticketId,
        tipo: "ADJUNTO",
        actorId: actor.id,
        descripcion: `${adjuntos.length} archivo(s) adjuntado(s)`,
      });
    }

    if (nuevoEstatus) {
      await emitirEvento(tx, {
        ticketId,
        tipo: "CAMBIO_ESTATUS",
        actorId: actor.id,
        descripcion: "El solicitante respondió",
        valorAnterior: "ESPERANDO_CLIENTE",
        valorNuevo: nuevoEstatus,
      });
    }

    return nuevo;
  });

  return comentario;
};

// ─────────────────────────────────────────────────────────────────────────────
// CERRAR
// ─────────────────────────────────────────────────────────────────────────────

export const cerrarTicket = async (actor: Actor, ticketId: string) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { id: true, solicitanteId: true, estatus: true },
  });

  if (!ticket || !puedeVer(ticket.solicitanteId, actor)) {
    throw new AppError("Ticket no encontrado", 404);
  }
  if (!puedeActuar(ticket.solicitanteId, actor)) {
    throw new AppError("No puedes cerrar tickets de otras personas", 403);
  }
  if (ticket.estatus !== "RESUELTO") {
    throw new AppError("Solo puedes cerrar un ticket que ya está resuelto", 409);
  }

  await prisma.$transaction(async (tx) => {
    await tx.ticket.update({
      where: { id: ticketId },
      data: { estatus: "CERRADO", cerradoEn: new Date() },
    });
    await emitirEvento(tx, {
      ticketId,
      tipo: "CERRADO",
      actorId: actor.id,
      descripcion: "Ticket cerrado",
      valorAnterior: "RESUELTO",
      valorNuevo: "CERRADO",
    });
  });

  return obtenerTicket(actor, ticketId);
};

// ─────────────────────────────────────────────────────────────────────────────
// REABRIR
// ─────────────────────────────────────────────────────────────────────────────

export const reabrirTicket = async (
  actor: Actor,
  ticketId: string,
  motivo: string
) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { id: true, solicitanteId: true, estatus: true, resueltoEn: true },
  });

  if (!ticket || !puedeVer(ticket.solicitanteId, actor)) {
    throw new AppError("Ticket no encontrado", 404);
  }
  if (!puedeActuar(ticket.solicitanteId, actor)) {
    throw new AppError("No puedes reabrir tickets de otras personas", 403);
  }
  if (ticket.estatus === "CERRADO") {
    throw new AppError(
      "Un ticket cerrado no se reabre. Crea uno nuevo que haga referencia a este.",
      409
    );
  }
  if (ticket.estatus !== "RESUELTO") {
    throw new AppError("Solo puedes reabrir un ticket que está resuelto", 409);
  }
  // Un agente puede reabrir un RESUELTO en cualquier momento; el solicitante solo dentro de la ventana.
  if (!esAgente(actor.rol) && !dentroVentanaReapertura(ticket.resueltoEn)) {
    throw new AppError(
      "La ventana para reabrir (7 días) ya pasó. Crea un ticket nuevo.",
      409
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.ticket.update({
      where: { id: ticketId },
      data: {
        estatus: "EN_PROGRESO",
        reabierto: true,
        resueltoEn: null,
        slaResolucionCumplida: null,
      },
    });
    await emitirEvento(tx, {
      ticketId,
      tipo: "REABIERTO",
      actorId: actor.id,
      descripcion: `Ticket reabierto: ${motivo}`,
      valorAnterior: "RESUELTO",
      valorNuevo: "EN_PROGRESO",
    });
  });

  return obtenerTicket(actor, ticketId);
};

// ─────────────────────────────────────────────────────────────────────────────
// CALIFICAR (CSAT)
// ─────────────────────────────────────────────────────────────────────────────

export const calificarTicket = async (
  actor: Actor,
  ticketId: string,
  dto: CalificarTicketDto
) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { id: true, solicitanteId: true, estatus: true, calificacion: true },
  });

  if (!ticket || ticket.solicitanteId !== actor.id) {
    throw new AppError("Ticket no encontrado", 404);
  }
  if (ticket.estatus !== "CERRADO") {
    throw new AppError("Solo puedes calificar un ticket cerrado", 409);
  }
  if (ticket.calificacion !== null) {
    throw new AppError("Ya calificaste este ticket", 409);
  }

  await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      calificacion: dto.calificacion,
      calificacionComentario: dto.comentario ?? null,
    },
  });

  return obtenerTicket(actor, ticketId);
};

// ─────────────────────────────────────────────────────────────────────────────
// DESCARGA DE ADJUNTO
// ─────────────────────────────────────────────────────────────────────────────

export const obtenerAdjuntoParaDescarga = async (
  actor: Actor,
  ticketId: string,
  adjuntoId: string
) => {
  const adjunto = await prisma.ticketAdjunto.findFirst({
    where: { id: adjuntoId, ticketId },
    select: {
      urlArchivo: true,
      nombreOriginal: true,
      tipoMime: true,
      ticket: { select: { solicitanteId: true } },
    },
  });

  if (!adjunto || !puedeVer(adjunto.ticket.solicitanteId, actor)) {
    throw new AppError("Adjunto no encontrado", 404);
  }

  return {
    rutaAbsoluta: rutaAbsolutaAdjunto(adjunto.urlArchivo),
    nombreOriginal: adjunto.nombreOriginal,
    tipoMime: adjunto.tipoMime,
  };
};

// ═════════════════════════════════════════════════════════════════════════════
// STAFF (Fase 2) — solo ADMIN escribe; SUPERVISOR puede leer los listados.
// ═════════════════════════════════════════════════════════════════════════════

const exigirStaff = (actor: Actor) => {
  if (!esStaff(actor.rol)) throw new AppError("No tienes permisos para esta acción", 403);
};

const cargarTicketStaff = async (ticketId: string) => {
  const t = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: {
      id: true,
      folio: true,
      estatus: true,
      prioridad: true,
      categoria: true,
      agenteId: true,
      slaArrancadoEn: true,
      pausadoSegundos: true,
      pausadoDesde: true,
      primeraRespuestaEn: true,
      slaResolucionLimite: true,
      resueltoEn: true,
    },
  });
  if (!t) throw new AppError("Ticket no encontrado", 404);
  return t;
};

// ── Listado de todos los tickets ───────────────────────────────────────────

export const listarTickets = async (actor: Actor, rawQuery: unknown) => {
  exigirStaff(actor);
  const q = listarTicketsQuerySchema.parse(rawQuery ?? {});
  const page = q.page ?? 1;
  const pageSize = q.pageSize ?? 20;

  const where: Prisma.TicketWhereInput = {};
  if (q.estatus) where.estatus = q.estatus;
  if (q.prioridad) where.prioridad = q.prioridad;
  if (q.categoria) where.categoria = q.categoria;
  if (q.agenteId) where.agenteId = q.agenteId;
  if (q.solicitanteId) where.solicitanteId = q.solicitanteId;
  if (q.sinAsignar) where.agenteId = null;
  if (q.desde || q.hasta) {
    where.creadoEn = {};
    if (q.desde) where.creadoEn.gte = new Date(q.desde);
    if (q.hasta) where.creadoEn.lte = new Date(q.hasta);
  }
  if (q.q) {
    where.OR = [
      { titulo: { contains: q.q, mode: "insensitive" } },
      { folio: { contains: q.q, mode: "insensitive" } },
      { solicitante: { correo: { contains: q.q, mode: "insensitive" } } },
    ];
  }

  const [filas, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      select: SELECT_STAFF_LISTA,
      orderBy: { actualizadoEn: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.ticket.count({ where }),
  ]);

  let data = filas.map(conEstadoSla);

  // El filtro de SLA se aplica sobre el estado derivado (no es columna).
  if (q.sla === "vencido") {
    data = data.filter((t) => t.sla.respuesta === "vencido" || t.sla.resolucion === "vencido");
  } else if (q.sla === "en_riesgo") {
    data = data.filter((t) => t.sla.alerta);
  } else if (q.sla === "ok") {
    data = data.filter((t) => !t.sla.alerta);
  }

  return paginado(data, page, pageSize, q.sla ? data.length : total);
};

// ── Métricas de la cola ────────────────────────────────────────────────────

export const obtenerStats = async (actor: Actor) => {
  exigirStaff(actor);

  const [porEstatus, porPrioridad, sinAsignar, abiertos] = await Promise.all([
    prisma.ticket.groupBy({ by: ["estatus"], _count: true }),
    prisma.ticket.groupBy({
      by: ["prioridad"],
      _count: true,
      where: { estatus: { notIn: ["CERRADO", "CANCELADO"] } },
    }),
    prisma.ticket.count({
      where: { agenteId: null, estatus: { notIn: ["CERRADO", "CANCELADO"] } },
    }),
    prisma.ticket.count({ where: { estatus: { notIn: ["CERRADO", "CANCELADO"] } } }),
  ]);

  // SLA en riesgo / vencido: se evalúa en memoria sobre los tickets abiertos.
  const abiertosSla = await prisma.ticket.findMany({
    where: { estatus: { notIn: ["CERRADO", "CANCELADO"] }, slaArrancadoEn: { not: null } },
    select: {
      slaArrancadoEn: true,
      slaRespuestaLimite: true,
      slaResolucionLimite: true,
      primeraRespuestaEn: true,
      slaRespuestaCumplida: true,
      slaResolucionCumplida: true,
      resueltoEn: true,
    },
  });
  let enRiesgo = 0;
  let vencido = 0;
  for (const t of abiertosSla) {
    const s = ticketEnRiesgoOVencido(t);
    if (s.respuesta === "vencido" || s.resolucion === "vencido") vencido++;
    else if (s.alerta) enRiesgo++;
  }

  return {
    porEstatus: Object.fromEntries(porEstatus.map((r) => [r.estatus, r._count])),
    porPrioridad: Object.fromEntries(porPrioridad.map((r) => [r.prioridad, r._count])),
    sinAsignar,
    abiertos,
    slaEnRiesgo: enRiesgo,
    slaVencido: vencido,
  };
};

// ── Métricas históricas (tendencia de la cola) ─────────────────────────────

const MS_DIA = 24 * 60 * 60 * 1000;
const RANGO_DIAS: Record<"7d" | "30d" | "90d", number> = { "7d": 7, "30d": 30, "90d": 90 };
const claveDia = (d: Date): string => d.toISOString().slice(0, 10);

/**
 * Serie diaria de creados/resueltos/SLA incumplidos, a partir de `TicketEvento`
 * (misma idea que el panorama ejecutivo: trae las filas del rango y las agrupa
 * en memoria por día — aprovecha el índice `[tipo, creadoEn]`).
 */
export const obtenerMetricas = async (actor: Actor, rawQuery: unknown) => {
  exigirStaff(actor);
  const { rango } = metricasQuerySchema.parse(rawQuery ?? {});
  const dias = RANGO_DIAS[rango ?? "30d"];

  const hasta = new Date();
  const desde = new Date(hasta.getTime() - (dias - 1) * MS_DIA);
  desde.setHours(0, 0, 0, 0);

  const eventos = await prisma.ticketEvento.findMany({
    where: {
      creadoEn: { gte: desde, lte: hasta },
      tipo: { in: ["CREADO", "CAMBIO_ESTATUS", "SLA_INCUMPLIDO"] },
    },
    select: { tipo: true, valorNuevo: true, creadoEn: true },
  });

  const serie = new Map<string, { fecha: string; creados: number; resueltos: number; slaIncumplidos: number }>();
  for (let i = 0; i < dias; i++) {
    const fecha = claveDia(new Date(desde.getTime() + i * MS_DIA));
    serie.set(fecha, { fecha, creados: 0, resueltos: 0, slaIncumplidos: 0 });
  }

  for (const e of eventos) {
    const fila = serie.get(claveDia(e.creadoEn));
    if (!fila) continue;
    if (e.tipo === "CREADO") fila.creados++;
    else if (e.tipo === "CAMBIO_ESTATUS" && e.valorNuevo === "RESUELTO") fila.resueltos++;
    else if (e.tipo === "SLA_INCUMPLIDO") fila.slaIncumplidos++;
  }

  return {
    rango: rango ?? "30d",
    desde,
    hasta,
    serie: Array.from(serie.values()),
    cargaPorAgente: await listarAgentes(actor),
  };
};

// ── Agentes disponibles (ADMIN/SOPORTE) + su carga ─────────────────────────

export const listarAgentes = async (actor: Actor) => {
  exigirStaff(actor);

  const agentes = await prisma.personal.findMany({
    where: { rol: { in: ["ADMIN", "SOPORTE"] }, activo: true },
    select: {
      id: true,
      usuario: { select: { nombre: true, apellidoPaterno: true, correo: true } },
      _count: {
        select: {
          ticketsAsignados: { where: { estatus: { notIn: ["CERRADO", "CANCELADO"] } } },
        },
      },
    },
    orderBy: { usuario: { nombre: "asc" } },
  });

  return agentes.map((a) => ({
    id: a.id,
    nombre: `${a.usuario.nombre} ${a.usuario.apellidoPaterno}`,
    correo: a.usuario.correo,
    ticketsAbiertos: a._count.ticketsAsignados,
  }));
};

// ── Asignar / reasignar ────────────────────────────────────────────────────

export const asignarTicket = async (
  actor: Actor,
  ticketId: string,
  dto: AsignarTicketDto
) => {
  exigirStaff(actor);
  const ticket = await cargarTicketStaff(ticketId);
  if (esFinal(ticket.estatus)) {
    throw new AppError("El ticket ya está cerrado", 409);
  }

  const agente = await prisma.personal.findFirst({
    where: { id: dto.agenteId, rol: { in: ["ADMIN", "SOPORTE"] }, activo: true },
    select: { id: true, usuario: { select: { nombre: true, apellidoPaterno: true } } },
  });
  if (!agente) {
    throw new AppError("El agente debe ser un administrador o miembro de soporte activo", 400);
  }

  const nombreAgente = `${agente.usuario.nombre} ${agente.usuario.apellidoPaterno}`;
  const primeraAsignacion = ticket.slaArrancadoEn === null;
  const prioridad = dto.prioridad ?? ticket.prioridad;
  const ahora = new Date();

  const data: Prisma.TicketUpdateInput = {
    agente: { connect: { id: agente.id } },
    asignadoPor: actor.personalId ? { connect: { id: actor.personalId } } : undefined,
  };

  if (dto.prioridad && dto.prioridad !== ticket.prioridad) {
    data.prioridad = dto.prioridad;
  }

  if (primeraAsignacion) {
    // Arranca el reloj de SLA con la prioridad confirmada.
    data.estatus = "ASIGNADO";
    data.slaArrancadoEn = ahora;
    const limites = await calcularLimites(prioridad, ahora, 0);
    data.slaRespuestaLimite = limites.slaRespuestaLimite;
    data.slaResolucionLimite = limites.slaResolucionLimite;
  }

  await prisma.$transaction(async (tx) => {
    await tx.ticket.update({ where: { id: ticketId }, data });
    await emitirEvento(tx, {
      ticketId,
      tipo: primeraAsignacion ? "ASIGNADO" : "REASIGNADO",
      actorId: actor.id,
      descripcion: primeraAsignacion
        ? `Asignado a ${nombreAgente}`
        : `Reasignado a ${nombreAgente}`,
      valorAnterior: ticket.agenteId,
      valorNuevo: agente.id,
    });
    if (dto.prioridad && dto.prioridad !== ticket.prioridad) {
      await emitirEvento(tx, {
        ticketId,
        tipo: "CAMBIO_PRIORIDAD",
        actorId: actor.id,
        descripcion: `Prioridad ajustada al asignar`,
        valorAnterior: ticket.prioridad,
        valorNuevo: dto.prioridad,
      });
    }
  });

  return obtenerTicket(actor, ticketId);
};

// ── Cambiar prioridad ──────────────────────────────────────────────────────

export const cambiarPrioridad = async (
  actor: Actor,
  ticketId: string,
  dto: CambiarPrioridadDto
) => {
  exigirStaff(actor);
  const ticket = await cargarTicketStaff(ticketId);
  if (esFinal(ticket.estatus)) throw new AppError("El ticket ya está cerrado", 409);
  if (ticket.prioridad === dto.prioridad) {
    throw new AppError(`El ticket ya tiene prioridad ${dto.prioridad}`, 409);
  }

  const data: Prisma.TicketUpdateInput = { prioridad: dto.prioridad };

  // Recalcula los límites desde la base, si el SLA ya arrancó.
  if (ticket.slaArrancadoEn) {
    const limites = await calcularLimites(
      dto.prioridad,
      ticket.slaArrancadoEn,
      ticket.pausadoSegundos
    );
    if (!ticket.primeraRespuestaEn) data.slaRespuestaLimite = limites.slaRespuestaLimite;
    if (!ticket.resueltoEn) data.slaResolucionLimite = limites.slaResolucionLimite;
  }

  await prisma.$transaction(async (tx) => {
    await tx.ticket.update({ where: { id: ticketId }, data });
    await emitirEvento(tx, {
      ticketId,
      tipo: "CAMBIO_PRIORIDAD",
      actorId: actor.id,
      descripcion: `Prioridad: ${ticket.prioridad} → ${dto.prioridad}`,
      valorAnterior: ticket.prioridad,
      valorNuevo: dto.prioridad,
    });
  });

  return obtenerTicket(actor, ticketId);
};

// ── Cambiar categoría ──────────────────────────────────────────────────────

export const cambiarCategoria = async (
  actor: Actor,
  ticketId: string,
  dto: CambiarCategoriaDto
) => {
  exigirStaff(actor);
  const ticket = await cargarTicketStaff(ticketId);
  if (ticket.categoria === dto.categoria) {
    throw new AppError("El ticket ya tiene esa categoría", 409);
  }

  await prisma.$transaction(async (tx) => {
    await tx.ticket.update({
      where: { id: ticketId },
      data: { categoria: dto.categoria },
    });
    await emitirEvento(tx, {
      ticketId,
      tipo: "CAMBIO_CATEGORIA",
      actorId: actor.id,
      descripcion: `Categoría: ${ticket.categoria} → ${dto.categoria}`,
      valorAnterior: ticket.categoria,
      valorNuevo: dto.categoria,
    });
  });

  return obtenerTicket(actor, ticketId);
};

// ── Cambiar estatus (agente) ───────────────────────────────────────────────

export const cambiarEstatus = async (
  actor: Actor,
  ticketId: string,
  dto: CambiarEstatusDto
) => {
  if (!esAgente(actor.rol)) {
    throw new AppError("Solo un agente puede mover el estatus del ticket", 403);
  }
  const ticket = await cargarTicketStaff(ticketId);

  const permitidos = TRANSICIONES_AGENTE[ticket.estatus];
  if (!permitidos.includes(dto.estatus)) {
    throw new AppError(
      `No se puede pasar de ${ticket.estatus} a ${dto.estatus}`,
      409
    );
  }

  const ahora = new Date();
  const data: Prisma.TicketUpdateInput = { estatus: dto.estatus };
  let pausadoSegundos = ticket.pausadoSegundos;

  // Salir de ESPERANDO_CLIENTE → cerrar la pausa y acumular.
  if (ticket.estatus === "ESPERANDO_CLIENTE" && ticket.pausadoDesde) {
    pausadoSegundos += Math.floor((ahora.getTime() - ticket.pausadoDesde.getTime()) / 1000);
    data.pausadoSegundos = pausadoSegundos;
    data.pausadoDesde = null;
    // El reloj de resolución se desplaza por lo que estuvo pausado.
    if (ticket.slaArrancadoEn && !ticket.resueltoEn) {
      const limites = await calcularLimites(ticket.prioridad, ticket.slaArrancadoEn, pausadoSegundos);
      data.slaResolucionLimite = limites.slaResolucionLimite;
    }
  }

  // Entrar a ESPERANDO_CLIENTE → arrancar la pausa.
  if (dto.estatus === "ESPERANDO_CLIENTE") {
    data.pausadoDesde = ahora;
  }

  // Resolver → sella el hito y evalúa el SLA de resolución.
  if (dto.estatus === "RESUELTO") {
    data.resueltoEn = ahora;
    if (ticket.slaResolucionLimite) {
      data.slaResolucionCumplida = ahora <= ticket.slaResolucionLimite;
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.ticket.update({ where: { id: ticketId }, data });
    await emitirEvento(tx, {
      ticketId,
      tipo: "CAMBIO_ESTATUS",
      actorId: actor.id,
      descripcion: dto.motivo
        ? `${ticket.estatus} → ${dto.estatus}: ${dto.motivo}`
        : `${ticket.estatus} → ${dto.estatus}`,
      valorAnterior: ticket.estatus,
      valorNuevo: dto.estatus,
    });
  });

  return obtenerTicket(actor, ticketId);
};

// ── Cancelar ───────────────────────────────────────────────────────────────

export const cancelarTicket = async (
  actor: Actor,
  ticketId: string,
  motivo: string
) => {
  if (!esAgente(actor.rol)) {
    throw new AppError("Solo un agente puede cancelar un ticket", 403);
  }
  const ticket = await cargarTicketStaff(ticketId);
  if (esFinal(ticket.estatus)) {
    throw new AppError("El ticket ya está en un estado final", 409);
  }

  await prisma.$transaction(async (tx) => {
    await tx.ticket.update({
      where: { id: ticketId },
      data: { estatus: "CANCELADO", cerradoEn: new Date() },
    });
    await emitirEvento(tx, {
      ticketId,
      tipo: "CANCELADO",
      actorId: actor.id,
      descripcion: `Ticket cancelado: ${motivo}`,
      valorAnterior: ticket.estatus,
      valorNuevo: "CANCELADO",
    });
  });

  return obtenerTicket(actor, ticketId);
};

// ── Políticas de SLA ───────────────────────────────────────────────────────

export const listarSlaPoliticas = async (actor: Actor) => {
  exigirStaff(actor);
  return prisma.ticketSlaPolitica.findMany({ orderBy: { resolucionMinutos: "asc" } });
};

export const actualizarSlaPolitica = async (
  actor: Actor,
  prioridad: string,
  dto: ActualizarSlaPoliticaDto
) => {
  if (actor.rol !== "ADMIN") {
    throw new AppError("Solo un administrador puede editar las políticas de SLA", 403);
  }
  const validas: TicketPrioridad[] = ["BAJA", "MEDIA", "ALTA", "URGENTE"];
  if (!validas.includes(prioridad as TicketPrioridad)) {
    throw new AppError("Prioridad inválida", 400);
  }

  return prisma.ticketSlaPolitica.update({
    where: { prioridad: prioridad as TicketPrioridad },
    data: {
      respuestaMinutos: dto.respuestaMinutos,
      resolucionMinutos: dto.resolucionMinutos,
      ...(dto.activa !== undefined ? { activa: dto.activa } : {}),
    },
  });
};
