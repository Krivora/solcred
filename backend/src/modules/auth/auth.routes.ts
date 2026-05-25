import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import { autenticar } from "../../middlewares/auth.middleware";
import { loginSchema, registroSchema } from "./auth.schema";
import * as authController from "./auth.controller";

const router = Router();

router.post(
  "/registro",
  (req, res, next) => {
    console.log("🔥 Entró a /registro");
    console.log("BODY RECIBIDO:", req.body);
    next();
  },
  validate(registroSchema),
  authController.registro
);
router.post("/login", validate(loginSchema), authController.login);
router.get("/perfil", autenticar, authController.perfil);

export default router;