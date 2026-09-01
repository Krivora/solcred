import { Router } from "express";
import { autenticar } from "@middlewares/auth.middleware";
import { autorizar } from "@middlewares/roles.middleware";
import * as ctrl from "./dashboard.controller";

const router = Router();

router.use(autenticar);

// Panorama ejecutivo — dashboard de Inicio. Solo ADMIN.
router.get("/", autorizar("ADMIN"), ctrl.panorama);

export default router;
