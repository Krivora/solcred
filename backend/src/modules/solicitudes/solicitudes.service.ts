import prisma from "../../config/db";
import { AppError } from "../../middlewares/error.middleware";
import {
  CambiarEstatusDto,
  CrearSolicitudDto,
  GuardarDatosAvalDto,
  GuardarDatosSolicitanteDto,
} from "./solicitudes.schema";

const incluyeTodo = {
  programa: {
    include: {
      documentosRequeridos: {
        include: { tipoDocumento: true },
      },
    },
  },
  datosSolicitante: true,
  datosAval: true,
  documentos: {
    include: { tipoDocumento: true },
  },
};

export const listarSolicitudes = async (
  usuarioId: string,
  rol: string
) => {
  // Admin y analista ven todas, cliente solo las suyas
  const where = rol === "CLIENTE" ? { solicitanteId: usuarioId } : {};

  return prisma.solicitud.findMany({
    where,
    include: {
      programa: { select: { id: true, nombre: true } },
      datosSolicitante: {
        select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true },
      },
    },
    orderBy: { creadoEn: "desc" },
  });
};

export const obtenerSolicitudPorId = async (
  id: string,
  usuarioId: string,
  rol: string
) => {
  const solicitud = await prisma.solicitud.findUnique({
    where: { id },
    include: incluyeTodo,
  });

  if (!solicitud) throw new AppError("Solicitud no encontrada", 404);

  // El cliente solo puede ver sus propias solicitudes
  if (rol === "CLIENTE" && solicitud.solicitanteId !== usuarioId) {
    throw new AppError("No tienes permisos para ver esta solicitud", 403);
  }

  return solicitud;
};

export const crearSolicitud = async (
  dto: CrearSolicitudDto,
  solicitanteId: string
) => {
  const programa = await prisma.programa.findUnique({
    where: { id: dto.programaId },
  });

  if (!programa) throw new AppError("Programa no encontrado", 404);
  if (!programa.activo) throw new AppError("El programa no está disponible", 400);

  // Validar tipo de persona contra el programa
  if (dto.tipoPersona === "FISICA" && !programa.permitePersonaFisica) {
    throw new AppError("Este programa no está disponible para personas físicas", 400);
  }
  if (dto.tipoPersona === "MORAL" && !programa.permitePersonaMoral) {
    throw new AppError("Este programa no está disponible para personas morales", 400);
  }

  // Validar monto contra el programa
  if (dto.montoSolicitado < programa.montoMinimo) {
    throw new AppError(
      `El monto mínimo para este programa es $${programa.montoMinimo}`,
      400
    );
  }
  if (dto.montoSolicitado > programa.montoMaximo) {
    throw new AppError(
      `El monto máximo para este programa es $${programa.montoMaximo}`,
      400
    );
  }

  // Validar plazo contra el programa
  if (dto.plazoSolicitado < programa.plazoMinimoMeses) {
    throw new AppError(
      `El plazo mínimo para este programa es ${programa.plazoMinimoMeses} meses`,
      400
    );
  }
  if (dto.plazoSolicitado > programa.plazoMaximoMeses) {
    throw new AppError(
      `El plazo máximo para este programa es ${programa.plazoMaximoMeses} meses`,
      400
    );
  }

  return prisma.solicitud.create({
    data: {
      ...dto,
      solicitanteId,
    },
    include: incluyeTodo,
  });
};

export const guardarDatosSolicitante = async (
  solicitudId: string,
  dto: GuardarDatosSolicitanteDto,
  usuarioId: string,
  rol: string
) => {
  const solicitud = await prisma.solicitud.findUnique({
    where: { id: solicitudId },
  });

  if (!solicitud) throw new AppError("Solicitud no encontrada", 404);

  if (rol === "CLIENTE" && solicitud.solicitanteId !== usuarioId) {
    throw new AppError("No tienes permisos para modificar esta solicitud", 403);
  }

  if (solicitud.estatus !== "BORRADOR") {
    throw new AppError("Solo se pueden modificar solicitudes en borrador", 400);
  }

  return prisma.datosSolicitante.upsert({
    where: { solicitudId },
    create: { ...dto, solicitudId },
    update: dto,
  });
};

export const guardarDatosAval = async (
  solicitudId: string,
  dto: GuardarDatosAvalDto,
  usuarioId: string,
  rol: string
) => {
  const solicitud = await prisma.solicitud.findUnique({
    where: { id: solicitudId },
    include: { programa: true },
  });

  if (!solicitud) throw new AppError("Solicitud no encontrada", 404);

  if (rol === "CLIENTE" && solicitud.solicitanteId !== usuarioId) {
    throw new AppError("No tienes permisos para modificar esta solicitud", 403);
  }

  if (solicitud.estatus !== "BORRADOR") {
    throw new AppError("Solo se pueden modificar solicitudes en borrador", 400);
  }

  if (!solicitud.programa.avalObligatorio && !solicitud.programa.avalOpcional) {
    throw new AppError("Este programa no requiere aval", 400);
  }

  return prisma.datosAval.upsert({
    where: { solicitudId },
    create: { ...dto, solicitudId },
    update: dto,
  });
};

export const enviarSolicitud = async (
  solicitudId: string,
  usuarioId: string,
  rol: string
) => {
  const solicitud = await prisma.solicitud.findUnique({
    where: { id: solicitudId },
    include: {
      programa: {
        include: {
          documentosRequeridos: true,
        },
      },
      datosSolicitante: true,
      documentos: true,
    },
  });

  if (!solicitud) throw new AppError("Solicitud no encontrada", 404);

  if (rol === "CLIENTE" && solicitud.solicitanteId !== usuarioId) {
    throw new AppError("No tienes permisos para enviar esta solicitud", 403);
  }

  if (solicitud.estatus !== "BORRADOR") {
    throw new AppError("La solicitud ya fue enviada anteriormente", 400);
  }

  // Validar que tenga datos del solicitante
  if (!solicitud.datosSolicitante) {
    throw new AppError("Debes completar los datos del solicitante", 400);
  }

  // Validar documentos obligatorios
  const documentosObligatorios = solicitud.programa.documentosRequeridos.filter(
    (d) =>
      d.esObligatorio &&
      (d.aplicaA === null || d.aplicaA === solicitud.tipoPersona)
  );

  const documentosSubidos = solicitud.documentos.map((d) => d.tipoDocumentoId);

  const documentosFaltantes = documentosObligatorios.filter(
    (d) => !documentosSubidos.includes(d.tipoDocumentoId)
  );

  if (documentosFaltantes.length > 0) {
    throw new AppError(
      `Faltan documentos obligatorios por subir`,
      400
    );
  }

  return prisma.solicitud.update({
    where: { id: solicitudId },
    data: { estatus: "PENDIENTE" },
    include: incluyeTodo,
  });
};

export const cambiarEstatus = async (
  solicitudId: string,
  dto: CambiarEstatusDto
) => {
  const solicitud = await prisma.solicitud.findUnique({
    where: { id: solicitudId },
  });

  if (!solicitud) throw new AppError("Solicitud no encontrada", 404);

  if (solicitud.estatus === "APROBADO" || solicitud.estatus === "RECHAZADO") {
    throw new AppError("La solicitud ya tiene un estatus final", 400);
  }

  return prisma.solicitud.update({
    where: { id: solicitudId },
    data: {
      estatus: dto.estatus,
    },
    include: incluyeTodo,
  });
};