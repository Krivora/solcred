import { Router } from "express";
import { autenticar } from "@middlewares/auth.middleware";
import { autorizar } from "@middlewares/roles.middleware";
import { validate } from "@middlewares/validate.middleware";
import { crearGrupoSchema, actualizarGrupoSchema } from "./grupos.schema";
import * as gruposController from "./grupos.controller";

const router = Router();

router.use(autenticar);
router.use(autorizar("ADMIN"));

router.get("/", gruposController.listarGrupos);
router.get("/:id", gruposController.obtenerGrupoPorId);
router.post("/", validate(crearGrupoSchema), gruposController.crearGrupo);
router.put("/:id", validate(actualizarGrupoSchema), gruposController.actualizarGrupo);
router.delete("/:id", gruposController.eliminarGrupo);

export default router;