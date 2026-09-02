import { Router } from "express";
import { autenticar } from "@middlewares/auth.middleware";
import { autorizar, soloLecturaSupervisor } from "@middlewares/roles.middleware";
import { validate } from "@middlewares/validate.middleware";
import {
  devolverAlSolicitanteSchema,
  enviarAFinanciamientoSchema,
  enviarAAprobacionSchema,
  cancelarSchema,
  rechazarSchema,
} from "./promocion.schema";
import * as solicitudesController from "./promocion.controller";

const router = Router();

router.use(autenticar);
router.use(soloLecturaSupervisor);

// Roles que ven/documentan la solicitud aunque no operen Promoción (para PDFs,
// expediente y cancelación transversal desde Financiamiento).
const STAFF_LECTURA_SOLICITUD = [
  "ADMIN", "GESTOR", "ANALISTA", "SUPERVISOR",
  "ENCARGADO_PROMOCION", "ENCARGADO_FINANCIAMIENTO", "MESA_CONTROL",
] as const;

// ─── Estadísticas y listados ──────────────────────────────────────────────────
router.get("/promocion/stats",    autorizar("ADMIN", "GESTOR", "ENCARGADO_PROMOCION", "SUPERVISOR"), solicitudesController.statsPromocion);
router.get("/promocion/gestores", autorizar("ADMIN", "GESTOR", "ENCARGADO_PROMOCION", "SUPERVISOR"), solicitudesController.gestoresPromocion);
router.get("/promocion",          autorizar("ADMIN", "GESTOR", "ENCARGADO_PROMOCION", "SUPERVISOR"), solicitudesController.listarPromocion);
router.get("/mis-casos",       autorizar("GESTOR"),            solicitudesController.listarMisCasos);
router.get("/aprobacion", autorizar("ADMIN", "ENCARGADO_PROMOCION", "SUPERVISOR"), solicitudesController.listarAprobacion);
router.get("/historico", autorizar("ADMIN", "GESTOR", "ENCARGADO_PROMOCION", "SUPERVISOR"), solicitudesController.listarHistorico);
router.get("/:id", autorizar("ADMIN", "GESTOR", "ENCARGADO_PROMOCION", "ENCARGADO_FINANCIAMIENTO", "MESA_CONTROL", "SUPERVISOR"), solicitudesController.obtenerPorId);
router.get("/:id/pdf", autorizar(...STAFF_LECTURA_SOLICITUD), solicitudesController.descargarPDF);
router.get("/:id/carta-rechazo", autorizar(...STAFF_LECTURA_SOLICITUD), solicitudesController.descargarCartaRechazo);
router.get("/:id/tarjeta-informativa", autorizar(...STAFF_LECTURA_SOLICITUD), solicitudesController.descargarTarjetaInformativa);
router.get('/:id/acuse-entrega', autorizar(...STAFF_LECTURA_SOLICITUD), solicitudesController.descargarAcuseEntregaExpediente);
// ─── Acciones de promoción ────────────────────────────────────────────────────
router.patch("/:id/devolver",
  autorizar("ADMIN", "ANALISTA", "GESTOR", "ENCARGADO_PROMOCION"),
  validate(devolverAlSolicitanteSchema),
  solicitudesController.devolverAlSolicitante
);

router.patch("/:id/promotor",
  autorizar("ADMIN", "GESTOR", "ENCARGADO_PROMOCION"),
  validate(devolverAlSolicitanteSchema), // reutiliza el schema, motivo requerido
  solicitudesController.regresarAlPromotor
);

router.patch("/:id/financiamiento",
  autorizar("ADMIN", "ENCARGADO_PROMOCION"),
  validate(enviarAFinanciamientoSchema),
  solicitudesController.enviarAFinanciamiento
);

router.patch("/:id/aprobacion",
  autorizar("ADMIN", "GESTOR", "ENCARGADO_PROMOCION"),
  validate(enviarAAprobacionSchema),
  solicitudesController.enviarAAprobacion
);

router.patch("/:id/cancelar",
  autorizar(...STAFF_LECTURA_SOLICITUD),
  validate(cancelarSchema),
  solicitudesController.cancelar
);

router.patch("/:id/rechazar",
  autorizar("ADMIN", "SUPERVISOR", "ENCARGADO_PROMOCION", "ENCARGADO_FINANCIAMIENTO"),
  validate(rechazarSchema),
  solicitudesController.rechazar
);

export default router;
