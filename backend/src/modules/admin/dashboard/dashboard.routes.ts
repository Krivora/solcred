import { Router } from "express";
import { autenticar } from "@middlewares/auth.middleware";
import { autorizar, soloLecturaSupervisor } from "@middlewares/roles.middleware";
import * as ctrl from "./dashboard.controller";

const router = Router();

router.use(autenticar);
router.use(soloLecturaSupervisor);

// Panorama ejecutivo — dashboard de Inicio. ADMIN y SUPERVISOR (solo lectura).
router.get("/", autorizar("ADMIN", "SUPERVISOR"), ctrl.panorama);

export default router;
