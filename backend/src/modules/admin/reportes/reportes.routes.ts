import { Router } from "express";
import rateLimit from "express-rate-limit";
import { autenticar } from "@middlewares/auth.middleware";
import { autorizar, soloLecturaSupervisor } from "@middlewares/roles.middleware";
import { validate } from "@middlewares/validate.middleware";
import { filtrosReporteSchema, previsualizarReporteSchema } from "./reportes.schema";
import * as ctrl from "./reportes.controller";

const router = Router();

router.use(autenticar);
router.use(soloLecturaSupervisor);

// La exportación entrega datos personales (RFC, CURP, teléfono, correo) en
// bloque: límite propio, más estricto que el global de la API.
const limitadorExportar = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Demasiadas exportaciones, intenta más tarde" },
});

// Reportes de negocio — ADMIN y SUPERVISOR (solo lectura: previsualizar y
// exportar no mutan estado, pasan el guard vía allowlist).
router.get("/catalogos", autorizar("ADMIN", "SUPERVISOR"), ctrl.catalogos);
router.post("/solicitudes/previsualizar", autorizar("ADMIN", "SUPERVISOR"), validate(previsualizarReporteSchema), ctrl.previsualizar);
router.post(
  "/solicitudes/exportar",
  autorizar("ADMIN", "SUPERVISOR"),
  limitadorExportar,
  validate(filtrosReporteSchema),
  ctrl.exportar,
);

export default router;
