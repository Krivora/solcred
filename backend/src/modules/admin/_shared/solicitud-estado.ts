/**
 * Núcleo compartido de la máquina de estados de una Solicitud.
 *
 * Antes vivía (privado) dentro de `promocion.service.ts`. Se extrajo aquí para
 * que el módulo `financiamiento` reutilice exactamente la misma lógica de
 * transición, historial, includes y timeline — sin duplicar ni acoplar
 * Financiamiento a Promoción.
 */
import prisma from "@config/db";
import { AppError } from "@middlewares/error.middleware";
import { EstatusSolicitud } from "../../../../generated/prisma/client";

export const ESTATUS_FINALES: EstatusSolicitud[] = ["APROBADO", "RECHAZADO", "CANCELADO"];

// ─────────────────────────────────────────────────────────────────────────────
// Includes reutilizables para los listados de solicitudes
// ─────────────────────────────────────────────────────────────────────────────

export const INCLUDE_SOLICITUD_BASE = {
  programa: {
    select: {
      id: true,
      nombre: true,
      documentosRequeridos: {
        where: { esObligatorio: true },
        select: {
          tipoDocumentoId: true,
          esObligatorio: true,
          aplicaA: true,
        },
      },
    },
  },
  datosSolicitante: {
    select: {
      id: true,
      nombre: true,
      apellidoPaterno: true,
      apellidoMaterno: true,
      rfc: true,
      correo: true,
      celular: true,
    },
  },
  asignaciones: {
    where: { activa: true },
    take: 1,
    select: {
      fechaAsignacion: true,
      gestor: {
        select: {
          id: true,
          usuario: {
            select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true },
          },
        },
      },
    },
  },
  documentos: {
    where: { activo: true },
    select: { tipoDocumentoId: true, estatus: true, activo: true },
  },
};

function withHistorial(estatusNuevo: EstatusSolicitud) {
  return {
    ...INCLUDE_SOLICITUD_BASE,
    historialEstatus: {
      where: { estatusNuevo },
      orderBy: { creadoEn: "desc" as const },
      take: 1,
      select: {
        motivo: true,
        creadoEn: true,
        usuario: {
          select: { nombre: true, apellidoPaterno: true },
        },
      },
    },
  };
}

// ── Overloads: el tipo de retorno depende del argumento ──────
export function buildIncludeSolicitud(): typeof INCLUDE_SOLICITUD_BASE;
export function buildIncludeSolicitud(
  estatusNuevo: EstatusSolicitud
): ReturnType<typeof withHistorial>;
export function buildIncludeSolicitud(estatusNuevo?: EstatusSolicitud) {
  if (!estatusNuevo) return INCLUDE_SOLICITUD_BASE;
  return withHistorial(estatusNuevo);
}

/** Include completo de la solicitud (todas las secciones + documentos). */
export const incluyeTodo = {
  programa: {
    include: {
      documentosRequeridos: {
        include: { tipoDocumento: true },
      },
    },
  },
  datosSolicitante: true,
  datosAval: true,
  datosCredito: {
    include: { conceptos: true },
  },
  datosGarantia: {
    include: { garantias: true },
  },
  datosNegocio: true,
  datosMercado: true,
  datosBancarios: true,
  documentos: {
    include: {
      tipoDocumento: true,
      validadoPor: {
        include: { usuario: true },
      },
    },
  },
};

const SELECT_DOCUMENTOS_REQUERIDOS = {
  where: { esObligatorio: true },
  select: {
    tipoDocumentoId: true,
    esObligatorio: true,
    aplicaA: true,
    tipoDocumento: true,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Métricas de documentos
// ─────────────────────────────────────────────────────────────────────────────

export function calcularMetricas(solicitud: any) {
  const tipoPersona = solicitud.tipoPersona;
  const requeridos = (solicitud.programa?.documentosRequeridos ?? []).filter((r: any) => {
    if (!r.aplicaA) return true;
    if (!tipoPersona) return true;
    return r.aplicaA === tipoPersona || r.aplicaA === "AMBOS";
  });
  const documentos = solicitud.documentos ?? [];

  const totalRequeridos = requeridos.filter((r: any) => r.esObligatorio).length;

  const documentosPorTipo = new Map<string, { estatus: string }>(
    documentos
      .filter((d: any) => d.activo)
      .map((d: any) => [d.tipoDocumentoId as string, d as { estatus: string }])
  );

  let totalAprobados = 0;
  let totalPendientes = 0;
  let totalRechazados = 0;
  let totalNoSubidos = 0;

  for (const req of requeridos) {
    if (!req.esObligatorio) continue;
    const doc = documentosPorTipo.get(req.tipoDocumentoId);
    if (!doc) {
      totalNoSubidos++;
    } else if (doc.estatus === "APROBADO") {
      totalAprobados++;
    } else if (doc.estatus === "RECHAZADO") {
      totalRechazados++;
    } else {
      totalPendientes++;
    }
  }

  return {
    totalRequeridos,
    totalAprobados,
    totalPendientes,
    totalRechazados,
    totalNoSubidos,
    totalSubidos: totalRequeridos - totalNoSubidos,
    porcentajeCompletado:
      totalRequeridos > 0 ? Math.round((totalAprobados / totalRequeridos) * 100) : 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Transiciones de estatus
// ─────────────────────────────────────────────────────────────────────────────

type TxCliente = Omit<
  typeof prisma,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

/** Registra un salto de estatus en HistorialEstatus (alimenta el timeline). */
export const registrarHistorial = async (
  tx: TxCliente,
  solicitudId: string,
  estatusAnterior: EstatusSolicitud,
  estatusNuevo: EstatusSolicitud,
  usuarioId: string,
  motivo?: string
) => {
  await tx.historialEstatus.create({
    data: { solicitudId, estatusAnterior, estatusNuevo, motivo, usuarioId },
  });
};

/**
 * Valida que la solicitud exista, no esté en un estatus final, y (opcional) que
 * su estatus actual esté dentro de los permitidos para la acción.
 */
export const validarTransicion = async (
  solicitudId: string,
  estatusPermitidos?: EstatusSolicitud[]
) => {
  const solicitud = await prisma.solicitud.findUnique({ where: { id: solicitudId } });
  if (!solicitud) throw new AppError("Solicitud no encontrada", 404);
  if (ESTATUS_FINALES.includes(solicitud.estatus)) {
    throw new AppError(`La solicitud ya tiene un estatus final: ${solicitud.estatus}`, 400);
  }
  if (estatusPermitidos && !estatusPermitidos.includes(solicitud.estatus)) {
    throw new AppError(
      `Acción no permitida. Estado actual: ${solicitud.estatus}. Se requiere: ${estatusPermitidos.join(", ")}`,
      422
    );
  }
  return solicitud;
};

// ─────────────────────────────────────────────────────────────────────────────
// Detalle de solicitud + timeline unificado
// ─────────────────────────────────────────────────────────────────────────────

export const obtenerSolicitudPorId = async (
  id: string,
  usuarioId: string,
  rol: string
) => {
  const solicitud = await prisma.solicitud.findUnique({
    where: { id },
    include: {
      programa: {
        select: {
          id: true,
          nombre: true,
          documentosRequeridos: SELECT_DOCUMENTOS_REQUERIDOS,
        },
      },
      datosSolicitante: {
        select: {
          id: true,
          nombre: true,
          apellidoPaterno: true,
          apellidoMaterno: true,
          correo: true,
          celular: true,
        },
      },
      documentos: {
        where: { activo: true },
        include: {
          tipoDocumento: true,
          validadoPor: {
            select: {
              id: true,
              usuario: {
                select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true },
              },
            },
          },
        },
        orderBy: { subidoEn: "desc" },
      },
      asignaciones: {
        orderBy: { fechaAsignacion: "asc" },
        include: {
          gestor: {
            select: {
              id: true,
              usuario: {
                select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true, correo: true },
              },
            },
          },
          grupo: {
            select: { id: true, nombre: true },
          },
          asignadoPor: {
            select: {
              id: true,
              usuario: {
                select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true },
              },
            },
          },
        },
      },
      asignacionesFinanciamiento: {
        orderBy: { fechaAsignacion: "asc" },
        include: {
          analista: {
            select: {
              id: true,
              usuario: {
                select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true, correo: true },
              },
            },
          },
          asignadoPor: {
            select: {
              id: true,
              usuario: {
                select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true },
              },
            },
          },
        },
      },
      historialEstatus: {
        orderBy: { creadoEn: "asc" },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellidoPaterno: true,
              apellidoMaterno: true,
              personal: { select: { rol: true } },
            },
          },
        },
      },
    },
  });

  if (!solicitud) throw new AppError("Solicitud no encontrada", 404);

  if (rol === "CLIENTE" && solicitud.solicitanteId !== usuarioId) {
    throw new AppError("No tienes permisos para ver esta solicitud", 403);
  }

  const { asignaciones, asignacionesFinanciamiento, historialEstatus, ...datosGenerales } =
    solicitud;

  // Asignación de gestor (Promoción) actualmente activa
  const gestorAsignado = asignaciones.find((a) => a.activa) ?? null;
  // Asignación de analista (Financiamiento) actualmente activa
  const analistaAsignado = asignacionesFinanciamiento.find((a) => a.activa) ?? null;

  // Timeline unificado: cambios de estatus + (re)asignaciones de gestor + asignaciones de analista
  const timeline = [
    ...historialEstatus.map((h) => ({
      tipo: "CAMBIO_ESTATUS" as const,
      fecha: h.creadoEn,
      estatusAnterior: h.estatusAnterior,
      estatusNuevo: h.estatusNuevo,
      comentario: h.motivo,
      realizadoPor: h.usuario,
    })),
    ...asignaciones.map((a) => ({
      tipo: "ASIGNACION" as const,
      fecha: a.fechaAsignacion,
      gestor: a.gestor,
      grupo: a.grupo,
      asignadoPor: a.asignadoPor, // null = asignación automática
      activa: a.activa,
    })),
    ...asignaciones
      .filter((a) => a.fechaReasignacion !== null)
      .map((a) => ({
        tipo: "REASIGNACION" as const,
        fecha: a.fechaReasignacion as Date,
        gestorAnterior: a.gestor,
        comentario: a.motivoReasignacion,
      })),
    ...asignacionesFinanciamiento.map((a) => ({
      tipo: "ASIGNACION_FINANCIAMIENTO" as const,
      fecha: a.fechaAsignacion,
      analista: a.analista,
      asignadoPor: a.asignadoPor,
      activa: a.activa,
    })),
  ].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

  return {
    ...datosGenerales,
    metricas: calcularMetricas(solicitud),
    gestorAsignado,
    analistaAsignado,
    historialAsignaciones: asignaciones,
    timeline,
  };
};
