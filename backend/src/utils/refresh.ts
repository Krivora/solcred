import crypto from "crypto";
import type { CookieOptions } from "express";
import { ttlSesion } from "../config/sesion.config";
import type { RolAplicacion } from "./jwt";

/** Nombre de la cookie httpOnly que transporta el refresh token. */
export const REFRESH_COOKIE = "sc_refresh";

/** Ruta a la que se limita la cookie: solo los endpoints que la consumen. */
export const REFRESH_COOKIE_PATH = "/api/auth";

const MS_DIA = 24 * 60 * 60 * 1000;

/** Días de vida del refresh token para un rol (ventana deslizante). */
export const refreshTtlDias = (rol: RolAplicacion): number =>
  ttlSesion(rol).refreshTtlDias;

/** Genera un refresh token opaco (256 bits, base64url). */
export const generarRefreshToken = (): string =>
  crypto.randomBytes(32).toString("base64url");

/** Hash SHA-256 hex — lo único que se persiste del refresh token. */
export const hashRefreshToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");

/** Fecha de expiración a partir de ahora (ventana deslizante), según el rol. */
export const fechaExpiracionRefresh = (rol: RolAplicacion): Date =>
  new Date(Date.now() + refreshTtlDias(rol) * MS_DIA);

/** Opciones de la cookie del refresh token (su `maxAge` sigue al TTL del rol). */
export const opcionesCookieRefresh = (rol: RolAplicacion): CookieOptions => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  sameSite: "lax",
  path: REFRESH_COOKIE_PATH,
  maxAge: refreshTtlDias(rol) * MS_DIA,
});

/** Mismas opciones sin `maxAge`, para `res.clearCookie`. */
export const opcionesLimpiarCookieRefresh = (): CookieOptions => {
  // `maxAge` es lo único que depende del rol; para limpiar la cookie no importa.
  const { maxAge: _omit, ...resto } = opcionesCookieRefresh("CLIENTE");
  return resto;
};
