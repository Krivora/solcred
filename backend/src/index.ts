import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { httpLogger } from "./utils/logger";
import { errorMiddleware } from "./middlewares/error.middleware";
import authRoutes from "./modules/auth/auth.routes";
import usuariosRoutes from "./modules/usuarios/usuarios.routes";
import programasRoutes from "./modules/programas/programas.routes";
import solicitudesRoutes from "./modules/solicitudes/solicitudes.routes";
import asignacionRoutes from "./modules/asignacion/asignacion.routes"
import logsRoutes from "./modules/logs/logs.routes";

const app = express();
const PORT = process.env.PORT ?? 4000;

// ── Seguridad ──────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: {
      success: false,
      message: "Demasiadas solicitudes, intenta más tarde",
    },
  })
);

// ── Parsers ────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Logger ─────────────────────────────────
app.use(httpLogger);

// ── Rutas ──────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/programas", programasRoutes);
app.use("/api/solicitudes", solicitudesRoutes);
app.use("/api/asignacion", asignacionRoutes);
app.use("/api/logs", logsRoutes);

// ── 404 ────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Ruta no encontrada" });
});

// ── Errores ────────────────────────────────
app.use(errorMiddleware);


app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});

export default app;