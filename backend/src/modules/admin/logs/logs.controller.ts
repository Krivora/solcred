import { Response, NextFunction } from "express";
import { RequestAutenticado } from "@middlewares/auth.middleware";
import { filtrosLogSchema } from "./logs.schema";
import * as logsService from "./logs.service";
import { ok } from "@utils/response";

export const listar = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filtros = filtrosLogSchema.parse(req.query);
    const resultado = await logsService.listarLogs(filtros);

    res.status(200).json(ok("Logs obtenidos", resultado));
  } catch (error) {
    next(error);
  }
};

export const obtenerPorId = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const log = await logsService.obtenerLogPorId(req.params.id as string);

    res.status(200).json(ok("Log obtenido", log));
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
    const data = await logsService.obtenerResumen();

    res.status(200).json(ok("Resumen de actividad obtenido", data));
  } catch (error) {
    next(error);
  }
};