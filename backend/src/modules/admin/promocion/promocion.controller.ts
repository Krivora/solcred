import { Response, NextFunction } from "express";
import { RequestAutenticado } from "@middlewares/auth.middleware";
import { registrarLog } from "@utils/audit";
import { AccionLog, ModuloLog } from "../../../../generated/prisma/client";
import * as solicitudesService from "./promocion.service";
import { ok } from "@utils/response";
import { cartaRechazoTemplate } from '../../../shared/pdf/templates/carta-rechazo.template';
import { generarPDFDesdeHTML } from '../../../shared/pdf/pdf.service';
import { solicitudTemplate } from '../../../shared/pdf/templates/solicitud.template';
import { tarjetaInformativaTemplate } from '../../../shared/pdf/templates/tarjeta-informativa.template';
import { mapearSolicitudAPDF } from "./promocion.service";
import { AppError } from "@/middlewares/error.middleware";
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
      asignacion,
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
      asignacion: asignacion as string | undefined,
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

export const listarMisCasos = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { personalId } = req.usuario!;

    if (!personalId) {
      throw new AppError("Este usuario no tiene un perfil de Personal asociado", 403);
    }

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
      gestorId: personalId, // ── FIX ──
      page: parseInt(page as string),
      limit: Math.min(parseInt(limit as string), 100),
      estatus: estatus as string | undefined,
      tipoPersona: tipoPersona as string | undefined,
      sector: sector as string | undefined,
      tamanoEmpresa: tamanoEmpresa as string | undefined,
      programaId: programaId as string | undefined,
      fechaDesde: fechaDesde as string | undefined,
      fechaHasta: fechaHasta as string | undefined,
      busqueda: busqueda as string | undefined,
    };

    const resultado = await solicitudesService.listarMisCasos(filtros);

    await registrarLog({
      accion: AccionLog.CONSULTAR,
      modulo: ModuloLog.SOLICITUDES,
      descripcion: "Gestor consultó sus casos asignados",
      usuarioId: req.usuario!.id,
      req,
    });

    res.status(200).json(ok("Casos obtenidos", resultado));
  } catch (error) {
    next(error);
  }
};

export const listarAprobacion = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = "1", limit = "20", tipoPersona, sector,
      tamanoEmpresa, programaId, fechaDesde, fechaHasta, busqueda,
    } = req.query;

    const filtros = {
      page: parseInt(page as string),
      limit: Math.min(parseInt(limit as string), 100),
      tipoPersona: tipoPersona as string | undefined,
      sector: sector as string | undefined,
      tamanoEmpresa: tamanoEmpresa as string | undefined,
      programaId: programaId as string | undefined,
      fechaDesde: fechaDesde as string | undefined,
      fechaHasta: fechaHasta as string | undefined,
      busqueda: busqueda as string | undefined,
    };

    const resultado = await solicitudesService.listarAprobacion(filtros);

    await registrarLog({
      accion: AccionLog.CONSULTAR,
      modulo: ModuloLog.SOLICITUDES,
      descripcion: "Módulo de aprobación consultado",
      usuarioId: req.usuario!.id,
      req,
    });

    res.status(200).json(ok("Solicitudes de aprobación obtenidas", resultado));
  } catch (error) {
    next(error);
  }
};

export const listarHistorico = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = "1", limit = "20", tipoPersona, sector,
      tamanoEmpresa, programaId, fechaDesde, fechaHasta, busqueda,
    } = req.query;

    const filtros = {
      page: parseInt(page as string),
      limit: Math.min(parseInt(limit as string), 100),
      tipoPersona: tipoPersona as string | undefined,
      sector: sector as string | undefined,
      tamanoEmpresa: tamanoEmpresa as string | undefined,
      programaId: programaId as string | undefined,
      fechaDesde: fechaDesde as string | undefined,
      fechaHasta: fechaHasta as string | undefined,
      busqueda: busqueda as string | undefined,
    };

    const resultado = await solicitudesService.listarHistorico(filtros);

    await registrarLog({
      accion: AccionLog.CONSULTAR,
      modulo: ModuloLog.SOLICITUDES,
      descripcion: "Módulo de histórico consultado",
      usuarioId: req.usuario!.id,
      req,
    });

    res.status(200).json(ok("Solicitudes de histórico obtenidas", resultado));
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


export const devolverAlSolicitante = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const solicitud = await solicitudesService.devolverAlSolicitante(
      req.params.id as string,
      req.body,
      req.usuario!.id
    );
    await registrarLog({
      accion: AccionLog.ACTUALIZAR,
      modulo: ModuloLog.SOLICITUDES,
      descripcion: `Solicitud devuelta al solicitante: ${req.params.id}`,
      usuarioId: req.usuario!.id,
      entidadId: solicitud.id,
      req,
      metadata: { estatus: "EN_CORRECION", motivo: req.body.motivo },
    });
    res.status(200).json(ok("Solicitud devuelta al solicitante", solicitud));
  } catch (error) {
    next(error);
  }
};

export const regresarAlPromotor = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const solicitud = await solicitudesService.regresarAlPromotor(
      req.params.id as string,
      req.body,
      req.usuario!.id
    );
    await registrarLog({
      accion: AccionLog.ACTUALIZAR,
      modulo: ModuloLog.SOLICITUDES,
      descripcion: `Solicitud regresada al promotor: ${req.params.id}`,
      usuarioId: req.usuario!.id,
      entidadId: solicitud.id,
      req,
      metadata: { estatus: "PENDIENTE", motivo: req.body.motivo },
    });
    res.status(200).json(ok("Solicitud regresada al promotor", solicitud));
  } catch (error) {
    next(error);
  }
};
export const enviarAFinanciamiento = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const solicitud = await solicitudesService.enviarAFinanciamiento(
      req.params.id as string,
      req.body,
      req.usuario!.id
    );
    await registrarLog({
      accion: AccionLog.ACTUALIZAR,
      modulo: ModuloLog.SOLICITUDES,
      descripcion: `Solicitud enviada a financiamiento: ${req.params.id}`,
      usuarioId: req.usuario!.id,
      entidadId: solicitud.id,
      req,
      metadata: { estatus: "EN_FINANCIAMIENTO" },
    });
    res.status(200).json(ok("Solicitud enviada a financiamiento", solicitud));
  } catch (error) {
    next(error);
  }
};

export const enviarAAprobacion = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const solicitud = await solicitudesService.enviarAAprobacion(
      req.params.id as string,
      req.body,
      req.usuario!.id
    );
    await registrarLog({
      accion: AccionLog.ACTUALIZAR,
      modulo: ModuloLog.SOLICITUDES,
      descripcion: `Solicitud enviada a aprobación: ${req.params.id}`,
      usuarioId: req.usuario!.id,
      entidadId: solicitud.id,
      req,
      metadata: { estatus: "EN_APROBACION" },
    });
    res.status(200).json(ok("Solicitud enviada a aprobación", solicitud));
  } catch (error) {
    next(error);
  }
};

export const cancelar = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const solicitud = await solicitudesService.cancelar(req.params.id as string, req.body, req.usuario!.id);
    await registrarLog({
      accion: AccionLog.ACTUALIZAR,
      modulo: ModuloLog.SOLICITUDES,
      descripcion: `Solicitud cancelada: ${req.params.id}`,
      usuarioId: req.usuario!.id,
      entidadId: solicitud.id,
      req,
      metadata: { estatus: "CANCELADO", motivo: req.body.motivo },
    });
    res.status(200).json(ok("Solicitud cancelada", solicitud));
  } catch (error) {
    next(error);
  }
};

export const rechazar = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const solicitud = await solicitudesService.rechazar(req.params.id as string, req.body, req.usuario!.id);
    await registrarLog({
      accion: AccionLog.ACTUALIZAR,
      modulo: ModuloLog.SOLICITUDES,
      descripcion: `Solicitud rechazada: ${req.params.id}`,
      usuarioId: req.usuario!.id,
      entidadId: solicitud.id,
      req,
      metadata: { estatus: "RECHAZADO", motivo: req.body.motivo },
    });
    res.status(200).json(ok("Solicitud rechazada", solicitud));
  } catch (error) {
    next(error);
  }
};

export const descargarCartaRechazo = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await solicitudesService.obtenerCartaRechazo(
      req.params.id as string,
      req.usuario!.id,
      req.usuario!.rol
    );

    const html = cartaRechazoTemplate(data);
    const pdfBuffer = await generarPDFDesdeHTML(html);

    await registrarLog({
      accion: AccionLog.CONSULTAR,
      modulo: ModuloLog.SOLICITUDES,
      descripcion: `Carta de rechazo generada para solicitud: ${req.params.id}`,
      usuarioId: req.usuario!.id,
      entidadId: req.params.id as string,
      req,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="rechazo-${data.folio}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length.toString());
    res.status(200).send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

export const descargarPDF = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const solicitud = await solicitudesService.SolicitudId(
      req.params.id as string,
      req.usuario!.id,
      req.usuario!.rol
    );

    const data = mapearSolicitudAPDF(solicitud);
    const html = solicitudTemplate(data);
    const pdfBuffer = await generarPDFDesdeHTML(html);

    await registrarLog({
      accion: AccionLog.CONSULTAR,
      modulo: ModuloLog.SOLICITUDES,
      descripcion: `PDF generado para solicitud: ${solicitud.id}`,
      usuarioId: req.usuario!.id,
      entidadId: solicitud.id,
      req,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="solicitud-${data.folio}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length.toString());
    res.status(200).send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};
export const descargarTarjetaInformativa = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await solicitudesService.obtenerTarjetaInformativa(
      req.params.id as string,
      req.usuario!.id,
      req.usuario!.rol
    );

    const html = tarjetaInformativaTemplate(data);
    const pdfBuffer = await generarPDFDesdeHTML(html);

    await registrarLog({
      accion: AccionLog.CONSULTAR,
      modulo: ModuloLog.SOLICITUDES,
      descripcion: `Tarjeta informativa generada para solicitud: ${req.params.id}`,
      usuarioId: req.usuario!.id,
      entidadId: req.params.id as string,
      req,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="tarjeta-informativa-${data.folio}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length.toString());
    res.status(200).send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};