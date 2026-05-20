import { Router } from "express";
import { autenticar } from "../../middlewares/auth.middleware";
import { autorizar } from "../../middlewares/roles.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  crearProgramaSchema,
  actualizarProgramaSchema,
  agregarDocumentoSchema,
  crearTipoDocumentoSchema,
} from "./programas.schema";
import * as programasController from "./programas.controller";

const router = Router();

router.use(autenticar);

// Tipos de documento
router.get("/tipos-documento", programasController.listarTiposDocumento);
router.post(
  "/tipos-documento",
  autorizar("ADMIN"),
  validate(crearTipoDocumentoSchema),
  programasController.crearTipoDocumento
);

// Programas — lectura para todos
router.get("/", programasController.listar);
router.get("/:id", programasController.obtenerPorId);

// Programas — escritura solo ADMIN
router.post("/", autorizar("ADMIN"), validate(crearProgramaSchema), programasController.crear);
router.put("/:id", autorizar("ADMIN"), validate(actualizarProgramaSchema), programasController.actualizar);
router.patch("/:id/desactivar", autorizar("ADMIN"), programasController.desactivar);
router.patch("/:id/activar", autorizar("ADMIN"), programasController.activar);

// Documentos del programa
router.post("/:id/documentos", autorizar("ADMIN"), validate(agregarDocumentoSchema), programasController.agregarDocumento);
router.delete("/:id/documentos/:tipoDocumentoId", autorizar("ADMIN"), programasController.eliminarDocumento);

export default router;