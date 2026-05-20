import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export const hashContrasena = (contrasena: string): Promise<string> =>
  bcrypt.hash(contrasena, SALT_ROUNDS);

export const verificarContrasena = (
  contrasena: string,
  hash: string
): Promise<boolean> => bcrypt.compare(contrasena, hash);