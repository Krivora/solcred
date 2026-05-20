import { Response, NextFunction } from "express";
import { RequestAutenticado } from "../../middlewares/auth.middleware";
import { registrarLog } from "../../utils/audit";
import { AccionLog, ModuloLog } from "../../../generated/prisma/client";
import * as usuariosService from "./usuarios.service";
import { ok } from "../../utils/response";

export const listar = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const usuarios = await usuariosService.listarUsuarios();

    await registrarLog({
      accion: AccionLog.CONSULTAR,
      modulo: ModuloLog.USUARIOS,
      descripcion: "Listado de usuarios consultado",
      usuarioId: req.usuario!.id,
      req,
    });

    res.status(200).json(ok("Usuarios obtenidos", usuarios));
  } catch (error) {
    next(error);
  }
};

export const obtenerPorId = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const usuario = await usuariosService.obtenerUsuarioPorId(req.params.id as string);
    await registrarLog({
      accion: AccionLog.CONSULTAR,
      modulo: ModuloLog.USUARIOS,
      descripcion: `Usuario consultado: ${usuario.correo}`,
      usuarioId: req.usuario!.id,
      entidadId: usuario.id,
      req,
    });

    res.status(200).json(ok("Usuario obtenido", usuario));
  } catch (error) {
    next(error);
  }
};

export const actualizar = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const usuario = await usuariosService.actualizarUsuario(
      req.params.id as string,
      req.body,
      req.usuario!.id,
      req.usuario!.rol
    );

    await registrarLog({
      accion: AccionLog.ACTUALIZAR,
      modulo: ModuloLog.USUARIOS,
      descripcion: `Usuario actualizado: ${usuario.correo}`,
      usuarioId: req.usuario!.id,
      entidadId: usuario.id,
      req,
      metadata: { cambios: req.body },
    });

    res.status(200).json(ok("Usuario actualizado", usuario));
  } catch (error) {
    next(error);
  }
};

export const cambiarRol = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const usuario = await usuariosService.cambiarRol(req.params.id as string, req.body);
    await registrarLog({
      accion: AccionLog.ACTUALIZAR,
      modulo: ModuloLog.USUARIOS,
      descripcion: `Rol cambiado a ${req.body.rol}: ${usuario.correo}`,
      usuarioId: req.usuario!.id,
      entidadId: usuario.id,
      req,
      metadata: { nuevoRol: req.body.rol },
    });

    res.status(200).json(ok("Rol actualizado", usuario));
  } catch (error) {
    next(error);
  }
};

export const desactivar = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const usuario = await usuariosService.desactivarUsuario(
      req.params.id as string,
      req.usuario!.id
    );

    await registrarLog({
      accion: AccionLog.ELIMINAR,
      modulo: ModuloLog.USUARIOS,
      descripcion: `Usuario desactivado: ${usuario.correo}`,
      usuarioId: req.usuario!.id,
      entidadId: usuario.id,
      req,
    });

    res.status(200).json(ok("Usuario desactivado correctamente", usuario));
  } catch (error) {
    next(error);
  }
};