import type { RolAplicacion } from "../utils/jwt";

/**
 * Configuración de expiración de sesión por rol. Fuente única: la consumen el
 * emisor de tokens (`utils/jwt`) y el emisor de refresh tokens (`utils/refresh`).
 *
 * El access token dura lo mismo para todos (se renueva de forma transparente).
 * Lo que varía por rol es la ventana deslizante del refresh token: cuanto más
 * poder tiene el rol, antes caduca una sesión inactiva.
 */
export interface TtlSesion {
  /** Vida del access token JWT, en formato de `jsonwebtoken` (ej. "15m"). */
  accessExpiresIn: string;
  /** Vida de la ventana deslizante del refresh token, en días. */
  refreshTtlDias: number;
}

const numPositivo = (valor: string | undefined, porDefecto: number): number => {
  const n = Number(valor);
  return Number.isFinite(n) && n > 0 ? n : porDefecto;
};

const ACCESS_EXPIRES_IN =
  process.env.JWT_ACCESS_EXPIRES_IN ?? process.env.JWT_EXPIRES_IN ?? "15m";

// Ventana de refresh por perfil de riesgo (días). Overridable por env.
const REFRESH_DIAS_CLIENTE = numPositivo(process.env.REFRESH_TTL_DIAS_CLIENTE, 30);
const REFRESH_DIAS_STAFF = numPositivo(process.env.REFRESH_TTL_DIAS, 7);
const REFRESH_DIAS_SENSIBLE = numPositivo(process.env.REFRESH_TTL_DIAS_SENSIBLE, 2);

/**
 * Staff con acceso a acciones sensibles (configuración del catálogo, aprobación,
 * validación, y el rol de solo-lectura total). Sesión inactiva caduca antes.
 */
const ROLES_SENSIBLES: ReadonlySet<RolAplicacion> = new Set<RolAplicacion>([
  "ADMIN",
  "SUPERVISOR",
  "ENCARGADO_PROMOCION",
  "ENCARGADO_FINANCIAMIENTO",
]);

export const ttlSesion = (rol: RolAplicacion): TtlSesion => {
  if (rol === "CLIENTE") {
    return { accessExpiresIn: ACCESS_EXPIRES_IN, refreshTtlDias: REFRESH_DIAS_CLIENTE };
  }
  if (ROLES_SENSIBLES.has(rol)) {
    return { accessExpiresIn: ACCESS_EXPIRES_IN, refreshTtlDias: REFRESH_DIAS_SENSIBLE };
  }
  return { accessExpiresIn: ACCESS_EXPIRES_IN, refreshTtlDias: REFRESH_DIAS_STAFF };
};
