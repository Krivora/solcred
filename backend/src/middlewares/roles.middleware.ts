import { Response, NextFunction } from "express";
import { RequestAutenticado } from "./auth.middleware";
import { AppError } from "./error.middleware";
import { Rol } from "../../generated/prisma/client";

export const autorizar =
  (...roles: Rol[]) =>
  (req: RequestAutenticado, _res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      throw new AppError("No autorizado", 401);
    }

    if (!roles.includes(req.usuario.rol as Rol)) {
      throw new AppError("No tienes permisos para esta acción", 403);
    }

    next();
  };