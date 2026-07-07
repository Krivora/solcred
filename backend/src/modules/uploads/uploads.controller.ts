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
import { registrarLog } from "@/utils/audit";
import { AccionLog, ModuloLog } from "../../../generated/prisma/client";

const PDF_MAGIC_BYTES = Buffer.from("%PDF-");

const bodySchema = z.object({
    tipoDocumentoId: z.string().uuid("tipoDocumentoId inválido"),
});

/**
 * Convierte "Acta de Nacimiento" -> "acta-de-nacimiento"
 * Quita acentos, espacios y símbolos para un nombre limpio y predecible.
 */
const slugificar = (texto: string): string =>
    texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

/**
 * Nombre "amigable" y predecible para mostrar/buscar:
 * ej. "acta-de-nacimiento_v2_20260706.pdf"
 * Ya no depende de cómo el usuario haya nombrado su archivo original.
 */
const generarNombreLegible = (
    nombreTipoDocumento: string,
    version: number
): string => {
    const slug = slugificar(nombreTipoDocumento);
    const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return `${slug}_v${version}_${fecha}.pdf`;
};

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
                parsedBody.error.issues[0]?.message ?? "tipoDocumentoId inválido",
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

        // Ahora también traemos el nombre, lo necesitamos para el nombreArchivo legible
        const tipoDocumento = await prisma.tipoDocumento.findUnique({
            where: { id: tipoDocumentoId },
            select: { id: true, nombre: true },
        });
        if (!tipoDocumento) {
            throw new AppError("Tipo de documento no encontrado", 404);
        }

        const carpetaDestino = path.join(UPLOADS_BASE_DIR, solicitudId);
        await fs.mkdir(carpetaDestino, { recursive: true });

        const nombreGenerado = `${randomUUID()}.pdf`;
        rutaAbsoluta = path.join(carpetaDestino, nombreGenerado);
        await fs.writeFile(rutaAbsoluta, buffer);

        const rutaRelativa = `${solicitudId}/${nombreGenerado}`;

        // Toda la lógica de negocio (permisos, estatus de la solicitud,
        // pertenencia del tipo de documento al programa, versión atómica)
        // vive en expediente.service.ts — un solo lugar de verdad.
        // Le pasamos un nombreArchivo provisional; lo reescribimos abajo
        // ya que necesitamos saber la versión asignada (atómica) primero.
        const documento = await crearVersionDocumento({
            solicitudId,
            usuarioId,
            rol,
            tipoDocumentoId,
            urlArchivo: rutaRelativa,
            nombreArchivo: "", // placeholder, se corrige justo abajo
        });

        // Ahora sí, con la versión real asignada, generamos el nombre legible
        // y lo persistimos. Es una segunda escritura pequeña, pero nos
        // garantiza que el número de versión en el nombre sea el correcto
        // incluso bajo subidas concurrentes.
        const nombreLegible = generarNombreLegible(
            tipoDocumento.nombre,
            documento.version
        );

        const documentoActualizado = await prisma.documentoSolicitud.update({
            where: { id: documento.id },
            data: { nombreArchivo: nombreLegible },
            select: {
                id: true,
                version: true,
                nombreArchivo: true,
                tipoDocumento: true,
            },
        });

        res.status(201).json(
            ok("Archivo subido correctamente", {
                documentoId: documentoActualizado.id,
                version: documentoActualizado.version,
                nombreArchivo: documentoActualizado.nombreArchivo,
                tipoDocumento: documentoActualizado.tipoDocumento,
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

        const rutaAbsoluta = path.normalize(path.join(UPLOADS_BASE_DIR, documento.urlArchivo));
        const baseNormalizada = path.normalize(UPLOADS_BASE_DIR);

        if (!rutaAbsoluta.startsWith(baseNormalizada)) {
            throw new AppError("Ruta de archivo inválida", 400);
        }

        await registrarLog({
            accion: AccionLog.CONSULTAR,
            modulo: ModuloLog.SOLICITUDES,
            descripcion: `Documento visualizado: ${documentoId}`,
            usuarioId: req.usuario!.id,
            entidadId: documentoId,
            req,
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `inline; filename="${encodeURIComponent(documento.nombreArchivo)}"`
        );
        res.setHeader('Cache-Control', 'no-store, must-revalidate');

        res.sendFile(rutaAbsoluta, (err) => {
            if (err) next(err);
        });
    } catch (error) {
        next(error);
    }
};