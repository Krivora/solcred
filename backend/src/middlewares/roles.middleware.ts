import { Response, NextFunction } from "express";
import { RequestAutenticado } from "./auth.middleware";
import { AppError } from "./error.middleware";
import { RolAplicacion } from "../utils/jwt"; // ajustar ruta relativa si difiere

export type { RolAplicacion };

export const autorizar =
  (...roles: RolAplicacion[]) =>
  (req: RequestAutenticado, _res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      throw new AppError("No autorizado", 401);
    }

    if (!roles.includes(req.usuario.rol)) {
      throw new AppError("No tienes permisos para esta acción", 403);
    }

    next();
  };

const METODOS_ESCRITURA = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// Endpoints que usan POST/PATCH pero NO mutan estado (previews, exportaciones,
// generación de PDF a partir del payload): el rol de solo lectura sí puede
// invocarlos.
const RUTAS_LECTURA_NO_GET: RegExp[] = [
  /\/reportes\/solicitudes\/(previsualizar|exportar)$/,
  /\/analisis\/[^/]+\/informe-ejecutivo$/,
];

// Auto-servicio de Soporte: SUPERVISOR sí puede abrir y dar seguimiento a SUS
// PROPIOS tickets (crear, comentar, cerrar, reabrir, calificar). El módulo de
// soporte, en el service, rechaza igualmente estas acciones sobre tickets de
// terceros — este allowlist solo abre la puerta a nivel de método/ruta.
const RUTAS_AUTOSERVICIO_SUPERVISOR: RegExp[] = [
  /\/soporte\/tickets$/,
  /\/soporte\/tickets\/[^/]+\/(comentarios|cerrar|reabrir|calificar)$/,
];

/**
 * El rol `SUPERVISOR` es un "ADMIN de solo lectura": ve todo lo que ve un
 * administrador pero no ejecuta ninguna acción. Este guard bloquea cualquier
 * método de escritura salvo los POST/PATCH que en realidad son de lectura.
 *
 * Debe montarse DESPUÉS de `autenticar` (necesita `req.usuario`).
 */
export const soloLecturaSupervisor = (
  req: RequestAutenticado,
  _res: Response,
  next: NextFunction
): void => {
  if (req.usuario?.rol !== "SUPERVISOR" || !METODOS_ESCRITURA.has(req.method)) {
    return next();
  }

  const ruta = req.originalUrl.split("?")[0];
  if (
    RUTAS_LECTURA_NO_GET.some((re) => re.test(ruta)) ||
    RUTAS_AUTOSERVICIO_SUPERVISOR.some((re) => re.test(ruta))
  ) {
    return next();
  }

  throw new AppError(
    "El rol Supervisor es de solo lectura: no puede ejecutar acciones",
    403,
    "SOLO_LECTURA"
  );
};