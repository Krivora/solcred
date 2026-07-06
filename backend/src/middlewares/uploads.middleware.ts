import { Response, NextFunction } from "express";
import { RequestAutenticado } from "@middlewares/auth.middleware";
import { AppError } from "@middlewares/error.middleware";
import prisma from "@config/db";

/**
 * Verifica que quien sube (o descarga) tenga derecho sobre la solicitud.
 * - CLIENTE: solo si es el solicitante dueño.
 * - GESTOR / ANALISTA / ADMIN: acceso permitido a cualquier solicitud
 *   (roles internos, según confirmado por el negocio).
 */
export const verificarPropietarioSolicitud = async (
    req: RequestAutenticado,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { solicitudId } = req.params;
        const { id: usuarioId, rol } = req.usuario!;

        const solicitud = await prisma.solicitud.findUnique({
            where: { id: solicitudId as string },
            select: { solicitanteId: true },
        });

        if (!solicitud) {
            throw new AppError("Solicitud no encontrada", 404);
        }

        if (rol === "CLIENTE" && solicitud.solicitanteId !== usuarioId) {
            throw new AppError("No tienes acceso a esta solicitud", 403);
        }

        // GESTOR, ANALISTA, ADMIN: acceso permitido sin restricción adicional.
        next();
    } catch (error) {
        next(error);
    }
};