import { Router } from "express";
import { autenticar } from "@middlewares/auth.middleware";
import { autorizar, soloLecturaSupervisor } from "@middlewares/roles.middleware";
import { validate } from "@middlewares/validate.middleware";
import {
  accionConMotivoSchema,
  accionOpcionalSchema,
  asignarAnalistasSchema,
} from "./financiamiento.schema";
import * as ctrl from "./financiamiento.controller";

const router = Router();

router.use(autenticar);
// SUPERVISOR entra a todos los listados (aparece en las constantes de abajo)
// pero este guard le bloquea cualquier transición: es solo lectura.
router.use(soloLecturaSupervisor);

// Opera Mesa de Control: ADMIN + SUPERVISOR (lectura) + rol dedicado.
const MESA_CONTROL = ["ADMIN", "SUPERVISOR", "MESA_CONTROL"] as const;
// Opera Validación / Comité: ADMIN + SUPERVISOR (lectura) + encargado de área.
const VALIDACION = ["ADMIN", "SUPERVISOR", "ENCARGADO_FINANCIAMIENTO"] as const;
// Asigna analistas: ADMIN + encargado de área (+ SUPERVISOR solo para ver).
const ASIGNACION = ["ADMIN", "ENCARGADO_FINANCIAMIENTO", "SUPERVISOR"] as const;
// Cualquiera que consulta el detalle de un caso de Financiamiento.
const LECTURA = [
  "ADMIN", "ANALISTA", "SUPERVISOR",
  "ENCARGADO_FINANCIAMIENTO", "MESA_CONTROL",
] as const;

// ─── Listados por etapa ──────────────────────────────────────────────────────
router.get("/stats",        autorizar(...LECTURA),                ctrl.stats);
router.get("/analistas",    autorizar(...ASIGNACION),             ctrl.listarAnalistas);
router.get("/mesa-control", autorizar(...MESA_CONTROL),           ctrl.listarMesaControl);
router.get("/asignacion",   autorizar(...ASIGNACION),             ctrl.listarAsignacion);
router.get("/mis-casos",    autorizar("ANALISTA"),                ctrl.listarMisCasos);
router.get("/validacion",   autorizar(...VALIDACION),             ctrl.listarValidacion);
router.get("/comite",       autorizar(...VALIDACION),             ctrl.listarComite);
router.get("/:id",          autorizar(...LECTURA),                ctrl.obtenerPorId);

// ─── Asignación (bulk / reasignación) ────────────────────────────────────────
router.post("/asignar",
  autorizar(...ASIGNACION), validate(asignarAnalistasSchema), ctrl.asignarAnalistas);

// ─── Transiciones ────────────────────────────────────────────────────────────
// Mesa de Control
router.patch("/:id/regresar-aprobacion",
  autorizar(...MESA_CONTROL), validate(accionConMotivoSchema), ctrl.regresarAAprobacion);
router.patch("/:id/pasar-asignacion",
  autorizar(...MESA_CONTROL), validate(accionOpcionalSchema), ctrl.pasarAAsignacion);

// Analista
router.patch("/:id/enviar-validacion",
  autorizar("ADMIN", "ANALISTA"), validate(accionOpcionalSchema), ctrl.enviarAValidacion);

// Validación
router.patch("/:id/regresar-analista",
  autorizar(...VALIDACION), validate(accionConMotivoSchema), ctrl.regresarAAnalista);
router.patch("/:id/enviar-comite",
  autorizar(...VALIDACION), validate(accionOpcionalSchema), ctrl.enviarAComite);

// Comité
router.patch("/:id/regresar-validacion",
  autorizar(...VALIDACION), validate(accionConMotivoSchema), ctrl.regresarAValidacion);
router.patch("/:id/aprobar",
  autorizar(...VALIDACION), validate(accionOpcionalSchema), ctrl.aprobar);

export default router;
