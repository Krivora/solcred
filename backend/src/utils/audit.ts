import prisma from "../config/db";
import { AccionLog, ModuloLog, Prisma } from "../../generated/prisma/client";
import { Request } from "express";

interface RegistrarLogParams {
  accion: AccionLog;
  modulo: ModuloLog;
  descripcion: string;
  req?: Request;
  usuarioId?: string;
  entidadId?: string;
  metadata?: Record<string, unknown>;
}

export const registrarLog = async ({
  accion,
  modulo,
  descripcion,
  req,
  usuarioId,
  entidadId,
  metadata,
}: RegistrarLogParams): Promise<void> => {
  try {
    await prisma.logAuditoria.create({
      data: {
        accion,
        modulo,
        descripcion,
        usuarioId: usuarioId ?? null,
        entidadId: entidadId ?? null,
        ip: req ? obtenerIp(req) : null,
        userAgent: req?.headers["user-agent"] ?? null,
        metadata: metadata
          ? (metadata as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
    });
  } catch (error) {
    // El log nunca debe romper el flujo principal
    console.error("Error al registrar log de auditoría:", error);
  }
};

const obtenerIp = (req: Request): string => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.socket.remoteAddress ?? "desconocida";
};