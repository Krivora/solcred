import { Request, Response, NextFunction } from "express";
import { verificarToken, JwtPayload, TokenExpiradoError } from "../utils/jwt";
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
  } catch (error) {
    if (error instanceof TokenExpiradoError) {
      // El cliente usa este código para disparar el refresh transparente.
      throw new AppError("Token expirado", 401, "TOKEN_EXPIRADO");
    }
    throw new AppError("Token inválido", 401);
  }
};