import prisma from "@config/db";
import { AppError } from "@middlewares/error.middleware";
import {
  AgregarDocumentoDto,
  ActualizarProgramaDto,
  CrearProgramaDto,
  CrearTipoDocumentoDto,
} from "./programas.schema";

// ── Tipos de Documento ─────────────────────────────────────

export const listarTiposDocumento = async () => {
  return prisma.tipoDocumento.findMany({
    orderBy: { nombre: "asc" },
  });
};

export const crearTipoDocumento = async (dto: CrearTipoDocumentoDto) => {
  const existente = await prisma.tipoDocumento.findUnique({
    where: { nombre: dto.nombre },
  });

  if (existente) throw new AppError("Ya existe un tipo de documento con ese nombre", 409);

  return prisma.tipoDocumento.create({ data: dto });
};

// ── Programas ──────────────────────────────────────────────

export const listarProgramas = async (soloActivos: boolean = true) => {
  return prisma.programa.findMany({
    where: soloActivos ? { activo: true } : undefined,
    include: {
      documentosRequeridos: {
        include: { tipoDocumento: true },
      },
    },
    orderBy: { creadoEn: "desc" },
  });
};

export const obtenerProgramaPorId = async (id: string) => {
  const programa = await prisma.programa.findUnique({
    where: { id },
    include: {
      documentosRequeridos: {
        include: { tipoDocumento: true },
      },
    },
  });

  if (!programa) throw new AppError("Programa no encontrado", 404);

  return programa;
};

export const crearPrograma = async (dto: CrearProgramaDto) => {
  return prisma.programa.create({
    data: dto,
    include: {
      documentosRequeridos: {
        include: { tipoDocumento: true },
      },
    },
  });
};

export const actualizarPrograma = async (
  id: string,
  dto: ActualizarProgramaDto
) => {
  const programa = await prisma.programa.findUnique({ where: { id } });

  if (!programa) throw new AppError("Programa no encontrado", 404);

  return prisma.programa.update({
    where: { id },
    data: dto,
    include: {
      documentosRequeridos: {
        include: { tipoDocumento: true },
      },
    },
  });
};

export const desactivarPrograma = async (id: string) => {
  const programa = await prisma.programa.findUnique({ where: { id } });

  if (!programa) throw new AppError("Programa no encontrado", 404);
  if (!programa.activo) throw new AppError("El programa ya está desactivado", 400);

  return prisma.programa.update({
    where: { id },
    data: { activo: false },
  });
};

export const activarPrograma = async (id: string) => {
  const programa = await prisma.programa.findUnique({ where: { id } });

  if (!programa) throw new AppError("Programa no encontrado", 404);
  if (programa.activo) throw new AppError("El programa ya está activo", 400);

  return prisma.programa.update({
    where: { id },
    data: { activo: true },
  });
};

// ── Documentos del Programa ────────────────────────────────

export const agregarDocumentoAPrograma = async (
  programaId: string,
  dto: AgregarDocumentoDto
) => {
  const programa = await prisma.programa.findUnique({ where: { id: programaId } });
  if (!programa) throw new AppError("Programa no encontrado", 404);

  const tipoDocumento = await prisma.tipoDocumento.findUnique({
    where: { id: dto.tipoDocumentoId },
  });
  if (!tipoDocumento) throw new AppError("Tipo de documento no encontrado", 404);

  const existente = await prisma.programaDocumento.findUnique({
    where: {
      programaId_tipoDocumentoId: {
        programaId,
        tipoDocumentoId: dto.tipoDocumentoId,
      },
    },
  });
  if (existente) throw new AppError("Este documento ya está asignado al programa", 409);

  return prisma.programaDocumento.create({
    data: {
      programaId,
      tipoDocumentoId: dto.tipoDocumentoId,
      esObligatorio: dto.esObligatorio,
      aplicaA: dto.aplicaA ?? null,
    },
    include: { tipoDocumento: true },
  });
};

export const eliminarDocumentoDePrograma = async (
  programaId: string,
  tipoDocumentoId: string
) => {
  const existente = await prisma.programaDocumento.findUnique({
    where: {
      programaId_tipoDocumentoId: { programaId, tipoDocumentoId },
    },
  });

  if (!existente) throw new AppError("El documento no está asignado a este programa", 404);

  await prisma.programaDocumento.delete({
    where: {
      programaId_tipoDocumentoId: { programaId, tipoDocumentoId },
    },
  });
};