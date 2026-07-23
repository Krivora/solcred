import { Response, NextFunction } from "express";
import { RequestAutenticado } from "@middlewares/auth.middleware";
import { registrarLog } from "@utils/audit";
import { AccionLog, ModuloLog } from "../../../generated/prisma/client";
import * as expedienteService from "./expediente.service";
import { ok } from "@utils/response";
import { AppError } from "@/middlewares/error.middleware";

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
        // ── FIX: separar usuarioId (para el log) de personalId (para el gestor) ──
        const { id: usuarioId, personalId } = req.usuario!;

        if (!personalId) {
            throw new AppError("Este usuario no tiene un perfil de Personal asociado", 403);
        }

        const documento = await expedienteService.validarDocumento(
            solicitudId as string,
            documentoId as string,
            personalId,
            req.body
        );

        await registrarLog({
            accion: AccionLog.ACTUALIZAR,
            modulo: ModuloLog.DOCUMENTOS,
            descripcion: `Documento ${documento.estatus.toLowerCase()}: ${documento.tipoDocumento.nombre}`,
            entidadId: documentoId as string,
            usuarioId, // ← sigue siendo Usuario.id, correcto para el log
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