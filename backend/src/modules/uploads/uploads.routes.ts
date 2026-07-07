import { Router } from "express";
import { z } from "zod";
import { autenticar } from "@middlewares/auth.middleware";
import { autorizar } from "@middlewares/roles.middleware";
import { validate } from "@middlewares/validate.middleware";
import { uploadPdf } from "@config/multer.config";
import { subirArchivo, descargarArchivo } from "./uploads.controller";
import { verificarPropietarioSolicitud } from "@/middlewares/uploads.middleware";
import rateLimit from "express-rate-limit";
const router = Router();
const descargaLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 30, // 30 descargas/vistas por IP cada 5 min
    message: { success: false, message: "Demasiadas solicitudes de documentos, intenta más tarde" },
});
const paramsSolicitud = z.object({
    solicitudId: z.string().uuid("solicitudId inválido"),
});

const paramsDocumento = z.object({
    solicitudId: z.string().uuid("solicitudId inválido"),
    documentoId: z.string().uuid("documentoId inválido"),
});

router.use(autenticar);

// ─────────────────────────────────────────────────────────────────────────────
// POST /uploads/:solicitudId — sube un PDF y crea la versión del documento
// Acceso: CLIENTE (dueño), GESTOR, ANALISTA, ADMIN
// ─────────────────────────────────────────────────────────────────────────────
router.post(
    "/:solicitudId",
    autorizar("CLIENTE", "GESTOR", "ANALISTA", "ADMIN"),
    validate(paramsSolicitud, "params"),
    verificarPropietarioSolicitud,
    uploadPdf.single("archivo"),
    subirArchivo
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /uploads/:solicitudId/:documentoId — descarga controlada del PDF
// Acceso: mismo criterio que la subida
// ─────────────────────────────────────────────────────────────────────────────
router.get(
    "/:solicitudId/:documentoId",
    descargaLimiter,
    autorizar("CLIENTE", "GESTOR", "ANALISTA", "ADMIN"),
    validate(paramsDocumento, "params"),
    verificarPropietarioSolicitud,
    descargarArchivo
);

export default router;