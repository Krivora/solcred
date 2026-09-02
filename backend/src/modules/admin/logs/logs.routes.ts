import { Router } from "express";
import { autenticar } from "@middlewares/auth.middleware";
import { autorizar, soloLecturaSupervisor } from "@middlewares/roles.middleware";
import * as logsController from "./logs.controller";

const router = Router();

router.use(autenticar);
router.use(soloLecturaSupervisor);
router.use(autorizar("ADMIN", "SUPERVISOR"));

router.get("/", logsController.listar);
router.get("/resumen", logsController.resumen);
router.get("/:id", logsController.obtenerPorId);

export default router;