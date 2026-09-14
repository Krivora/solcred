import { Router } from "express";
import { z } from "zod";
import { autenticar } from "@middlewares/auth.middleware";
import { validate } from "@middlewares/validate.middleware";
import * as ctrl from "./notificaciones.controller";

const router = Router();

const paramsId = z.object({ id: z.string().uuid("id inválido") });

// Sin restricción de rol: CLIENTE y PERSONAL leen su propia bandeja.
router.use(autenticar);

router.get("/", ctrl.listar);
router.get("/no-leidas/contador", ctrl.contador);
router.patch("/leidas", ctrl.marcarTodasLeidas);
router.patch("/:id/leida", validate(paramsId, "params"), ctrl.marcarLeida);

export default router;
