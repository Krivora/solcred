import { Request, Response, NextFunction } from "express";
import { RequestAutenticado } from "../../middlewares/auth.middleware";
import { registrarLog } from "../../utils/audit";
import { AccionLog, ModuloLog } from "../../../generated/prisma/client";
import {
  REFRESH_COOKIE,
  opcionesCookieRefresh,
  opcionesLimpiarCookieRefresh,
} from "../../utils/refresh";
import type { RolAplicacion } from "../../utils/jwt";
import * as authService from "./auth.service";
import type { ContextoSesion } from "./auth.service";
import { ok } from "../../utils/response";

/** Origen de la petición para trazar la sesión de refresh. */
const contextoSesion = (req: Request): ContextoSesion => {
  const forwarded = req.headers["x-forwarded-for"];
  const ip =
    typeof forwarded === "string"
      ? forwarded.split(",")[0].trim()
      : req.socket.remoteAddress ?? null;
  return { ip, userAgent: req.headers["user-agent"] ?? null };
};

const enviarCookieRefresh = (
  res: Response,
  refreshToken: string,
  rol: RolAplicacion
): void => {
  res.cookie(REFRESH_COOKIE, refreshToken, opcionesCookieRefresh(rol));
};

export const registro = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { usuario } = await authService.registrarUsuario(req.body);
    await registrarLog({
      accion: AccionLog.CREAR,
      modulo: ModuloLog.AUTH,
      descripcion: `Nuevo usuario registrado: ${usuario.correo}`,
      usuarioId: usuario.id,
      entidadId: usuario.id,
      req,
    });

    res.status(201).json(ok("Usuario registrado exitosamente", { usuario }));
  } catch (error) {
    console.error("ERROR EN REGISTRO:");
    console.error(error);

    next(error);
  }
};

export const login = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { usuario, token, refreshToken, rol } = await authService.iniciarSesion(
      req.body,
      contextoSesion(req)
    );

    await registrarLog({
      accion: AccionLog.LOGIN,
      modulo: ModuloLog.AUTH,
      descripcion: `Inicio de sesión: ${usuario.correo}`,
      usuarioId: usuario.id,
      entidadId: usuario.id,
      req,
    });

    enviarCookieRefresh(res, refreshToken, rol);
    res.status(200).json(ok("Inicio de sesión exitoso", { usuario, token }));
  } catch (error) {
    await registrarLog({
      accion: AccionLog.ERROR,
      modulo: ModuloLog.AUTH,
      descripcion: `Intento de login fallido: ${req.body.correo ?? "desconocido"}`,
      req,
      metadata: { correo: req.body.correo },
    });

    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rawToken = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    const { usuario, token, refreshToken, rol } = await authService.refrescarSesion(
      rawToken,
      contextoSesion(req)
    );

    enviarCookieRefresh(res, refreshToken, rol);
    res.status(200).json(ok("Sesión renovada", { usuario, token }));
  } catch (error) {
    // Cualquier fallo de refresh deja la sesión sin cookie: el cliente cae a /login.
    res.clearCookie(REFRESH_COOKIE, opcionesLimpiarCookieRefresh());
    next(error);
  }
};

export const logout = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rawToken = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    const sesion = await authService.cerrarSesion(rawToken);

    res.clearCookie(REFRESH_COOKIE, opcionesLimpiarCookieRefresh());

    await registrarLog({
      accion: AccionLog.LOGOUT,
      modulo: ModuloLog.AUTH,
      descripcion: "Cierre de sesión",
      usuarioId: sesion?.usuarioId ?? req.usuario?.id,
      req,
    });

    res.status(200).json(ok("Sesión cerrada"));
  } catch (error) {
    next(error);
  }
};

export const perfil = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const usuario = await authService.obtenerPerfil(req.usuario!.id);

    await registrarLog({
      accion: AccionLog.CONSULTAR,
      modulo: ModuloLog.AUTH,
      descripcion: `Consulta de perfil`,
      usuarioId: req.usuario!.id,
      entidadId: req.usuario!.id,
      req,
    });

    res.status(200).json(ok("Perfil obtenido", usuario));
  } catch (error) {
    next(error);
  }
};
