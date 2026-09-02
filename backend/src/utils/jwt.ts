import jwt from "jsonwebtoken";
import { Rol } from "../../generated/prisma/client";

const SECRET = process.env.JWT_SECRET as string;

// El access token es de vida corta: se renueva de forma transparente con el
// refresh token (cookie httpOnly). `JWT_EXPIRES_IN` se mantiene como respaldo
// para no romper entornos que aún no definen `JWT_ACCESS_EXPIRES_IN`.
const EXPIRES_IN =
  process.env.JWT_ACCESS_EXPIRES_IN ?? process.env.JWT_EXPIRES_IN ?? "15m";

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
  jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN } as jwt.SignOptions);

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
