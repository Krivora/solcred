import { Response, NextFunction } from "express";
import { RequestAutenticado } from "@middlewares/auth.middleware";
import { registrarLog } from "@utils/audit";
import { AccionLog, ModuloLog } from "../../../../generated/prisma/client";
import { ok } from "@utils/response";
import * as analisisService from "./analisis.service";
import { guardarTabSchema, informeEjecutivoSchema } from "./analisis.schema";
import { informeEjecutivoTemplate } from "@/shared/pdf/templates/informe-ejecutivo.template";
import { generarPDFDesdeHTML } from "@/shared/pdf/pdf.service";
import { estamparMarcaAguaConsulta } from "@/shared/pdf/watermark";

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

export const generarInformeEjecutivo = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const solicitudId = req.params.solicitudId as string;
    const input = informeEjecutivoSchema.parse(req.body);

    const data = await analisisService.armarInformeEjecutivo(solicitudId, input);
    const html = informeEjecutivoTemplate(data);
    const pdfBuffer = await generarPDFDesdeHTML(html);
    const marcado = await estamparMarcaAguaConsulta(pdfBuffer, {
      folio: data.folio,
      usuarioId: req.usuario!.id,
    });

    await registrarLog({
      accion: AccionLog.CONSULTAR,
      modulo: ModuloLog.SOLICITUDES,
      descripcion: `Informe ejecutivo generado para solicitud: ${solicitudId}`,
      usuarioId: req.usuario!.id,
      entidadId: solicitudId,
      req,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="informe-ejecutivo-${data.folio}.pdf"`);
    res.setHeader("Content-Length", marcado.length.toString());
    res.status(200).send(marcado);
  } catch (error) {
    next(error);
  }
};
