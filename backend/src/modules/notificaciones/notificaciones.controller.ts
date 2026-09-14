import { Response, NextFunction } from "express";
import { RequestAutenticado } from "@middlewares/auth.middleware";
import { ok } from "@utils/response";
import * as notificaciones from "./notificaciones.service";

export const listar = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await notificaciones.listarNotificaciones(req.usuario!.id, req.query);
    res.status(200).json(ok("Notificaciones", data));
  } catch (error) {
    next(error);
  }
};

export const contador = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await notificaciones.contarNoLeidas(req.usuario!.id);
    res.status(200).json(ok("Contador de no leídas", data));
  } catch (error) {
    next(error);
  }
};

export const marcarLeida = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String((req.params as Record<string, string>).id);
    const data = await notificaciones.marcarLeida(req.usuario!.id, id);
    res.status(200).json(ok("Notificación marcada como leída", data));
  } catch (error) {
    next(error);
  }
};

export const marcarTodasLeidas = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await notificaciones.marcarTodasLeidas(req.usuario!.id);
    res.status(200).json(ok("Notificaciones marcadas como leídas", data));
  } catch (error) {
    next(error);
  }
};
