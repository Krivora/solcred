import { Router } from "express";
import { autenticar } from "@middlewares/auth.middleware";
import { autorizar } from "@middlewares/roles.middleware";
import { validate } from "@middlewares/validate.middleware";
import {
  accionConMotivoSchema,
  accionOpcionalSchema,
  asignarAnalistasSchema,
} from "./financiamiento.schema";
import * as ctrl from "./financiamiento.controller";

const router = Router();

router.use(autenticar);

// ─── Listados por etapa ──────────────────────────────────────────────────────
router.get("/stats",        autorizar("ADMIN", "ANALISTA", "SUPERVISOR"), ctrl.stats);
router.get("/analistas",    autorizar("ADMIN"),                            ctrl.listarAnalistas);
router.get("/mesa-control", autorizar("ADMIN", "SUPERVISOR"),              ctrl.listarMesaControl);
router.get("/asignacion",   autorizar("ADMIN"),                            ctrl.listarAsignacion);
router.get("/mis-casos",    autorizar("ANALISTA"),                         ctrl.listarMisCasos);
router.get("/validacion",   autorizar("ADMIN", "SUPERVISOR"),              ctrl.listarValidacion);
router.get("/comite",       autorizar("ADMIN"),                            ctrl.listarComite);
router.get("/:id",          autorizar("ADMIN", "ANALISTA", "SUPERVISOR"),  ctrl.obtenerPorId);

// ─── Asignación (bulk / reasignación) ────────────────────────────────────────
router.post("/asignar",
  autorizar("ADMIN"), validate(asignarAnalistasSchema), ctrl.asignarAnalistas);

// ─── Transiciones ────────────────────────────────────────────────────────────
// Mesa de Control
router.patch("/:id/regresar-aprobacion",
  autorizar("ADMIN", "SUPERVISOR"), validate(accionConMotivoSchema), ctrl.regresarAAprobacion);
router.patch("/:id/pasar-asignacion",
  autorizar("ADMIN", "SUPERVISOR"), validate(accionOpcionalSchema), ctrl.pasarAAsignacion);

// Analista
router.patch("/:id/enviar-validacion",
  autorizar("ADMIN", "ANALISTA"), validate(accionOpcionalSchema), ctrl.enviarAValidacion);

// Validación
router.patch("/:id/regresar-analista",
  autorizar("ADMIN", "SUPERVISOR"), validate(accionConMotivoSchema), ctrl.regresarAAnalista);
router.patch("/:id/enviar-comite",
  autorizar("ADMIN", "SUPERVISOR"), validate(accionOpcionalSchema), ctrl.enviarAComite);

// Comité
router.patch("/:id/regresar-validacion",
  autorizar("ADMIN"), validate(accionConMotivoSchema), ctrl.regresarAValidacion);
router.patch("/:id/aprobar",
  autorizar("ADMIN"), validate(accionOpcionalSchema), ctrl.aprobar);

export default router;
