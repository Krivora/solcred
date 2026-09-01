import { Response, NextFunction } from "express";
import { RequestAutenticado } from "@middlewares/auth.middleware";
import { registrarLog } from "@utils/audit";
import { AccionLog, ModuloLog } from "../../../../generated/prisma/client";
import { ok } from "@utils/response";
import * as reportesService from "./reportes.service";
import type { FiltrosReporteDto, PrevisualizarReporteDto } from "./reportes.schema";

export const catalogos = async (req: RequestAutenticado, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await reportesService.obtenerCatalogos();
    res.status(200).json(ok("Catálogos de reporte obtenidos", data));
  } catch (error) {
    next(error);
  }
};

export const previsualizar = async (req: RequestAutenticado, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, pageSize, ...filtros } = req.body as PrevisualizarReporteDto;
    const data = await reportesService.previsualizar(filtros, page, pageSize);

    await registrarLog({
      accion: AccionLog.CONSULTAR,
      modulo: ModuloLog.SOLICITUDES,
      descripcion: "Vista previa de reporte de solicitudes consultada",
      usuarioId: req.usuario!.id,
      req,
      metadata: { filtros: reportesService.describirFiltros(filtros) },
    });

    res.status(200).json(ok("Vista previa obtenida", data));
  } catch (error) {
    next(error);
  }
};

export const exportar = async (req: RequestAutenticado, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filtros = req.body as FiltrosReporteDto;
    const { filas, resumen, truncado } = await reportesService.obtenerFilasParaExportar(filtros);

    const usuario = req.usuario!;
    const buffer = await reportesService.generarExcelReporte(filas, resumen, {
      generadoPor: usuario.id,
      filtrosTexto: reportesService.describirFiltros(filtros),
      truncado,
    });

    await registrarLog({
      accion: AccionLog.CONSULTAR,
      modulo: ModuloLog.SOLICITUDES,
      descripcion: `Exportó reporte de solicitudes a Excel (${filas.length} filas${truncado ? ", truncado" : ""})`,
      usuarioId: usuario.id,
      req,
      metadata: { filtros: reportesService.describirFiltros(filtros), totalFilas: filas.length, truncado },
    });

    const fecha = new Date().toISOString().slice(0, 10);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename="reporte-solicitudes-${fecha}.xlsx"`);
    res.status(200).send(buffer);
  } catch (error) {
    next(error);
  }
};
