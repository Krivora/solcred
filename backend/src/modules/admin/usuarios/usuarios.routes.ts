import { Router } from "express";
import { autenticar } from "@middlewares/auth.middleware";
import { autorizar } from "@middlewares/roles.middleware";
import { validate } from "@middlewares/validate.middleware";
import { actualizarUsuarioSchema, cambiarRolSchema } from "./usuarios.schema";
import * as usuariosController from "./usuarios.controller";

const router = Router();

router.use(autenticar);

// Solo ADMIN
router.get("/", autorizar("ADMIN"), usuariosController.listar);
router.patch("/:id/rol", autorizar("ADMIN"), validate(cambiarRolSchema), usuariosController.cambiarRol);
router.patch("/:id/revocar-acceso", autorizar("ADMIN"), usuariosController.revocarAcceso); // ── NUEVO ──
router.patch("/:id/desactivar", autorizar("ADMIN"), usuariosController.desactivar);

// ADMIN o el mismo usuario
router.get("/:id", autorizar("ADMIN", "ANALISTA", "CLIENTE"), usuariosController.obtenerPorId);
router.put("/:id", autorizar("ADMIN", "CLIENTE"), validate(actualizarUsuarioSchema), usuariosController.actualizar);

export default router;