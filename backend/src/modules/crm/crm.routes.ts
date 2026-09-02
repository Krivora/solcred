import { Router } from "express";
import { z } from "zod";
import { autenticar } from "@middlewares/auth.middleware";
import { autorizar, soloLecturaSupervisor } from "@middlewares/roles.middleware";
import { validate } from "@middlewares/validate.middleware";
import * as ctrl from "./crm.controller";
import { crearComunicacionSchema, editarComunicacionSchema } from "./crm.schema";

const router = Router();

const paramsSolicitud = z.object({
  solicitudId: z.string().uuid("solicitudId inválido"),
});
const paramsId = z.object({ id: z.string().uuid("id inválido") });

// Puerta a nivel de rol; el acceso fino por solicitud (gestor/analista asignado)
// se resuelve en el service. CLIENTE y SOPORTE quedan fuera.
const rolesCrm = autorizar(
  "ADMIN",
  "SUPERVISOR",
  "GESTOR",
  "ANALISTA",
  "ENCARGADO_PROMOCION",
  "ENCARGADO_FINANCIAMIENTO",
  "MESA_CONTROL"
);

router.use(autenticar);
router.use(soloLecturaSupervisor); // SUPERVISOR = solo lectura
router.use(rolesCrm);

// La query (solicitudId | clienteId) se valida dentro del service.
router.get("/comunicaciones", ctrl.listar);
router.post("/comunicaciones", validate(crearComunicacionSchema), ctrl.crear);
router.patch(
  "/comunicaciones/:id",
  validate(paramsId, "params"),
  validate(editarComunicacionSchema),
  ctrl.editar
);
router.get(
  "/solicitudes/:solicitudId/resumen",
  validate(paramsSolicitud, "params"),
  ctrl.resumen
);

export default router;
