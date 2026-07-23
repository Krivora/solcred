import { Response, NextFunction } from "express";
import { RequestAutenticado } from "@middlewares/auth.middleware";
import { registrarLog } from "@utils/audit";
import { AccionLog, ModuloLog } from "../../../../generated/prisma/client";
import * as gruposService from "./grupos.service";
import { ok } from "@utils/response";

export const listarGrupos = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const grupos = await gruposService.listarGrupos();
        res.status(200).json(ok("Grupos obtenidos", grupos));
    } catch (error) {
        next(error);
    }
};

export const obtenerGrupoPorId = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        const grupo = await gruposService.obtenerGrupoPorId(id);
        res.status(200).json(ok("Grupo obtenido", grupo));
    } catch (error) {
        next(error);
    }
};

export const crearGrupo = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const grupo = await gruposService.crearGrupo(req.body);

        await registrarLog({
            accion: AccionLog.CREAR,
            modulo: ModuloLog.SOLICITUDES,
            descripcion: `Grupo de gestión creado: ${grupo.nombre}`,
            usuarioId: req.usuario!.id,
            entidadId: grupo.id,
            req,
            metadata: { nombre: grupo.nombre, prioridad: grupo.prioridad },
        });

        res.status(201).json(ok("Grupo creado", grupo));
    } catch (error) {
        next(error);
    }
};

export const actualizarGrupo = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        const grupo = await gruposService.actualizarGrupo(id, req.body);

        await registrarLog({
            accion: AccionLog.ACTUALIZAR,
            modulo: ModuloLog.SOLICITUDES,
            descripcion: `Grupo de gestión actualizado: ${grupo.nombre}`,
            usuarioId: req.usuario!.id,
            entidadId: grupo.id,
            req,
            metadata: req.body,
        });

        res.status(200).json(ok("Grupo actualizado", grupo));
    } catch (error) {
        next(error);
    }
};


export const eliminarGrupo = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        const resultado = await gruposService.eliminarGrupo(id);

        await registrarLog({
            accion: AccionLog.ELIMINAR,
            modulo: ModuloLog.SOLICITUDES,
            descripcion: `Grupo de gestión eliminado/desactivado: ${id}`,
            usuarioId: req.usuario!.id,
            entidadId: id,
            req,
        });

        res.status(200).json(ok("Grupo eliminado", resultado));
    } catch (error) {
        next(error);
    }
};
