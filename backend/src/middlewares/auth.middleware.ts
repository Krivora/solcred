import { Request, Response, NextFunction } from "express";
import { verificarToken, JwtPayload } from "../utils/jwt";
import { AppError } from "./error.middleware";

export interface RequestAutenticado extends Request {
  usuario?: JwtPayload;
}

export const autenticar = (
  req: RequestAutenticado,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError("No autorizado", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    req.usuario = verificarToken(token);
    next();
  } catch {
    throw new AppError("Token inválido o expirado", 401);
  }
};