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