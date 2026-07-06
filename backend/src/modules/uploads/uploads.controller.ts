import { Response, NextFunction } from "express";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { z } from "zod";
import { RequestAutenticado } from "@middlewares/auth.middleware";
import { AppError } from "@middlewares/error.middleware";
import { ok } from "@utils/response";
import prisma from "@config/db";
import { UPLOADS_BASE_DIR } from "@config/multer.config";
import { crearVersionDocumento } from "../expediente/expediente.service";

const PDF_MAGIC_BYTES = Buffer.from("%PDF-");

const bodySchema = z.object({
    tipoDocumentoId: z.string().uuid("tipoDocumentoId inválido"),
});

export const subirArchivo = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
): Promise<void> => {
    let rutaAbsoluta: string | null = null;

    try {
        if (!req.file) {
            throw new AppError("No se proporcionó ningún archivo", 400);
        }

        const parsedBody = bodySchema.safeParse(req.body);
        if (!parsedBody.success) {
            throw new AppError(
                parsedBody.error.errors[0]?.message ?? "tipoDocumentoId inválido",
                400
            );
        }
        const { tipoDocumentoId } = parsedBody.data;
        const { solicitudId } = req.params as { solicitudId: string };
        const { id: usuarioId, rol } = req.usuario!;

        const buffer = req.file.buffer;
        if (
            buffer.length < PDF_MAGIC_BYTES.length ||
            !buffer.subarray(0, PDF_MAGIC_BYTES.length).equals(PDF_MAGIC_BYTES)
        ) {
            throw new AppError(
                "El archivo no es un PDF válido (firma de contenido incorrecta)",
                400
            );
        }

        const tipoExiste = await prisma.tipoDocumento.findUnique({
            where: { id: tipoDocumentoId },
            select: { id: true },
        });
        if (!tipoExiste) {
            throw new AppError("Tipo de documento no encontrado", 404);
        }

        const carpetaDestino = path.join(UPLOADS_BASE_DIR, solicitudId);
        await fs.mkdir(carpetaDestino, { recursive: true });

        const nombreGenerado = `${randomUUID()}.pdf`;
        rutaAbsoluta = path.join(carpetaDestino, nombreGenerado);
        await fs.writeFile(rutaAbsoluta, buffer);

        const rutaRelativa = `${solicitudId}/${nombreGenerado}`;

        // Nombre original saneado solo para mostrar (evita XSS si el frontend
        // lo renderiza sin escapar, y evita basura de control chars).
        const nombreOriginalSaneado = req.file.originalname
            .replace(/[\u0000-\u001F\u007F]/g, "")
            .slice(0, 255);

        // Toda la lógica de negocio (permisos, estatus de la solicitud,
        // pertenencia del tipo de documento al programa, versión atómica)
        // vive en expediente.service.ts — un solo lugar de verdad.
        const documento = await crearVersionDocumento({
            solicitudId,
            usuarioId,
            rol,
            tipoDocumentoId,
            urlArchivo: rutaRelativa,
            nombreArchivo: nombreOriginalSaneado,
        });

        res.status(201).json(
            ok("Archivo subido correctamente", {
                documentoId: documento.id,
                version: documento.version,
                nombreArchivo: documento.nombreArchivo,
                tipoDocumento: documento.tipoDocumento,
            })
        );
    } catch (error) {
        // Si el archivo llegó a escribirse pero algo después falló
        // (permisos, estatus inválido, etc.), no lo dejamos huérfano en disco.
        if (rutaAbsoluta) {
            await fs.unlink(rutaAbsoluta).catch(() => {});
        }
        next(error);
    }
};

export const descargarArchivo = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { solicitudId, documentoId } = req.params as {
            solicitudId: string;
            documentoId: string;
        };

        const documento = await prisma.documentoSolicitud.findFirst({
            where: { id: documentoId, solicitudId },
            select: { urlArchivo: true, nombreArchivo: true },
        });

        if (!documento) {
            throw new AppError("Documento no encontrado", 404);
        }

        const rutaAbsoluta = path.join(UPLOADS_BASE_DIR, documento.urlArchivo);

        if (!rutaAbsoluta.startsWith(UPLOADS_BASE_DIR)) {
            throw new AppError("Ruta de archivo inválida", 400);
        }

        res.sendFile(rutaAbsoluta, (err) => {
            if (err) next(err);
        });
    } catch (error) {
        next(error);
    }
};