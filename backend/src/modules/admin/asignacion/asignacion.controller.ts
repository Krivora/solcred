import { Response, NextFunction } from "express";
import { RequestAutenticado } from "@middlewares/auth.middleware";
import { registrarLog } from "@utils/audit";
import { AccionLog, ModuloLog } from "../../../../generated/prisma/client";
import * as asignacionService from "./asignacion.service";
import { ok } from "@utils/response";
import { AsignarManualDto, ListarAsignacionQuerySchema } from "./asignacion.schema";
import { AppError } from "@/middlewares/error.middleware";

export const listarSolicitudesAsignacion = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const query = ListarAsignacionQuerySchema.parse(req.query);
        const resultado = await asignacionService.listarAsignacion(query);

        await registrarLog({
            accion: AccionLog.CONSULTAR,
            modulo: ModuloLog.SOLICITUDES,
            descripcion: "Listado de solicitudes de asignación consultado",
            usuarioId: req.usuario!.id,
            req,
        });

        res.status(200).json(ok("Solicitudes obtenidas", resultado));
    } catch (error) {
        next(error);
    }
};
export const asignarAutomaticamente = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { solicitudIds } = req.body as { solicitudIds: string[] };

        if (!Array.isArray(solicitudIds) || solicitudIds.length === 0) {
            throw new AppError("Debe enviar al menos una solicitud", 400);
        }

        const resultados = await asignacionService.asignarAutomaticamente(solicitudIds);

        const exitosas = resultados.filter((r) => r.exito).length;
        const fallidas = resultados.filter((r) => !r.exito).length;

        await registrarLog({
            accion: AccionLog.ACTUALIZAR,
            modulo: ModuloLog.SOLICITUDES,
            descripcion: `Asignación automática: ${exitosas} exitosas, ${fallidas} fallidas de ${solicitudIds.length} solicitudes`,
            usuarioId: req.usuario!.id,
            req,
        });

        res.status(200).json(ok("Proceso de asignación automática completado", resultados));
    } catch (error) {
        next(error);
    }
};
export const asignarManualmente = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { solicitudId } = req.params as { solicitudId: string };
        const { id: usuarioId, personalId } = req.usuario!;

        if (!personalId) {
            throw new AppError("Este usuario no tiene un perfil de Personal asociado", 403);
        }

        await asignacionService.asignarManualmente(solicitudId, req.body, personalId);

        await registrarLog({
            accion: AccionLog.ACTUALIZAR,
            modulo: ModuloLog.SOLICITUDES,
            descripcion: `Solicitud asignada manualmente a gestor ${req.body.gestorId}: ${solicitudId}`,
            usuarioId,
            entidadId: solicitudId,
            req,
            metadata: { gestorId: req.body.gestorId, motivo: req.body.motivo },
        });

        res.status(200).json(ok("Solicitud asignada correctamente"));
    } catch (error) {
        next(error);
    }
};
export const obtenerCargaGestores = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { grupoId } = req.query;
        const carga = await asignacionService.obtenerCargaGestores(
            grupoId as string | undefined
        );
        res.status(200).json(ok("Carga de gestores obtenida", carga));
    } catch (error) {
        next(error);
    }
};