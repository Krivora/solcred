import { Router } from "express";
import { autenticar } from "@middlewares/auth.middleware";
import { autorizar } from "@middlewares/roles.middleware";
import { validate } from "@middlewares/validate.middleware";
import {
  accionConMotivoSchema,
  accionOpcionalSchema,
  asignarAnalistaSchema,
} from "./financiamiento.schema";
import * as ctrl from "./financiamiento.controller";

const router = Router();

router.use(autenticar);

// ─── Listados por etapa ──────────────────────────────────────────────────────
router.get("/stats",        autorizar("ADMIN", "ANALISTA", "SUPERVISOR"), ctrl.stats);
router.get("/analistas",    autorizar("ADMIN"),                            ctrl.listarAnalistas);
router.get("/mesa-control", autorizar("ADMIN", "ANALISTA"),                ctrl.listarMesaControl);
router.get("/asignacion",   autorizar("ADMIN"),                            ctrl.listarAsignacion);
router.get("/mis-casos",    autorizar("ANALISTA"),                         ctrl.listarMisCasos);
router.get("/validacion",   autorizar("ADMIN", "SUPERVISOR"),              ctrl.listarValidacion);
router.get("/comite",       autorizar("ADMIN"),                            ctrl.listarComite);
router.get("/:id",          autorizar("ADMIN", "ANALISTA", "SUPERVISOR"),  ctrl.obtenerPorId);

// ─── Transiciones ────────────────────────────────────────────────────────────
// Mesa de Control
router.patch("/:id/regresar-aprobacion",
  autorizar("ADMIN", "ANALISTA"), validate(accionConMotivoSchema), ctrl.regresarAAprobacion);
router.patch("/:id/pasar-asignacion",
  autorizar("ADMIN", "ANALISTA"), validate(accionOpcionalSchema), ctrl.pasarAAsignacion);

// Asignación
router.patch("/:id/asignar",
  autorizar("ADMIN"), validate(asignarAnalistaSchema), ctrl.asignarAnalista);

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
