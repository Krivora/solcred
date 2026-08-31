import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { httpLogger } from "./utils/logger";
import { errorMiddleware } from "./middlewares/error.middleware";
import authRoutes from "./modules/auth/auth.routes";
import usuariosRoutes from "./modules/admin/usuarios/usuarios.routes";
import programasRoutes from "./modules/admin/programas/programas.routes";
import promocionRoutes from "./modules/admin/promocion/promocion.routes";
import financiamientoRoutes from "./modules/admin/financiamiento/financiamiento.routes";
import analisisRoutes from "./modules/admin/analisis/analisis.routes";
import asignacionRoutes from "./modules/admin/asignacion/asignacion.routes"
import grupoRoutes from "./modules/admin/grupos/grupos.routes"
import logsRoutes from "./modules/admin/logs/logs.routes";

import expedienteRoutes from "./modules/expediente/expediente.routes";
import uploadsRouter from "./modules/uploads/uploads.routes";
import solicitudesRoutes from "./modules/clientes/solicitudes/solicitudes.routes";

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

// ── Rutas Compartidas ──────────────────────────────────
app.use("/api/auth", authRoutes);

// ── Rutas Adminstracion ──────────────────────────────────
app.use("/api/admin/analisis", analisisRoutes);
app.use("/api/admin/asignacion", asignacionRoutes);
app.use("/api/admin/financiamiento", financiamientoRoutes);
app.use("/api/admin/grupos", grupoRoutes);
app.use("/api/admin/logs", logsRoutes);
app.use("/api/admin/programas", programasRoutes);
app.use("/api/admin/promocion", promocionRoutes);
app.use("/api/admin/usuarios", usuariosRoutes);

app.use("/api/expediente", expedienteRoutes);
app.use("/api/uploads", uploadsRouter);
// ── Rutas Solicitantes ──────────────────────────────────
app.use("/api/clientes/solicitudes", solicitudesRoutes);


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