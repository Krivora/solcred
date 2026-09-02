import { Router } from "express";
import rateLimit from "express-rate-limit";
import { validate } from "../../middlewares/validate.middleware";
import { autenticar } from "../../middlewares/auth.middleware";
import { loginSchema, registroSchema } from "./auth.schema";
import * as authController from "./auth.controller";

const router = Router();

// El refresh es de alta frecuencia legítima (una vez cada ~15 min por sesión)
// pero no debe poder usarse para fuerza bruta de tokens opacos.
const limitadorRefresh = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Demasiados intentos de refresco de sesión" },
});

router.post("/registro", validate(registroSchema), authController.registro);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", limitadorRefresh, authController.refresh);
router.post("/logout", authController.logout);
router.get("/perfil", autenticar, authController.perfil);

export default router;
