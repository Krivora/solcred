import crypto from "crypto";
import type { CookieOptions } from "express";

/** Nombre de la cookie httpOnly que transporta el refresh token. */
export const REFRESH_COOKIE = "sc_refresh";

/** Ruta a la que se limita la cookie: solo los endpoints que la consumen. */
export const REFRESH_COOKIE_PATH = "/api/auth";

/** Vida del refresh token, en días. Ventana deslizante: se renueva en cada uso. */
export const REFRESH_TTL_DIAS = Number(process.env.REFRESH_TTL_DIAS ?? 7);

const MS_DIA = 24 * 60 * 60 * 1000;

/** Genera un refresh token opaco (256 bits, base64url). */
export const generarRefreshToken = (): string =>
  crypto.randomBytes(32).toString("base64url");

/** Hash SHA-256 hex — lo único que se persiste del refresh token. */
export const hashRefreshToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");

/** Fecha de expiración a partir de ahora (ventana deslizante). */
export const fechaExpiracionRefresh = (): Date =>
  new Date(Date.now() + REFRESH_TTL_DIAS * MS_DIA);

/** Opciones de la cookie del refresh token. */
export const opcionesCookieRefresh = (): CookieOptions => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  sameSite: "lax",
  path: REFRESH_COOKIE_PATH,
  maxAge: REFRESH_TTL_DIAS * MS_DIA,
});

/** Mismas opciones sin `maxAge`, para `res.clearCookie`. */
export const opcionesLimpiarCookieRefresh = (): CookieOptions => {
  const { maxAge: _omit, ...resto } = opcionesCookieRefresh();
  return resto;
};
