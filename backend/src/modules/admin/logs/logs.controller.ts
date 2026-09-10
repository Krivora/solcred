import { Response, NextFunction } from "express";
import { RequestAutenticado } from "@middlewares/auth.middleware";
import { registrarLog } from "@utils/audit";
import { AccionLog, ModuloLog } from "../../../../generated/prisma/client";
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

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTAR
//
// Igual que en `admin/reportes`: la query se valida a mano dentro del
// controller (`validate(schema, "query")` reasigna `req.query`, que en
// Express 5 es de solo lectura — ver KNOWN-ISSUES.md §2).
// ─────────────────────────────────────────────────────────────────────────────

export const exportar = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filtros = filtrosLogSchema.parse(req.query);
    const { buffer, totalFilas, truncado } = await logsService.exportarLogs(filtros);

    await registrarLog({
      accion: AccionLog.CONSULTAR,
      modulo: ModuloLog.USUARIOS,
      descripcion: `Exportó el log de auditoría a Excel (${totalFilas} filas${truncado ? ", truncado" : ""})`,
      usuarioId: req.usuario!.id,
      req,
      metadata: {
        filtros: {
          accion: filtros.accion ?? null,
          modulo: filtros.modulo ?? null,
          usuarioId: filtros.usuarioId ?? null,
          fechaInicio: filtros.fechaInicio ?? null,
          fechaFin: filtros.fechaFin ?? null,
        },
        totalFilas,
        truncado,
      },
    });

    const fecha = new Date().toISOString().slice(0, 10);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="log-auditoria-${fecha}.xlsx"`);
    res.status(200).send(buffer);
  } catch (error) {
    next(error);
  }
};
