import { Response, NextFunction } from "express";
import { RequestAutenticado } from "../../middlewares/auth.middleware";
import { registrarLog } from "../../utils/audit";
import { AccionLog, ModuloLog } from "../../../generated/prisma/client";
import * as solicitudesService from "./solicitudes.service";
import { ok } from "../../utils/response";

export const listar = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const solicitudes = await solicitudesService.listarSolicitudes(
      req.usuario!.id,
      req.usuario!.rol
    );

    await registrarLog({
      accion: AccionLog.CONSULTAR,
      modulo: ModuloLog.SOLICITUDES,
      descripcion: "Listado de solicitudes consultado",
      usuarioId: req.usuario!.id,
      req,
    });

    res.status(200).json(ok("Solicitudes obtenidas", solicitudes));
  } catch (error) {
    next(error);
  }
};
export const listarPromocion = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = "1",
      limit = "20",
      estatus,
      tipoPersona,
      sector,
      tamanoEmpresa,
      programaId,
      fechaDesde,
      fechaHasta,
      busqueda,
    } = req.query;

    const filtros = {
      page: parseInt(page as string),
      limit: Math.min(parseInt(limit as string), 100), // tope de seguridad
      estatus: estatus as string | undefined,
      tipoPersona: tipoPersona as string | undefined,
      sector: sector as string | undefined,
      tamanoEmpresa: tamanoEmpresa as string | undefined,
      programaId: programaId as string | undefined,
      fechaDesde: fechaDesde as string | undefined,
      fechaHasta: fechaHasta as string | undefined,
      busqueda: busqueda as string | undefined,
    };

    const resultado = await solicitudesService.listarPromocion(filtros);

    await registrarLog({
      accion: AccionLog.CONSULTAR,
      modulo: ModuloLog.SOLICITUDES,
      descripcion: "Módulo de promoción consultado",
      usuarioId: req.usuario!.id,
      req,
    });

    res.status(200).json(ok("Solicitudes de promoción obtenidas", resultado));
  } catch (error) {
    next(error);
  }
};

export const statsPromocion = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await solicitudesService.statsPromocion();
    res.status(200).json(ok("Estadísticas obtenidas", stats));
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
    const solicitud = await solicitudesService.obtenerSolicitudPorId(
      req.params.id as string,
      req.usuario!.id,
      req.usuario!.rol
    );

    await registrarLog({
      accion: AccionLog.CONSULTAR,
      modulo: ModuloLog.SOLICITUDES,
      descripcion: `Solicitud consultada: ${solicitud.id}`,
      usuarioId: req.usuario!.id,
      entidadId: solicitud.id,
      req,
    });

    res.status(200).json(ok("Solicitud obtenida", solicitud));
  } catch (error) {
    next(error);
  }
};

export const crear = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const solicitud = await solicitudesService.crearSolicitud(
      req.body,
      req.usuario!.id
    );

    await registrarLog({
      accion: AccionLog.CREAR,
      modulo: ModuloLog.SOLICITUDES,
      descripcion: `Solicitud creada para programa: ${req.body.programaId}`,
      usuarioId: req.usuario!.id,
      entidadId: solicitud.id,
      req,
      metadata: { solicitud: req.body },
    });

    res.status(201).json(ok("Solicitud creada", solicitud));
  } catch (error) {
    next(error);
  }
};

export const guardarDatosGenerales = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const datos = await solicitudesService.guardarDatosGenerales(
      req.params.id as string,
      req.body,
      req.usuario!.id,
      req.usuario!.rol
    );

    await registrarLog({
      accion: AccionLog.ACTUALIZAR,
      modulo: ModuloLog.SOLICITUDES,
      descripcion: `Datos generales guardados en solicitud: ${req.params.id}`,
      usuarioId: req.usuario!.id,
      entidadId: req.params.id as string,
      req,
    });

    res.status(200).json(ok("Datos generales guardados", datos));
  } catch (error) {
    next(error);
  }
};
export const guardarDatosSolicitante = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const datos = await solicitudesService.guardarDatosSolicitante(
      req.params.id as string,
      req.body,
      req.usuario!.id,
      req.usuario!.rol
    );

    await registrarLog({
      accion: AccionLog.ACTUALIZAR,
      modulo: ModuloLog.SOLICITUDES,
      descripcion: `Datos del solicitante guardados en solicitud: ${req.params.id}`,
      usuarioId: req.usuario!.id,
      entidadId: req.params.id as string,
      req,
    });

    res.status(200).json(ok("Datos del solicitante guardados", datos));
  } catch (error) {
    next(error);
  }
};

export const guardarDatosAval = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const datos = await solicitudesService.guardarDatosAval(
      req.params.id as string,
      req.body,
      req.usuario!.id,
      req.usuario!.rol
    );

    await registrarLog({
      accion: AccionLog.ACTUALIZAR,
      modulo: ModuloLog.SOLICITUDES,
      descripcion: `Datos del aval guardados en solicitud: ${req.params.id}`,
      usuarioId: req.usuario!.id,
      entidadId: req.params.id as string,
      req,
    });

    res.status(200).json(ok("Datos del aval guardados", datos));
  } catch (error) {
    next(error);
  }
};

export const enviar = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const solicitud = await solicitudesService.enviarSolicitud(
      req.params.id as string,
      req.usuario!.id,
      req.usuario!.rol
    );

    await registrarLog({
      accion: AccionLog.ACTUALIZAR,
      modulo: ModuloLog.SOLICITUDES,
      descripcion: `Solicitud enviada a revisión: ${req.params.id}`,
      usuarioId: req.usuario!.id,
      entidadId: solicitud.id,
      req,
    });

    res.status(200).json(ok("Solicitud enviada a revisión", solicitud));
  } catch (error) {
    next(error);
  }
};

export const cambiarEstatus = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const solicitud = await solicitudesService.cambiarEstatus(
      req.params.id as string,
      req.body
    );

    await registrarLog({
      accion: AccionLog.ACTUALIZAR,
      modulo: ModuloLog.SOLICITUDES,
      descripcion: `Estatus de solicitud cambiado a ${req.body.estatus}: ${req.params.id}`,
      usuarioId: req.usuario!.id,
      entidadId: solicitud.id,
      req,
      metadata: { estatus: req.body.estatus, motivo: req.body.motivo },
    });

    res.status(200).json(ok("Estatus actualizado", solicitud));
  } catch (error) {
    next(error);
  }
};