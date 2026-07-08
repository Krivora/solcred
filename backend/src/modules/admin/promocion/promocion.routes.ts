import { Router } from "express";
import { autenticar } from "@middlewares/auth.middleware";
import { autorizar } from "@middlewares/roles.middleware";
import { validate } from "@middlewares/validate.middleware";
import {
  cambiarEstatusSchema,
  devolverAlSolicitanteSchema,
  enviarAFinanciamientoSchema,
  enviarAAprobacionSchema,
  cancelarSchema,
  rechazarSchema,
} from "./promocion.schema";
import * as solicitudesController from "./promocion.controller";

const router = Router();

router.use(autenticar);

// ─── Estadísticas y listados ──────────────────────────────────────────────────
router.get("/promocion/stats", autorizar("ADMIN", "GESTOR"), solicitudesController.statsPromocion);
router.get("/promocion",       autorizar("ADMIN", "GESTOR"), solicitudesController.listarPromocion);
router.get("/mis-casos",       autorizar("GESTOR"),            solicitudesController.listarMisCasos);
router.get("/aprobacion", autorizar("ADMIN"), solicitudesController.listarAprobacion);
router.get("/historico", autorizar("ADMIN", "GESTOR"), solicitudesController.listarHistorico);
// ─── Generales ────────────────────────────────────────────────────────────────
router.get("/",    solicitudesController.listar);
router.get("/:id", solicitudesController.obtenerPorId);

// ─── Cambio de estatus genérico (admin) ──────────────────────────────────────
router.patch("/:id/estatus",
  autorizar("ADMIN", "ANALISTA"),
  validate(cambiarEstatusSchema),
  solicitudesController.cambiarEstatus
);

// ─── Acciones de promoción ────────────────────────────────────────────────────
router.patch("/:id/devolver",
  autorizar("ADMIN", "ANALISTA", "GESTOR"),
  validate(devolverAlSolicitanteSchema),
  solicitudesController.devolverAlSolicitante
);

router.patch("/:id/promotor",
  autorizar("ADMIN", "GESTOR"),
  validate(devolverAlSolicitanteSchema), // reutiliza el schema, motivo requerido
  solicitudesController.regresarAlPromotor
);

router.patch("/:id/financiamiento",
  autorizar("ADMIN", "GESTOR", "GESTOR"),
  validate(enviarAFinanciamientoSchema),
  solicitudesController.enviarAFinanciamiento
);

router.patch("/:id/aprobacion",
  autorizar("ADMIN", "GESTOR", "GESTOR"),
  validate(enviarAAprobacionSchema),
  solicitudesController.enviarAAprobacion
);

router.patch("/:id/cancelar",
  autorizar("ADMIN", "GESTOR"),
  validate(cancelarSchema),
  solicitudesController.cancelar
);

router.patch("/:id/rechazar",
  autorizar("ADMIN", "GESTOR"),
  validate(rechazarSchema),
  solicitudesController.rechazar
);

export default router;