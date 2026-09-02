import jwt from "jsonwebtoken";
import { Rol } from "../../generated/prisma/client";
import { ttlSesion } from "../config/sesion.config";

const SECRET = process.env.JWT_SECRET as string;

/** Roles que puede traer un token válido: los de staff (Prisma) + CLIENTE. */
export type RolAplicacion = Rol | "CLIENTE";

export interface JwtPayload {
  id: string;
  personalId?: string;
  rol: RolAplicacion;
  tipoUsuario: "CLIENTE" | "PERSONAL";
}

export class TokenExpiradoError extends Error {
  constructor() {
    super("Token expirado");
    this.name = "TokenExpiradoError";
  }
}

export const generarToken = (payload: JwtPayload): string =>
  jwt.sign(payload, SECRET, {
    expiresIn: ttlSesion(payload.rol).accessExpiresIn,
  } as jwt.SignOptions);

export const verificarToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, SECRET) as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new TokenExpiradoError();
    }
    throw error;
  }
};
