import { Router } from "express";
import { autenticar } from "@middlewares/auth.middleware";
import { autorizar } from "@middlewares/roles.middleware";
import { validate } from "@middlewares/validate.middleware";
import { asignarManualSchema } from "./asignacion.schema";
import * as asignacionController from "./asignacion.controller";

const router = Router();

router.use(autenticar);
router.use(autorizar("ADMIN", "ANALISTA"));

router.get("/solicitudes", asignacionController.listarSolicitudesAsignacion);
router.get("/gestores/carga", asignacionController.obtenerCargaGestores);

router.post(
    "/solicitudes/automatica",
    asignacionController.asignarAutomaticamente
);

router.post(
    "/solicitudes/:solicitudId/manual",
    validate(asignarManualSchema),
    asignacionController.asignarManualmente
);

export default router;