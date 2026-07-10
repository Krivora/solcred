// solicitudes.routes.ts (solicitantes)
import { Router } from "express";
import { autenticar } from "@middlewares/auth.middleware";
import { autorizar } from "@middlewares/roles.middleware";
import { validate } from "@middlewares/validate.middleware";
import {
    crearSolicitudSchema,
    guardarDatosGeneralesSchema,
    guardarDatosSolicitanteSchema,
    guardarDatosAvalSchema,
    guardarDatosCreditoSchema,
} from "./solicitudes.schema";
import * as solicitudesController from "./solicitudes.controller";
const router = Router();

router.use(autenticar);

router.get("/", solicitudesController.listar);
router.post("/", autorizar("CLIENTE"), validate(crearSolicitudSchema), solicitudesController.crear);
router.get("/:id", solicitudesController.obtenerPorId);
router.put("/:id/generales", autorizar("CLIENTE"), validate(guardarDatosGeneralesSchema), solicitudesController.guardarDatosGenerales);
router.put("/:id/solicitante", autorizar("CLIENTE"), validate(guardarDatosSolicitanteSchema), solicitudesController.guardarDatosSolicitante);
router.put("/:id/aval", autorizar("CLIENTE"), validate(guardarDatosAvalSchema), solicitudesController.guardarDatosAval);
router.put("/:id/credito", autorizar("CLIENTE"), validate(guardarDatosCreditoSchema), solicitudesController.guardarDatosCredito);
router.patch("/:id/enviar", autorizar("CLIENTE"), solicitudesController.enviar);

export default router;