import { Response, NextFunction } from "express";
import { RequestAutenticado } from "@middlewares/auth.middleware";
import { registrarLog } from "@utils/audit";
import { AccionLog, ModuloLog } from "../../../../generated/prisma/client";
import { ok } from "@utils/response";
import * as analisisService from "./analisis.service";
import { guardarTabSchema } from "./analisis.schema";

export const obtener = async (req: RequestAutenticado, res: Response, next: NextFunction) => {
  try {
    const resultado = await analisisService.obtenerAnalisis(
      req.params.solicitudId as string,
      req.usuario!.rol,
      req.usuario!.personalId
    );
    res.status(200).json(ok("Análisis obtenido", resultado));
  } catch (error) {
    next(error);
  }
};

export const guardarTab = async (req: RequestAutenticado, res: Response, next: NextFunction) => {
  try {
    const { tab, data } = guardarTabSchema.parse(req.body);
    const solicitudId = req.params.solicitudId as string;

    const analisis = await analisisService.guardarTab(
      solicitudId,
      tab,
      data,
      req.usuario!.rol,
      req.usuario!.personalId
    );

    await registrarLog({
      accion: AccionLog.ACTUALIZAR,
      modulo: ModuloLog.SOLICITUDES,
      descripcion: `Análisis financiero actualizado (${tab}): ${solicitudId}`,
      usuarioId: req.usuario!.id,
      entidadId: solicitudId,
      req,
      metadata: { tab },
    });

    res.status(200).json(ok("Pestaña guardada", analisis));
  } catch (error) {
    next(error);
  }
};
