// src/modules/asignacion/asignacion.router.ts

import { Router } from "express";
import { autenticar } from "@middlewares/auth.middleware";
import { autorizar } from "@middlewares/roles.middleware";
import { validate } from "@middlewares/validate.middleware";
import {
    crearGrupoSchema,
    actualizarGrupoSchema,
    asignarManualSchema,
} from "./asignacion.schema";
import * as asignacionController from "./asignacion.controller";

const router = Router();

router.use(autenticar);

// ─── Grupos de gestión — solo ADMIN ──────────────────────────────────────────
router.get(
    "/grupos",
    autorizar("ADMIN"),
    asignacionController.listarGrupos
);

router.get(
    "/grupos/:id",
    autorizar("ADMIN"),
    asignacionController.obtenerGrupoPorId
);

router.post(
    "/grupos",
    autorizar("ADMIN"),
    validate(crearGrupoSchema),
    asignacionController.crearGrupo
);

router.put(
    "/grupos/:id",
    autorizar("ADMIN"),
    validate(actualizarGrupoSchema),
    asignacionController.actualizarGrupo
);

router.delete(
    "/grupos/:id",
    autorizar("ADMIN"),
    asignacionController.eliminarGrupo
);

// ─── Carga de gestores — ADMIN y ANALISTA ────────────────────────────────────
router.get(
    "/gestores/carga",
    autorizar("ADMIN", "ANALISTA"),
    asignacionController.obtenerCargaGestores
);

// ─── Asignación de solicitudes — ADMIN y ANALISTA ────────────────────────────
router.post(
    "/solicitudes/:solicitudId/automatica",
    autorizar("ADMIN", "ANALISTA"),
    asignacionController.asignarAutomaticamente
);

router.post(
    "/solicitudes/:solicitudId/manual",
    autorizar("ADMIN", "ANALISTA"),
    validate(asignarManualSchema),
    asignacionController.asignarManualmente
);

export default router;