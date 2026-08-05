import jwt from "jsonwebtoken";
import { Rol } from "../../generated/prisma/client";

const SECRET = process.env.JWT_SECRET as string;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "8h";

/** Roles que puede traer un token válido: los de staff (Prisma) + CLIENTE. */
export type RolAplicacion = Rol | "CLIENTE";

export interface JwtPayload {
  id: string;
  personalId?: string;
  rol: RolAplicacion;
  tipoUsuario: "CLIENTE" | "PERSONAL";
}

export const generarToken = (payload: JwtPayload): string =>
  jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN } as jwt.SignOptions);

export const verificarToken = (token: string): JwtPayload =>
  jwt.verify(token, SECRET) as JwtPayload;