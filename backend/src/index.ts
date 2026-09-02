import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { httpLogger } from "./utils/logger";
import { errorMiddleware } from "./middlewares/error.middleware";
import authRoutes from "./modules/auth/auth.routes";
import usuariosRoutes from "./modules/admin/usuarios/usuarios.routes";
import programasRoutes from "./modules/admin/programas/programas.routes";
import promocionRoutes from "./modules/admin/promocion/promocion.routes";
import financiamientoRoutes from "./modules/admin/financiamiento/financiamiento.routes";
import analisisRoutes from "./modules/admin/analisis/analisis.routes";
import dashboardRoutes from "./modules/admin/dashboard/dashboard.routes";
import asignacionRoutes from "./modules/admin/asignacion/asignacion.routes"
import grupoRoutes from "./modules/admin/grupos/grupos.routes"
import logsRoutes from "./modules/admin/logs/logs.routes";
import reportesRoutes from "./modules/admin/reportes/reportes.routes";

import expedienteRoutes from "./modules/expediente/expediente.routes";
import uploadsRouter from "./modules/uploads/uploads.routes";
import solicitudesRoutes from "./modules/clientes/solicitudes/solicitudes.routes";
import soporteRoutes from "./modules/soporte/soporte.routes";
import crmRoutes from "./modules/crm/crm.routes";

const app = express();
const PORT = process.env.PORT ?? 4000;

// Detrás de un proxy (Nginx / load balancer) el rate-limit y el registro de IP
// de auditoría necesitan confiar en `X-Forwarded-For`. Se limita a los saltos
// declarados (número), nunca `true` (que aceptaría un XFF falsificado por el
// cliente). `TRUST_PROXY=0` lo desactiva para correr sin proxy.
const TRUST_PROXY = Number(process.env.TRUST_PROXY ?? 1);
app.set("trust proxy", Number.isFinite(TRUST_PROXY) ? TRUST_PROXY : 1);

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
app.use(cookieParser());

// ── Logger ─────────────────────────────────
app.use(httpLogger);

// ── Rutas Compartidas ──────────────────────────────────
app.use("/api/auth", authRoutes);

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


app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});

export default app;