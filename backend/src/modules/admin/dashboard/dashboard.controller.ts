import { Response, NextFunction } from "express";
import { RequestAutenticado } from "@middlewares/auth.middleware";
import { registrarLog } from "@utils/audit";
import { AccionLog, ModuloLog } from "../../../../generated/prisma/client";
import { ok } from "@utils/response";
import * as dashboardService from "./dashboard.service";
import type { RangoDashboard } from "./dashboard.service";

const RANGOS_VALIDOS: RangoDashboard[] = ["7d", "30d", "90d", "12m"];

export const panorama = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const solicitado = req.query.rango as string | undefined;
    const rango: RangoDashboard = RANGOS_VALIDOS.includes(solicitado as RangoDashboard)
      ? (solicitado as RangoDashboard)
      : "30d";

    const data = await dashboardService.obtenerPanorama(rango);

    await registrarLog({
      accion: AccionLog.CONSULTAR,
      modulo: ModuloLog.SOLICITUDES,
      descripcion: `Panorama ejecutivo consultado (rango ${rango})`,
      usuarioId: req.usuario!.id,
      req,
    });

    res.status(200).json(ok("Panorama obtenido", data));
  } catch (error) {
    next(error);
  }
};
