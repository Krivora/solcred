import { Router } from "express";
import { autenticar } from "@middlewares/auth.middleware";
import { autorizar } from "@middlewares/roles.middleware";
import { validate } from "@middlewares/validate.middleware";
import {
  crearSolicitudSchema,
  guardarDatosGeneralesSchema,
  guardarDatosSolicitanteSchema,
  guardarDatosAvalSchema,
  cambiarEstatusSchema,
} from "./solicitudes.schema";
import * as solicitudesController from "./solicitudes.controller";

const router = Router();

router.use(autenticar);

router.get("/", solicitudesController.listar);
router.get("/:id", solicitudesController.obtenerPorId);
router.post("/", autorizar("CLIENTE"), validate(crearSolicitudSchema), solicitudesController.crear);

router.put("/:id/generales", autorizar("CLIENTE"), validate(guardarDatosGeneralesSchema), solicitudesController.guardarDatosGenerales);
router.put("/:id/solicitante", autorizar("CLIENTE"), validate(guardarDatosSolicitanteSchema), solicitudesController.guardarDatosSolicitante);
router.put("/:id/aval", autorizar("CLIENTE"), validate(guardarDatosAvalSchema), solicitudesController.guardarDatosAval);
router.patch("/:id/enviar", autorizar("CLIENTE"), solicitudesController.enviar);

export default router;