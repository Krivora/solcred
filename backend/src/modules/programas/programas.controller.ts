import { Response, NextFunction } from "express";
import { RequestAutenticado } from "../../middlewares/auth.middleware";
import { registrarLog } from "../../utils/audit";
import { AccionLog, ModuloLog } from "../../../generated/prisma/client";
import * as programasService from "./programas.service";
import { ok } from "../../utils/response";

// ── Tipos de Documento ─────────────────────────────────────

export const listarTiposDocumento = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tipos = await programasService.listarTiposDocumento();

    await registrarLog({
      accion: AccionLog.CONSULTAR,
      modulo: ModuloLog.PROGRAMAS,
      descripcion: "Listado de tipos de documento consultado",
      usuarioId: req.usuario!.id,
      req,
    });

    res.status(200).json(ok("Tipos de documento obtenidos", tipos));
  } catch (error) {
    next(error);
  }
};

export const crearTipoDocumento = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tipo = await programasService.crearTipoDocumento(req.body);

    await registrarLog({
      accion: AccionLog.CREAR,
      modulo: ModuloLog.PROGRAMAS,
      descripcion: `Tipo de documento creado: ${tipo.nombre}`,
      usuarioId: req.usuario!.id,
      entidadId: tipo.id,
      req,
    });

    res.status(201).json(ok("Tipo de documento creado", tipo));
  } catch (error) {
    next(error);
  }
};

// ── Programas ──────────────────────────────────────────────

export const listar = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const soloActivos = req.usuario!.rol !== "ADMIN";
    const programas = await programasService.listarProgramas(soloActivos);

    await registrarLog({
      accion: AccionLog.CONSULTAR,
      modulo: ModuloLog.PROGRAMAS,
      descripcion: "Listado de programas consultado",
      usuarioId: req.usuario!.id,
      req,
    });

    res.status(200).json(ok("Programas obtenidos", programas));
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
    const programa = await programasService.obtenerProgramaPorId(req.params.id as string);

    await registrarLog({
      accion: AccionLog.CONSULTAR,
      modulo: ModuloLog.PROGRAMAS,
      descripcion: `Programa consultado: ${programa.nombre}`,
      usuarioId: req.usuario!.id,
      entidadId: programa.id,
      req,
    });

    res.status(200).json(ok("Programa obtenido", programa));
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
    const programa = await programasService.crearPrograma(req.body);

    await registrarLog({
      accion: AccionLog.CREAR,
      modulo: ModuloLog.PROGRAMAS,
      descripcion: `Programa creado: ${programa.nombre}`,
      usuarioId: req.usuario!.id,
      entidadId: programa.id,
      req,
      metadata: { programa: req.body },
    });

    res.status(201).json(ok("Programa creado", programa));
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
    const programa = await programasService.actualizarPrograma(
      req.params.id as string,
      req.body
    );

    await registrarLog({
      accion: AccionLog.ACTUALIZAR,
      modulo: ModuloLog.PROGRAMAS,
      descripcion: `Programa actualizado: ${programa.nombre}`,
      usuarioId: req.usuario!.id,
      entidadId: programa.id,
      req,
      metadata: { cambios: req.body },
    });

    res.status(200).json(ok("Programa actualizado", programa));
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
    const programa = await programasService.desactivarPrograma(req.params.id as string);

    await registrarLog({
      accion: AccionLog.ELIMINAR,
      modulo: ModuloLog.PROGRAMAS,
      descripcion: `Programa desactivado: ${programa.nombre}`,
      usuarioId: req.usuario!.id,
      entidadId: programa.id,
      req,
    });

    res.status(200).json(ok("Programa desactivado", programa));
  } catch (error) {
    next(error);
  }
};

export const activar = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const programa = await programasService.activarPrograma(req.params.id as string);

    await registrarLog({
      accion: AccionLog.ACTUALIZAR,
      modulo: ModuloLog.PROGRAMAS,
      descripcion: `Programa activado: ${programa.nombre}`,
      usuarioId: req.usuario!.id,
      entidadId: programa.id,
      req,
    });

    res.status(200).json(ok("Programa activado", programa));
  } catch (error) {
    next(error);
  }
};

// ── Documentos del Programa ────────────────────────────────

export const agregarDocumento = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const documento = await programasService.agregarDocumentoAPrograma(
      req.params.id as string,
      req.body
    );

    await registrarLog({
      accion: AccionLog.CREAR,
      modulo: ModuloLog.PROGRAMAS,
      descripcion: `Documento agregado al programa: ${req.params.id}`,
      usuarioId: req.usuario!.id,
      entidadId: req.params.id as string,
      req,
      metadata: { documento: req.body },
    });

    res.status(201).json(ok("Documento agregado al programa", documento));
  } catch (error) {
    next(error);
  }
};

export const eliminarDocumento = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await programasService.eliminarDocumentoDePrograma(
      req.params.id as string,
      req.params.tipoDocumentoId as string
    );

    await registrarLog({
      accion: AccionLog.ELIMINAR,
      modulo: ModuloLog.PROGRAMAS,
      descripcion: `Documento eliminado del programa: ${req.params.id}`,
      usuarioId: req.usuario!.id,
      entidadId: req.params.id as string,
      req,
    });

    res.status(200).json(ok("Documento eliminado del programa"));
  } catch (error) {
    next(error);
  }
};