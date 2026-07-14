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
    guardarDatosGarantiaSchema,
    guardarDatosNegocioSchema,
    guardarDatosMercadoSchema,
    guardarDatosBancariosSchema,
} from "./solicitudes.schema";
import * as solicitudesController from "./solicitudes.controller";
const router = Router();

router.use(autenticar);

router.get("/", solicitudesController.listar);
router.post("/", autorizar("CLIENTE"), validate(crearSolicitudSchema), solicitudesController.crear);
router.get("/:id", solicitudesController.obtenerPorId);
router.get("/:id/pdf", solicitudesController.descargarPDF);
router.put("/:id/generales", autorizar("CLIENTE"), validate(guardarDatosGeneralesSchema), solicitudesController.guardarDatosGenerales);
router.put("/:id/solicitante", autorizar("CLIENTE"), validate(guardarDatosSolicitanteSchema), solicitudesController.guardarDatosSolicitante);
router.put("/:id/aval", autorizar("CLIENTE"), validate(guardarDatosAvalSchema), solicitudesController.guardarDatosAval);
router.put("/:id/credito", autorizar("CLIENTE"), validate(guardarDatosCreditoSchema), solicitudesController.guardarDatosCredito);
router.put("/:id/garantia", autorizar("CLIENTE"), validate(guardarDatosGarantiaSchema), solicitudesController.guardarDatosGarantia);
router.put("/:id/negocio",autorizar("CLIENTE"),validate(guardarDatosNegocioSchema),solicitudesController.guardarDatosNegocio);
router.put("/:id/mercado",autorizar("CLIENTE"),validate(guardarDatosMercadoSchema),solicitudesController.guardarDatosMercado);
router.put("/:id/bancarios",autorizar("CLIENTE"),validate(guardarDatosBancariosSchema),solicitudesController.guardarDatosBancarios);
router.patch("/:id/enviar", autorizar("CLIENTE"), solicitudesController.enviar);

export default router;