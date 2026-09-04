import { Router } from "express";
import rateLimit from "express-rate-limit";
import { autenticar } from "@middlewares/auth.middleware";
import { autorizar, soloLecturaSupervisor } from "@middlewares/roles.middleware";
import * as logsController from "./logs.controller";

const router = Router();

router.use(autenticar);
router.use(soloLecturaSupervisor);
router.use(autorizar("ADMIN", "SUPERVISOR"));

// El log de auditoría trae correo/IP en bloque: límite propio, igual que la
// exportación de reportes de negocio.
const limitadorExportar = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Demasiadas exportaciones, intenta más tarde" },
});

router.get("/", logsController.listar);
router.get("/resumen", logsController.resumen);
// Antes de "/:id" — si no, Express interpreta "exportar" como un id.
router.get("/exportar", limitadorExportar, logsController.exportar);
router.get("/:id", logsController.obtenerPorId);

export default router;
