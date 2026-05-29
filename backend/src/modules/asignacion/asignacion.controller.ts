// src/modules/asignacion/asignacion.controller.ts

import { Response, NextFunction } from "express";
import { RequestAutenticado } from "../../middlewares/auth.middleware";
import { registrarLog } from "../../utils/audit";
import { AccionLog, ModuloLog } from "../../../generated/prisma/client";
import * as asignacionService from "./asignacion.service";
import { ok } from "../../utils/response";

// ─── Grupos ──────────────────────────────────────────────────────────────────

export const listarGrupos = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const grupos = await asignacionService.listarGrupos();
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
        const grupo = await asignacionService.obtenerGrupoPorId(req.params.id);
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
        const grupo = await asignacionService.crearGrupo(req.body);

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
        const grupo = await asignacionService.actualizarGrupo(
            req.params.id,
            req.body
        );

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
        const resultado = await asignacionService.eliminarGrupo(req.params.id);

        await registrarLog({
            accion: AccionLog.ELIMINAR,
            modulo: ModuloLog.SOLICITUDES,
            descripcion: `Grupo de gestión eliminado/desactivado: ${req.params.id}`,
            usuarioId: req.usuario!.id,
            entidadId: req.params.id,
            req,
        });

        res.status(200).json(ok("Grupo eliminado", resultado));
    } catch (error) {
        next(error);
    }
};

// ─── Asignación ──────────────────────────────────────────────────────────────

export const asignarAutomaticamente = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        await asignacionService.asignarAutomaticamente(req.params.solicitudId);

        await registrarLog({
            accion: AccionLog.ACTUALIZAR,
            modulo: ModuloLog.SOLICITUDES,
            descripcion: `Solicitud asignada automáticamente: ${req.params.solicitudId}`,
            usuarioId: req.usuario!.id,
            entidadId: req.params.solicitudId,
            req,
        });

        res.status(200).json(ok("Solicitud asignada automáticamente"));
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
        await asignacionService.asignarManualmente(
            req.params.solicitudId,
            req.body,
            req.usuario!.id
        );

        await registrarLog({
            accion: AccionLog.ACTUALIZAR,
            modulo: ModuloLog.SOLICITUDES,
            descripcion: `Solicitud asignada manualmente a gestor ${req.body.gestorId}: ${req.params.solicitudId}`,
            usuarioId: req.usuario!.id,
            entidadId: req.params.solicitudId,
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