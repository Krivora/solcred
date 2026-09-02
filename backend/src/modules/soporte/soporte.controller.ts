import { Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { RequestAutenticado } from "@middlewares/auth.middleware";
import { AppError } from "@middlewares/error.middleware";
import { ok } from "@utils/response";
import { registrarLog } from "@utils/audit";
import prisma from "@config/db";
import { AccionLog, ModuloLog } from "../../../generated/prisma/client";
import * as soporte from "./soporte.service";
import type { Actor } from "./soporte.service";
import { validarYGuardarAdjuntos, limpiarAdjuntos } from "./soporte.archivos";

const actorDe = (req: RequestAutenticado): Actor => ({
  id: req.usuario!.id,
  rol: req.usuario!.rol,
  personalId: req.usuario!.personalId,
});

const archivosDe = (req: RequestAutenticado): Express.Multer.File[] =>
  Array.isArray(req.files) ? req.files : [];

const paramStr = (req: RequestAutenticado, clave: string): string =>
  String((req.params as Record<string, string>)[clave]);

// ─────────────────────────────────────────────────────────────────────────────

export const crear = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const ticketId = randomUUID();
  let adjuntos: Awaited<ReturnType<typeof validarYGuardarAdjuntos>> = [];

  try {
    adjuntos = await validarYGuardarAdjuntos(ticketId, archivosDe(req), 0);

    const ticket = await soporte.crearTicket(actorDe(req), ticketId, req.body, adjuntos);

    await registrarLog({
      accion: AccionLog.CREAR,
      modulo: ModuloLog.SOPORTE,
      descripcion: `Ticket creado: ${ticket.folio}`,
      usuarioId: req.usuario!.id,
      entidadId: ticket.id,
      req,
    });

    res.status(201).json(ok("Ticket creado", ticket));
  } catch (error) {
    await limpiarAdjuntos(adjuntos.map((a) => a.rutaAbsoluta));
    next(error);
  }
};

export const listarMios = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const resultado = await soporte.listarMisTickets(actorDe(req), req.query);
    res.status(200).json(ok("Tickets obtenidos", resultado));
  } catch (error) {
    next(error);
  }
};

export const detalle = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ticket = await soporte.obtenerTicket(actorDe(req), paramStr(req, "id"));
    res.status(200).json(ok("Ticket obtenido", ticket));
  } catch (error) {
    next(error);
  }
};

export const comentar = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const ticketId = paramStr(req, "id");
  let adjuntos: Awaited<ReturnType<typeof validarYGuardarAdjuntos>> = [];

  try {
    const previos = await prisma.ticketAdjunto.count({ where: { ticketId } });
    adjuntos = await validarYGuardarAdjuntos(ticketId, archivosDe(req), previos);

    const comentario = await soporte.comentarTicket(
      actorDe(req),
      ticketId,
      req.body,
      adjuntos
    );

    await registrarLog({
      accion: AccionLog.ACTUALIZAR,
      modulo: ModuloLog.SOPORTE,
      descripcion: `Comentario en ticket ${ticketId}`,
      usuarioId: req.usuario!.id,
      entidadId: ticketId,
      req,
    });

    res.status(201).json(ok("Comentario agregado", comentario));
  } catch (error) {
    await limpiarAdjuntos(adjuntos.map((a) => a.rutaAbsoluta));
    next(error);
  }
};

export const cerrar = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ticket = await soporte.cerrarTicket(actorDe(req), paramStr(req, "id"));
    await registrarLog({
      accion: AccionLog.ACTUALIZAR,
      modulo: ModuloLog.SOPORTE,
      descripcion: `Ticket cerrado: ${ticket.folio}`,
      usuarioId: req.usuario!.id,
      entidadId: ticket.id,
      req,
    });
    res.status(200).json(ok("Ticket cerrado", ticket));
  } catch (error) {
    next(error);
  }
};

export const reabrir = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ticket = await soporte.reabrirTicket(
      actorDe(req),
      paramStr(req, "id"),
      req.body.motivo
    );
    await registrarLog({
      accion: AccionLog.ACTUALIZAR,
      modulo: ModuloLog.SOPORTE,
      descripcion: `Ticket reabierto: ${ticket.folio}`,
      usuarioId: req.usuario!.id,
      entidadId: ticket.id,
      req,
    });
    res.status(200).json(ok("Ticket reabierto", ticket));
  } catch (error) {
    next(error);
  }
};

export const calificar = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ticket = await soporte.calificarTicket(
      actorDe(req),
      paramStr(req, "id"),
      req.body
    );
    await registrarLog({
      accion: AccionLog.ACTUALIZAR,
      modulo: ModuloLog.SOPORTE,
      descripcion: `Ticket calificado (${req.body.calificacion}/5): ${ticket.folio}`,
      usuarioId: req.usuario!.id,
      entidadId: ticket.id,
      req,
    });
    res.status(200).json(ok("Gracias por tu calificación", ticket));
  } catch (error) {
    next(error);
  }
};

export const descargarAdjunto = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = paramStr(req, "id");
    const adjuntoId = paramStr(req, "adjuntoId");
    const archivo = await soporte.obtenerAdjuntoParaDescarga(actorDe(req), id, adjuntoId);

    await registrarLog({
      accion: AccionLog.CONSULTAR,
      modulo: ModuloLog.SOPORTE,
      descripcion: `Adjunto de ticket visualizado: ${adjuntoId}`,
      usuarioId: req.usuario!.id,
      entidadId: adjuntoId,
      req,
    });

    res.setHeader("Content-Type", archivo.tipoMime);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(archivo.nombreOriginal)}"`
    );
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Security-Policy", "default-src 'none'; sandbox");
    res.setHeader("Cache-Control", "no-store, must-revalidate");

    res.sendFile(archivo.rutaAbsoluta, (err) => {
      if (err) next(err instanceof Error ? new AppError("No se pudo leer el archivo", 404) : err);
    });
  } catch (error) {
    next(error);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// STAFF (Fase 2)
// ═════════════════════════════════════════════════════════════════════════════

export const listarTodos = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const resultado = await soporte.listarTickets(actorDe(req), req.query);
    res.status(200).json(ok("Tickets obtenidos", resultado));
  } catch (error) {
    next(error);
  }
};

export const stats = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await soporte.obtenerStats(actorDe(req));
    res.status(200).json(ok("Métricas de soporte", data));
  } catch (error) {
    next(error);
  }
};

export const agentes = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await soporte.listarAgentes(actorDe(req));
    res.status(200).json(ok("Agentes disponibles", data));
  } catch (error) {
    next(error);
  }
};

const accionStaff = (
  servicio: (actor: Actor, ticketId: string, body: unknown) => Promise<{ folio: string; id: string }>,
  descripcion: (folio: string) => string
) =>
  async (req: RequestAutenticado, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticket = await servicio(actorDe(req), paramStr(req, "id"), req.body);
      await registrarLog({
        accion: AccionLog.ACTUALIZAR,
        modulo: ModuloLog.SOPORTE,
        descripcion: descripcion(ticket.folio),
        usuarioId: req.usuario!.id,
        entidadId: ticket.id,
        req,
      });
      res.status(200).json(ok("Ticket actualizado", ticket));
    } catch (error) {
      next(error);
    }
  };

export const asignar = accionStaff(
  (a, id, body) => soporte.asignarTicket(a, id, body as never),
  (f) => `Ticket asignado: ${f}`
);
export const prioridad = accionStaff(
  (a, id, body) => soporte.cambiarPrioridad(a, id, body as never),
  (f) => `Prioridad de ticket cambiada: ${f}`
);
export const categoria = accionStaff(
  (a, id, body) => soporte.cambiarCategoria(a, id, body as never),
  (f) => `Categoría de ticket cambiada: ${f}`
);
export const estatus = accionStaff(
  (a, id, body) => soporte.cambiarEstatus(a, id, body as never),
  (f) => `Estatus de ticket cambiado: ${f}`
);
export const cancelar = accionStaff(
  (a, id, body) => soporte.cancelarTicket(a, id, (body as { motivo: string }).motivo),
  (f) => `Ticket cancelado: ${f}`
);

export const listarSlaPoliticas = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await soporte.listarSlaPoliticas(actorDe(req));
    res.status(200).json(ok("Políticas de SLA", data));
  } catch (error) {
    next(error);
  }
};

export const actualizarSlaPolitica = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const politica = await soporte.actualizarSlaPolitica(
      actorDe(req),
      paramStr(req, "prioridad"),
      req.body
    );
    await registrarLog({
      accion: AccionLog.ACTUALIZAR,
      modulo: ModuloLog.SOPORTE,
      descripcion: `Política de SLA actualizada: ${politica.prioridad}`,
      usuarioId: req.usuario!.id,
      entidadId: politica.id,
      req,
    });
    res.status(200).json(ok("Política de SLA actualizada", politica));
  } catch (error) {
    next(error);
  }
};
