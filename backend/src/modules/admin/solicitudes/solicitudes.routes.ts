import { Router } from "express";
import { autenticar } from "@middlewares/auth.middleware";
import { autorizar } from "@middlewares/roles.middleware";
import { validate } from "@middlewares/validate.middleware";
import {
  cambiarEstatusSchema,
} from "./solicitudes.schema";
import * as solicitudesController from "./solicitudes.controller";

const router = Router();

router.use(autenticar);

// ─── Módulo de promoción — DEBEN ir antes de /:id ───────────────────────────
router.get("/promocion/stats", autorizar("ADMIN", "ANALISTA"), solicitudesController.statsPromocion);
router.get("/promocion", autorizar("ADMIN", "ANALISTA"), solicitudesController.listarPromocion);
router.get("/", solicitudesController.listar);
router.get("/:id", solicitudesController.obtenerPorId);
router.patch("/:id/estatus", autorizar("ADMIN", "ANALISTA"), validate(cambiarEstatusSchema), solicitudesController.cambiarEstatus);

export default router;