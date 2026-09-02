import { Router } from "express";
import { z } from "zod";
import { autenticar } from "@middlewares/auth.middleware";
import { autorizar, soloLecturaSupervisor } from "@middlewares/roles.middleware";
import { validate } from "@middlewares/validate.middleware";
import * as expedienteController from "./expediente.controller";

const router = Router();

const paramsSolicitud = z.object({
    solicitudId: z.string().uuid("solicitudId inválido"),
});

const paramsDocumento = z.object({
    solicitudId: z.string().uuid("solicitudId inválido"),
    documentoId: z.string().uuid("documentoId inválido"),
});

const paramsHistorial = z.object({
    solicitudId: z.string().uuid("solicitudId inválido"),
    tipoDocumentoId: z.string().uuid("tipoDocumentoId inválido"),
});

router.use(autenticar);
router.use(soloLecturaSupervisor);

router.get(
    "/:solicitudId",
    autorizar("ADMIN", "ANALISTA", "SUPERVISOR", "GESTOR", "CLIENTE", "ENCARGADO_PROMOCION", "ENCARGADO_FINANCIAMIENTO", "MESA_CONTROL"),
    validate(paramsSolicitud, "params"),
    expedienteController.obtenerExpediente
);

// La subida de documentos ahora vive exclusivamente en /api/uploads/:solicitudId
// (ver uploads.routes.ts), para garantizar que todo archivo pase por la
// validación de magic bytes antes de tocar disco o crear un registro en BD.

router.patch(
    "/:solicitudId/documentos/:documentoId/validar",
    autorizar("GESTOR", "ENCARGADO_PROMOCION"),
    validate(paramsDocumento, "params"),
    validate(require("./expediente.schema").validarDocumentoSchema),
    expedienteController.validarDocumento
);

router.get(
    "/:solicitudId/documentos/:tipoDocumentoId/historial",
    autorizar("ADMIN", "ANALISTA", "SUPERVISOR", "GESTOR", "CLIENTE", "ENCARGADO_PROMOCION", "ENCARGADO_FINANCIAMIENTO", "MESA_CONTROL"),
    validate(paramsHistorial, "params"),
    expedienteController.obtenerHistorialDocumento
);

export default router;