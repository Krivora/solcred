import { Response, NextFunction } from "express";
import { RequestAutenticado } from "@middlewares/auth.middleware";
import { registrarLog } from "@utils/audit";
import { AccionLog, ModuloLog } from "../../../generated/prisma/client";
import * as expedienteService from "./expediente.service";
import { ok } from "@utils/response";

// ─────────────────────────────────────────────────────────────────────────────
// EXPEDIENTE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /expediente/:solicitudId
 * Roles: CLIENTE (solo la suya), GESTOR (solo asignadas), ADMIN, ANALISTA
 */
export const obtenerExpediente = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { solicitudId } = req.params;
        const { id: usuarioId, rol } = req.usuario!;

        const expediente = await expedienteService.obtenerExpediente(
            solicitudId as string,
            usuarioId,
            rol
        );

        await registrarLog({
            accion: AccionLog.CONSULTAR,
            modulo: ModuloLog.DOCUMENTOS,
            descripcion: `Expediente consultado: ${expediente.folio}`,
            entidadId: solicitudId as string,
            usuarioId,
            req,
        });

        res.status(200).json(ok("Expediente obtenido", expediente));
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENTOS — CLIENTE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /expediente/:solicitudId/documentos
 * Rol: CLIENTE — sube un documento nuevo o reemplaza uno rechazado
 *
 * req.body ya viene validado y limpiado por el middleware validate(subirDocumentoSchema)
 */
export const subirDocumento = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { solicitudId } = req.params;
        const { id: clienteId } = req.usuario!;

        const documento = await expedienteService.subirDocumento(
            solicitudId as string,
            clienteId,
            req.body
        );

        await registrarLog({
            accion: AccionLog.CREAR,
            modulo: ModuloLog.DOCUMENTOS,
            descripcion: `Documento subido: ${documento.tipoDocumento.nombre} (v${documento.version})`,
            entidadId: solicitudId as string,
            usuarioId: clienteId,
            req,
        });

        res.status(201).json(ok("Documento subido correctamente", documento));
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENTOS — GESTOR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * PATCH /expediente/:solicitudId/documentos/:documentoId/validar
 * Rol: GESTOR — solo el gestor asignado a la solicitud
 *
 * req.body ya viene validado y limpiado por el middleware validate(validarDocumentoSchema)
 */
export const validarDocumento = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { solicitudId, documentoId } = req.params;
        const { id: gestorId } = req.usuario!;

        const documento = await expedienteService.validarDocumento(
            solicitudId as string,
            documentoId as string,
            gestorId,
            req.body
        );

        await registrarLog({
            accion: AccionLog.ACTUALIZAR,
            modulo: ModuloLog.DOCUMENTOS,
            descripcion: `Documento ${documento.estatus.toLowerCase()}: ${documento.tipoDocumento.nombre}`,
            entidadId: documentoId as string,
            usuarioId: gestorId,
            req,
            metadata: {
                solicitudId,
                estatus: documento.estatus,
                ...(documento.motivoRechazo && { motivoRechazo: documento.motivoRechazo }),
            },
        });

        const mensaje =
            documento.estatus === "APROBADO"
                ? "Documento aprobado correctamente"
                : "Documento rechazado";

        res.status(200).json(ok(mensaje, documento));
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// HISTORIAL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /expediente/:solicitudId/documentos/:tipoDocumentoId/historial
 * Roles: GESTOR (asignado), ADMIN, ANALISTA
 */
export const obtenerHistorialDocumento = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { solicitudId, tipoDocumentoId } = req.params;
        const { id: usuarioId, rol } = req.usuario!;

        const historial = await expedienteService.obtenerHistorialDocumento(
            solicitudId as string,
            tipoDocumentoId as string,
            usuarioId,
            rol
        );

        await registrarLog({
            accion: AccionLog.CONSULTAR,
            modulo: ModuloLog.DOCUMENTOS,
            descripcion: `Historial de documento consultado: ${tipoDocumentoId}`,
            entidadId: solicitudId as string,
            usuarioId,
            req,
            metadata: { tipoDocumentoId },
        });

        res.status(200).json(ok("Historial obtenido", historial));
    } catch (error) {
        next(error);
    }
};