import { Router } from "express";
import rateLimit from "express-rate-limit";
import { autenticar } from "@middlewares/auth.middleware";
import { autorizar } from "@middlewares/roles.middleware";
import { validate } from "@middlewares/validate.middleware";
import { filtrosReporteSchema, previsualizarReporteSchema } from "./reportes.schema";
import * as ctrl from "./reportes.controller";

const router = Router();

router.use(autenticar);

// La exportación entrega datos personales (RFC, CURP, teléfono, correo) en
// bloque: límite propio, más estricto que el global de la API.
const limitadorExportar = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Demasiadas exportaciones, intenta más tarde" },
});

// Reportes de negocio — solo ADMIN, igual que el panorama ejecutivo.
router.get("/catalogos", autorizar("ADMIN"), ctrl.catalogos);
router.post("/solicitudes/previsualizar", autorizar("ADMIN"), validate(previsualizarReporteSchema), ctrl.previsualizar);
router.post(
  "/solicitudes/exportar",
  autorizar("ADMIN"),
  limitadorExportar,
  validate(filtrosReporteSchema),
  ctrl.exportar,
);

export default router;
