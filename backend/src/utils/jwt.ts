import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET as string;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "8h";

export interface JwtPayload {
  id: string;
  rol: string;
}

export const generarToken = (payload: JwtPayload): string =>
  jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN } as jwt.SignOptions);

export const verificarToken = (token: string): JwtPayload =>
  jwt.verify(token, SECRET) as JwtPayload;