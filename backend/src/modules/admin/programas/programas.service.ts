import prisma from "@config/db";
import { AppError } from "@middlewares/error.middleware";
import {
  AgregarDocumentoDto,
  ActualizarProgramaDto,
  CrearProgramaDto,
  CrearTipoDocumentoDto,
  ActualizarTipoDocumentoDto,
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

export const actualizarTipoDocumento = async (
  id: string,
  dto: ActualizarTipoDocumentoDto
) => {
  const tipo = await prisma.tipoDocumento.findUnique({ where: { id } });
  if (!tipo) throw new AppError("Tipo de documento no encontrado", 404);

  if (dto.nombre && dto.nombre !== tipo.nombre) {
    const duplicado = await prisma.tipoDocumento.findUnique({
      where: { nombre: dto.nombre },
    });
    if (duplicado) {
      throw new AppError("Ya existe un tipo de documento con ese nombre", 409);
    }
  }

  return prisma.tipoDocumento.update({
    where: { id },
    data: {
      ...(dto.nombre !== undefined && { nombre: dto.nombre }),
      ...(dto.descripcion !== undefined && {
        descripcion: dto.descripcion?.trim() ? dto.descripcion.trim() : null,
      }),
    },
  });
};

export const eliminarTipoDocumento = async (id: string) => {
  const tipo = await prisma.tipoDocumento.findUnique({
    where: { id },
    include: {
      _count: { select: { programas: true, documentos: true } },
    },
  });
  if (!tipo) throw new AppError("Tipo de documento no encontrado", 404);

  if (tipo._count.programas > 0) {
    throw new AppError(
      `No se puede eliminar: está asignado a ${tipo._count.programas} programa(s). Quítalo de esos programas primero.`,
      409
    );
  }
  if (tipo._count.documentos > 0) {
    throw new AppError(
      `No se puede eliminar: ya hay ${tipo._count.documentos} documento(s) subidos de este tipo.`,
      409
    );
  }

  await prisma.tipoDocumento.delete({ where: { id } });
};

// ── Programas ──────────────────────────────────────────────

const includePrograma = {
  documentosRequeridos: {
    include: { tipoDocumento: true },
  },
  secciones: true,
} as const;

export const listarProgramas = async (soloActivos: boolean = true) => {
  return prisma.programa.findMany({
    where: soloActivos ? { activo: true } : undefined,
    include: includePrograma,
    orderBy: { creadoEn: "desc" },
  });
};

export const obtenerProgramaPorId = async (id: string) => {
  const programa = await prisma.programa.findUnique({
    where: { id },
    include: includePrograma,
  });

  if (!programa) throw new AppError("Programa no encontrado", 404);

  return programa;
};

export const crearPrograma = async (dto: CrearProgramaDto) => {
  const { secciones, ...programaData } = dto;

  return prisma.programa.create({
    data: {
      ...programaData,
      secciones: {
        create: secciones.map((s) => ({
          seccion: s.seccion,
          requerimiento: s.requerimiento,
        })),
      },
    },
    include: includePrograma,
  });
};

export const actualizarPrograma = async (
  id: string,
  dto: ActualizarProgramaDto
) => {
  const programa = await prisma.programa.findUnique({ where: { id } });

  if (!programa) throw new AppError("Programa no encontrado", 404);

  const { secciones, ...programaData } = dto;

  return prisma.$transaction(async (tx) => {
    await tx.programa.update({
      where: { id },
      data: programaData,
    });

    // si mandan secciones, se reemplaza el set completo
    if (secciones) {
      await tx.programaSeccion.deleteMany({ where: { programaId: id } });
      await tx.programaSeccion.createMany({
        data: secciones.map((s) => ({
          programaId: id,
          seccion: s.seccion,
          requerimiento: s.requerimiento,
        })),
      });
    }

    return tx.programa.findUniqueOrThrow({
      where: { id },
      include: includePrograma,
    });
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