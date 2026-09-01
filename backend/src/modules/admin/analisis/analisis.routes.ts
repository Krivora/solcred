import { Router } from "express";
import { autenticar } from "@middlewares/auth.middleware";
import { autorizar } from "@middlewares/roles.middleware";
import * as ctrl from "./analisis.controller";

const router = Router();

router.use(autenticar);

router.get("/:solicitudId", autorizar("ADMIN", "ANALISTA", "SUPERVISOR"), ctrl.obtener);
router.patch("/:solicitudId", autorizar("ADMIN", "ANALISTA"), ctrl.guardarTab);
router.post(
  "/:solicitudId/informe-ejecutivo",
  autorizar("ADMIN", "ANALISTA", "SUPERVISOR"),
  ctrl.generarInformeEjecutivo
);

export default router;
