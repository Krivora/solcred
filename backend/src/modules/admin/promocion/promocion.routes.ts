import { Router } from "express";
import { autenticar } from "@middlewares/auth.middleware";
import { autorizar } from "@middlewares/roles.middleware";
import { validate } from "@middlewares/validate.middleware";
import {
  cambiarEstatusSchema,
} from "./promocion.schema";
import * as solicitudesController from "./promocion.controller";

const router = Router();

router.use(autenticar);

// ─── Rutas específicas PRIMERO — antes de /:id ───────────────────────────────
router.get("/promocion/stats", autorizar("ADMIN", "ANALISTA"), solicitudesController.statsPromocion);
router.get("/promocion", autorizar("ADMIN", "ANALISTA"), solicitudesController.listarPromocion);
router.get("/mis-casos", autorizar("GESTOR"), solicitudesController.listarMisCasos);  // ← aquí

// ─── Rutas con parámetro DESPUÉS ─────────────────────────────────────────────
router.get("/", solicitudesController.listar);
router.get("/:id", solicitudesController.obtenerPorId);
router.patch("/:id/estatus", autorizar("ADMIN", "ANALISTA"), validate(cambiarEstatusSchema), solicitudesController.cambiarEstatus);

export default router;