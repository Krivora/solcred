import { Router } from "express";
import { autenticar } from "../../middlewares/auth.middleware";
import { autorizar } from "../../middlewares/roles.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  crearSolicitudSchema,
  guardarDatosGeneralesSchema,
  guardarDatosSolicitanteSchema,
  guardarDatosAvalSchema,
  cambiarEstatusSchema,
} from "./solicitudes.schema";
import * as solicitudesController from "./solicitudes.controller";

const router = Router();

router.use(autenticar);

// ─── Módulo de promoción — DEBEN ir antes de /:id ───────────────────────────
router.get("/promocion/stats", autorizar("ADMIN", "ANALISTA"), solicitudesController.statsPromocion);
router.get("/promocion", autorizar("ADMIN", "ANALISTA"), solicitudesController.listarPromocion);

// ─── Rutas generales ────────────────────────────────────────────────────────
router.get("/", solicitudesController.listar);
router.get("/:id", solicitudesController.obtenerPorId);
router.post("/", autorizar("CLIENTE"), validate(crearSolicitudSchema), solicitudesController.crear);

// ─── Llenado de solicitud — solo el cliente dueño ───────────────────────────
router.put("/:id/generales", autorizar("CLIENTE"), validate(guardarDatosGeneralesSchema), solicitudesController.guardarDatosGenerales);
router.put("/:id/solicitante", autorizar("CLIENTE"), validate(guardarDatosSolicitanteSchema), solicitudesController.guardarDatosSolicitante);
router.put("/:id/aval", autorizar("CLIENTE"), validate(guardarDatosAvalSchema), solicitudesController.guardarDatosAval);
router.patch("/:id/enviar", autorizar("CLIENTE"), solicitudesController.enviar);

// ─── Gestión de estatus — solo ADMIN y ANALISTA ─────────────────────────────
router.patch("/:id/estatus", autorizar("ADMIN", "ANALISTA"), validate(cambiarEstatusSchema), solicitudesController.cambiarEstatus);

export default router;