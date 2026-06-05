import { Router } from "express";
import { autenticar } from "@middlewares/auth.middleware";
import { autorizar } from "@middlewares/roles.middleware";
import { validate } from "@middlewares/validate.middleware";
import { subirDocumentoSchema, validarDocumentoSchema } from "./expediente.schema";
import * as expedienteController from "./expediente.controller";

const router = Router();

router.use(autenticar);

// ─────────────────────────────────────────────────────────────────────────────
// EXPEDIENTE — Vista general
// Acceso: todos los roles internos + el cliente dueño de la solicitud
// ─────────────────────────────────────────────────────────────────────────────
router.get(
    "/:solicitudId",
    autorizar("ADMIN", "ANALISTA", "GESTOR", "CLIENTE"),
    expedienteController.obtenerExpediente
);

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENTOS — Cliente sube documentos
// ─────────────────────────────────────────────────────────────────────────────
router.post(
    "/:solicitudId/documentos",
    autorizar("CLIENTE"),
    validate(subirDocumentoSchema),
    expedienteController.subirDocumento
);

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENTOS — Gestor valida (aprueba o rechaza)
// La verificación de "gestor asignado" se hace dentro del service
// ─────────────────────────────────────────────────────────────────────────────
router.patch(
    "/:solicitudId/documentos/:documentoId/validar",
    autorizar("GESTOR"),
    validate(validarDocumentoSchema),
    expedienteController.validarDocumento
);

// ─────────────────────────────────────────────────────────────────────────────
// HISTORIAL — Versiones anteriores de un tipo de documento
// Acceso: roles internos (no cliente)
// ─────────────────────────────────────────────────────────────────────────────
router.get(
    "/:solicitudId/documentos/:tipoDocumentoId/historial",
    autorizar("ADMIN", "ANALISTA", "GESTOR"),
    expedienteController.obtenerHistorialDocumento
);

export default router;