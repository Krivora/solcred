import { Response, NextFunction } from "express";
import { RequestAutenticado } from "@middlewares/auth.middleware";
import { ok } from "@utils/response";
import { registrarLog } from "@utils/audit";
import { AccionLog, ModuloLog } from "../../../generated/prisma/client";
import * as crm from "./crm.service";
import type { Actor } from "./crm.service";

const actorDe = (req: RequestAutenticado): Actor => ({
  id: req.usuario!.id,
  rol: req.usuario!.rol,
  personalId: req.usuario!.personalId,
});

const paramStr = (req: RequestAutenticado, clave: string): string =>
  String((req.params as Record<string, string>)[clave]);

// ─────────────────────────────────────────────────────────────────────────────

export const crear = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const com = await crm.crearComunicacion(actorDe(req), req.body);

    await registrarLog({
      accion: AccionLog.CREAR,
      modulo: ModuloLog.CRM,
      descripcion: `Comunicación registrada (${com.tipo}) en solicitud ${com.solicitud.folio}`,
      usuarioId: req.usuario!.id,
      entidadId: com.id,
      req,
    });

    res.status(201).json(ok("Comunicación registrada", com));
  } catch (error) {
    next(error);
  }
};

export const listar = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await crm.listarComunicaciones(actorDe(req), req.query);

    // El historial de comunicaciones trae observaciones y datos de contacto
    // del cliente — leerlo queda en el log igual que el expediente o el PDF.
    const { solicitudId, clienteId } = req.query as { solicitudId?: string; clienteId?: string };
    await registrarLog({
      accion: AccionLog.CONSULTAR,
      modulo: ModuloLog.CRM,
      descripcion: `Historial de comunicaciones consultado (${data.pagination.total} resultado${data.pagination.total === 1 ? "" : "s"})`,
      usuarioId: req.usuario!.id,
      entidadId: solicitudId ?? clienteId,
      req,
      metadata: { solicitudId: solicitudId ?? null, clienteId: clienteId ?? null },
    });

    res.status(200).json(ok("Historial de comunicaciones", data));
  } catch (error) {
    next(error);
  }
};

export const resumen = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const solicitudId = paramStr(req, "solicitudId");
    const data = await crm.obtenerResumen(actorDe(req), solicitudId);

    await registrarLog({
      accion: AccionLog.CONSULTAR,
      modulo: ModuloLog.CRM,
      descripcion: `Resumen de comunicaciones consultado: solicitud ${solicitudId}`,
      usuarioId: req.usuario!.id,
      entidadId: solicitudId,
      req,
    });

    res.status(200).json(ok("Resumen de comunicaciones", data));
  } catch (error) {
    next(error);
  }
};

export const editar = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const com = await crm.editarComunicacion(
      actorDe(req),
      paramStr(req, "id"),
      req.body
    );

    await registrarLog({
      accion: AccionLog.ACTUALIZAR,
      modulo: ModuloLog.CRM,
      descripcion: `Comunicación ${com.id} editada`,
      usuarioId: req.usuario!.id,
      entidadId: com.id,
      req,
    });

    res.status(200).json(ok("Comunicación actualizada", com));
  } catch (error) {
    next(error);
  }
};
