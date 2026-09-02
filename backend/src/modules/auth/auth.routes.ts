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

// Fuerza bruta de credenciales: se cuentan solo los intentos fallidos, así un
// usuario legítimo que se equivoca un par de veces no queda bloqueado tras
// entrar bien.
const limitadorLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Demasiados intentos de inicio de sesión, intenta más tarde",
  },
});

// Alta masiva de cuentas desde una misma red.
const limitadorRegistro = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Demasiados registros desde esta red, intenta más tarde",
  },
});

router.post("/registro", limitadorRegistro, validate(registroSchema), authController.registro);
router.post("/login", limitadorLogin, validate(loginSchema), authController.login);
router.post("/refresh", limitadorRefresh, authController.refresh);
router.post("/logout", authController.logout);
router.get("/perfil", autenticar, authController.perfil);

export default router;
