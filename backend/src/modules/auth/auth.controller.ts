import { Response, NextFunction } from "express";
import { RequestAutenticado } from "../../middlewares/auth.middleware";
import { registrarLog } from "../../utils/audit";
import { AccionLog, ModuloLog } from "../../../generated/prisma/client";
import * as authService from "./auth.service";
import { ok } from "../../utils/response";

export const registro = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const resultado = await authService.registrarUsuario(req.body);
    console.log("BODY:", req.body);
    await registrarLog({
      accion: AccionLog.CREAR,
      modulo: ModuloLog.AUTH,
      descripcion: `Nuevo usuario registrado: ${resultado.usuario.correo}`,
      usuarioId: resultado.usuario.id,
      entidadId: resultado.usuario.id,
      req,
    });

    res.status(201).json(ok("Usuario registrado exitosamente", resultado));
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
    const resultado = await authService.iniciarSesion(req.body);

    await registrarLog({
      accion: AccionLog.LOGIN,
      modulo: ModuloLog.AUTH,
      descripcion: `Inicio de sesión: ${resultado.usuario.correo}`,
      usuarioId: resultado.usuario.id,
      entidadId: resultado.usuario.id,
      req,
    });

    res.status(200).json(ok("Inicio de sesión exitoso", resultado));
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