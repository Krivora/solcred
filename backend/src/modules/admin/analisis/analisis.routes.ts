import { Router } from "express";
import { autenticar } from "@middlewares/auth.middleware";
import { autorizar, soloLecturaSupervisor } from "@middlewares/roles.middleware";
import * as ctrl from "./analisis.controller";

const router = Router();

router.use(autenticar);
router.use(soloLecturaSupervisor);

router.get("/:solicitudId", autorizar("ADMIN", "ANALISTA", "SUPERVISOR", "ENCARGADO_FINANCIAMIENTO"), ctrl.obtener);
router.patch("/:solicitudId", autorizar("ADMIN", "ANALISTA"), ctrl.guardarTab);
router.post(
  "/:solicitudId/informe-ejecutivo",
  autorizar("ADMIN", "ANALISTA", "SUPERVISOR", "ENCARGADO_FINANCIAMIENTO"),
  ctrl.generarInformeEjecutivo
);

export default router;
