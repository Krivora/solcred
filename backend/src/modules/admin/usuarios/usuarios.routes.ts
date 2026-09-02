import { Router } from "express";
import { autenticar } from "@middlewares/auth.middleware";
import { autorizar, soloLecturaSupervisor } from "@middlewares/roles.middleware";
import { validate } from "@middlewares/validate.middleware";
import { actualizarUsuarioSchema, cambiarRolSchema } from "./usuarios.schema";
import * as usuariosController from "./usuarios.controller";

const router = Router();

router.use(autenticar);
router.use(soloLecturaSupervisor);

// Lectura: ADMIN y SUPERVISOR
router.get("/", autorizar("ADMIN", "SUPERVISOR"), usuariosController.listar);
// Escritura: solo ADMIN (el guard ya bloquea a SUPERVISOR de todos modos)
router.patch("/:id/rol", autorizar("ADMIN"), validate(cambiarRolSchema), usuariosController.cambiarRol);
router.patch("/:id/revocar-acceso", autorizar("ADMIN"), usuariosController.revocarAcceso); // ── NUEVO ──
router.patch("/:id/desactivar", autorizar("ADMIN"), usuariosController.desactivar);

// ADMIN, SUPERVISOR o el mismo usuario
router.get("/:id", autorizar("ADMIN", "ANALISTA", "CLIENTE", "SUPERVISOR"), usuariosController.obtenerPorId);
router.put("/:id", autorizar("ADMIN", "CLIENTE"), validate(actualizarUsuarioSchema), usuariosController.actualizar);

export default router;