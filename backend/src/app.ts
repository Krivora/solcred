import { env } from "./config/env"; // primero: valida el entorno (fail-fast)
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import prisma from "./config/db";
import { httpLogger } from "./utils/logger";
import { errorMiddleware } from "./middlewares/error.middleware";
import authRoutes from "./modules/auth/auth.routes";
import programasPublicoRoutes from "./modules/public/programas-publico.routes";
import usuariosRoutes from "./modules/admin/usuarios/usuarios.routes";
import programasRoutes from "./modules/admin/programas/programas.routes";
import promocionRoutes from "./modules/admin/promocion/promocion.routes";
import financiamientoRoutes from "./modules/admin/financiamiento/financiamiento.routes";
import analisisRoutes from "./modules/admin/analisis/analisis.routes";
import dashboardRoutes from "./modules/admin/dashboard/dashboard.routes";
import asignacionRoutes from "./modules/admin/asignacion/asignacion.routes";
import grupoRoutes from "./modules/admin/grupos/grupos.routes";
import logsRoutes from "./modules/admin/logs/logs.routes";
import reportesRoutes from "./modules/admin/reportes/reportes.routes";

import expedienteRoutes from "./modules/expediente/expediente.routes";
import uploadsRouter from "./modules/uploads/uploads.routes";
import solicitudesRoutes from "./modules/clientes/solicitudes/solicitudes.routes";
import soporteRoutes from "./modules/soporte/soporte.routes";
import crmRoutes from "./modules/crm/crm.routes";

const app = express();

// Detrás de un proxy (Nginx / load balancer) el rate-limit y el registro de IP
// de auditoría necesitan confiar en `X-Forwarded-For`. Se limita a los saltos
// declarados (número), nunca `true` (que aceptaría un XFF falsificado por el
// cliente). `TRUST_PROXY=0` lo desactiva para correr sin proxy.
app.set("trust proxy", env.TRUST_PROXY);

// ── Seguridad ──────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
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
app.use(cookieParser());

// ── Logger ─────────────────────────────────
app.use(httpLogger);

// ── Health checks (para el proveedor / load balancer y el CD) ──
// Liveness: el proceso responde. No toca dependencias.
app.get("/api/health", (_req, res) => {
  res.status(200).json({ success: true, message: "ok", data: { uptime: process.uptime() } });
});

// Readiness: además la BD responde. Un 503 aquí saca la instancia de rotación
// sin matar el proceso.
app.get("/api/health/ready", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ success: true, message: "ready", data: { db: "up" } });
  } catch {
    res.status(503).json({ success: false, message: "BD no disponible", data: { db: "down" } });
  }
});

// ── Rutas Compartidas ──────────────────────────────────
app.use("/api/auth", authRoutes);

// ── Rutas públicas (sin sesión) ─────────────────────────
// Simulador de crédito, corre antes de que la persona tenga cuenta.
app.use("/api/public/programas", programasPublicoRoutes);

// ── Rutas Adminstracion ──────────────────────────────────
app.use("/api/admin/analisis", analisisRoutes);
app.use("/api/admin/asignacion", asignacionRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin/financiamiento", financiamientoRoutes);
app.use("/api/admin/grupos", grupoRoutes);
app.use("/api/admin/logs", logsRoutes);
app.use("/api/admin/programas", programasRoutes);
app.use("/api/admin/promocion", promocionRoutes);
app.use("/api/admin/reportes", reportesRoutes);
app.use("/api/admin/usuarios", usuariosRoutes);

app.use("/api/expediente", expedienteRoutes);
app.use("/api/uploads", uploadsRouter);
// ── Rutas Solicitantes ──────────────────────────────────
app.use("/api/clientes/solicitudes", solicitudesRoutes);

// ── Soporte (tickets) — cliente y staff ─────────────────
app.use("/api/soporte", soporteRoutes);

// ── CRM (comunicaciones con el cliente) — solo staff ────
app.use("/api/crm", crmRoutes);

// ── 404 ────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Ruta no encontrada" });
});

// ── Errores ────────────────────────────────
app.use(errorMiddleware);

export default app;
