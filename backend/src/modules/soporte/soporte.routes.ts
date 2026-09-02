import { Router } from "express";
import rateLimit from "express-rate-limit";
import { autenticar } from "@middlewares/auth.middleware";
import { autorizar, soloLecturaSupervisor } from "@middlewares/roles.middleware";
import { validate } from "@middlewares/validate.middleware";
import { uploadSoporte } from "@config/multer.config";
import * as ctrl from "./soporte.controller";
import {
  actualizarSlaPoliticaSchema,
  asignarTicketSchema,
  calificarTicketSchema,
  cambiarCategoriaSchema,
  cambiarEstatusSchema,
  cambiarPrioridadSchema,
  cancelarTicketSchema,
  comentarTicketSchema,
  crearTicketSchema,
  reabrirTicketSchema,
} from "./soporte.schema";

const router = Router();

router.use(autenticar);
// SUPERVISOR (ADMIN de solo lectura): ve todo y actúa solo sobre sus propios
// tickets — el allowlist de auto-servicio vive en el propio middleware.
router.use(soloLecturaSupervisor);

const limitadorDescarga = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Demasiadas descargas de adjuntos, intenta más tarde" },
});

// ─── Staff — rutas literales primero, antes de /tickets/:id ─────────────────
router.get("/tickets/stats", autorizar("ADMIN", "SUPERVISOR"), ctrl.stats);
router.get("/agentes", autorizar("ADMIN", "SUPERVISOR"), ctrl.agentes);
router.get("/sla-politicas", autorizar("ADMIN", "SUPERVISOR"), ctrl.listarSlaPoliticas);
router.put(
  "/sla-politicas/:prioridad",
  autorizar("ADMIN"),
  validate(actualizarSlaPoliticaSchema),
  ctrl.actualizarSlaPolitica
);

// ─── Solicitante y compartidos ──────────────────────────────────────────────
router.post(
  "/tickets",
  uploadSoporte.array("adjuntos", 5),
  validate(crearTicketSchema),
  ctrl.crear
);
// La query se valida dentro del service (Express 5 no deja reasignar req.query).
router.get("/tickets/mios", ctrl.listarMios);
router.get("/tickets", autorizar("ADMIN", "SUPERVISOR"), ctrl.listarTodos);
router.get("/tickets/:id", ctrl.detalle);
router.post(
  "/tickets/:id/comentarios",
  uploadSoporte.array("adjuntos", 5),
  validate(comentarTicketSchema),
  ctrl.comentar
);
router.get("/tickets/:id/adjuntos/:adjuntoId", limitadorDescarga, ctrl.descargarAdjunto);

// ─── Acciones del solicitante ──────────────────────────────────────────────
router.patch("/tickets/:id/cerrar", ctrl.cerrar);
router.patch("/tickets/:id/reabrir", validate(reabrirTicketSchema), ctrl.reabrir);
router.post("/tickets/:id/calificar", validate(calificarTicketSchema), ctrl.calificar);

// ─── Acciones de staff (ADMIN) ─────────────────────────────────────────────
router.patch("/tickets/:id/asignar", autorizar("ADMIN"), validate(asignarTicketSchema), ctrl.asignar);
router.patch("/tickets/:id/prioridad", autorizar("ADMIN"), validate(cambiarPrioridadSchema), ctrl.prioridad);
router.patch("/tickets/:id/categoria", autorizar("ADMIN"), validate(cambiarCategoriaSchema), ctrl.categoria);
router.patch("/tickets/:id/estatus", autorizar("ADMIN"), validate(cambiarEstatusSchema), ctrl.estatus);
router.patch("/tickets/:id/cancelar", autorizar("ADMIN"), validate(cancelarTicketSchema), ctrl.cancelar);

export default router;
