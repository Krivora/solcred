import prisma from "@config/db";
import { AppError } from "@middlewares/error.middleware";
import {
  DevolverAlSolicitanteDto,
  EnviarAFinanciamientoDto,
  EnviarAAprobacionDto,
  CancelarDto,
  RechazarDto,
} from "./promocion.schema";
import { EstatusSolicitud } from "../../../../generated/prisma/client";
const ESTATUS_FINALES: EstatusSolicitud[] = ["APROBADO", "RECHAZADO", "CANCELADO"];
const ESTATUS_HISTORICO_PROMOCION: EstatusSolicitud[] = ["EN_REVISION", "PENDIENTE", "BORRADOR"];
interface FiltrosPromocion {
  page: number
  limit: number
  estatus?: string
  tipoPersona?: string
  sector?: string
  tamanoEmpresa?: string
  programaId?: string
  fechaDesde?: string
  fechaHasta?: string
  busqueda?: string
  asignacion?: string
}
interface FiltrosMisCasos {
  gestorId: string
  page: number
  limit: number
  estatus?: string
  tipoPersona?: string
  sector?: string
  tamanoEmpresa?: string
  programaId?: string
  fechaDesde?: string
  fechaHasta?: string
  busqueda?: string
}
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

// helper reutilizable
function calcularMetricas(solicitud: any) {
  const requeridos = solicitud.programa?.documentosRequeridos ?? []
  const documentos = solicitud.documentos ?? []

  const totalRequeridos = requeridos.filter((r: any) => r.esObligatorio).length

  const documentosPorTipo = new Map<string, { estatus: string }>(
    documentos
      .filter((d: any) => d.activo)
      .map((d: any) => [d.tipoDocumentoId as string, d as { estatus: string }])
  )

  let totalAprobados = 0
  let totalPendientes = 0
  let totalRechazados = 0
  let totalNoSubidos = 0

  for (const req of requeridos) {
    if (!req.esObligatorio) continue
    const doc = documentosPorTipo.get(req.tipoDocumentoId)
    if (!doc) {
      totalNoSubidos++
    } else if (doc.estatus === 'APROBADO') {
      totalAprobados++
    } else if (doc.estatus === 'RECHAZADO') {
      totalRechazados++
    } else {
      totalPendientes++
    }
  }

  return {
    totalRequeridos,
    totalAprobados,
    totalPendientes,
    totalRechazados,
    totalNoSubidos,
    totalSubidos: totalRequeridos - totalNoSubidos,
    porcentajeCompletado: totalRequeridos > 0
      ? Math.round((totalAprobados / totalRequeridos) * 100)
      : 0,
  }
}
const registrarHistorial = async (
  tx: Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>,
  solicitudId: string,
  estatusAnterior: EstatusSolicitud,
  estatusNuevo: EstatusSolicitud,
  usuarioId: string,
  motivo?: string
) => {
  await tx.historialEstatus.create({
    data: {
      solicitudId,
      estatusAnterior,
      estatusNuevo,
      motivo,
      usuarioId,
    },
  })
}
const validarTransicion = async (solicitudId: string, estatusPermitidos?: EstatusSolicitud[]) => {
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
    include: {
      programa: {
        select: {
          id: true,
          nombre: true,
          documentosRequeridos: {
            include: { tipoDocumento: true },
          },
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
              nombre: true,
              apellidoPaterno: true,
              apellidoMaterno: true,
            },
          },
        },
        orderBy: { subidoEn: "desc" },
      },
      // ── Historial completo de asignaciones (quién, cuándo, por quién) ──
      asignaciones: {
        orderBy: { fechaAsignacion: "asc" },
        include: {
          gestor: {
            select: {
              id: true,
              nombre: true,
              apellidoPaterno: true,
              apellidoMaterno: true,
              correo: true,
            },
          },
          grupo: {
            select: { id: true, nombre: true },
          },
          asignadoPor: {
            select: {
              id: true,
              nombre: true,
              apellidoPaterno: true,
              apellidoMaterno: true,
            },
          },
        },
      },
      // ── Historial completo de estatus (quién, qué, cuándo, comentarios) ──
      historialEstatus: {
        orderBy: { creadoEn: "asc" },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellidoPaterno: true,
              apellidoMaterno: true,
              rol: true,
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

  const { asignaciones, historialEstatus, ...datosGenerales } = solicitud;

  // Asignación actualmente activa (para mostrar destacada arriba)
  const gestorAsignado = asignaciones.find((a) => a.activa) ?? null;

  // Timeline unificado: combina cambios de estatus y (re)asignaciones en orden cronológico
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
  ].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

  return {
    ...datosGenerales,
    gestorAsignado,
    historialAsignaciones: asignaciones,
    timeline,
  };
};

export const listarPromocion = async (filtros: FiltrosPromocion) => {
  const {
    page,
    limit,
    estatus,
    tipoPersona,
    sector,
    tamanoEmpresa,
    programaId,
    fechaDesde,
    fechaHasta,
    busqueda,
    asignacion
  } = filtros;

  const skip = (page - 1) * limit;
  const where: any = {};
  const ESTATUS_PRICIPAL_PROMOCION: EstatusSolicitud[] = ['EN_REVISION', 'EN_CORRECION', 'PENDIENTE', 'BORRADOR'];
  if (estatus) {
    const estatusArray = estatus.split(',').map(s => s.trim()) as EstatusSolicitud[];
    const estatusFiltrados = estatusArray.filter(e => ESTATUS_PRICIPAL_PROMOCION.includes(e));
    const estatusAplicar = estatusFiltrados.length > 0 ? estatusFiltrados : ESTATUS_PRICIPAL_PROMOCION;
    where.estatus = estatusAplicar.length === 1
      ? estatusAplicar[0]
      : { in: estatusAplicar };
  } else {
    where.estatus = { in: ESTATUS_PRICIPAL_PROMOCION };
  }
  if (tipoPersona) where.tipoPersona = tipoPersona;
  if (sector) where.sector = sector;
  if (tamanoEmpresa) where.tamanoEmpresa = tamanoEmpresa;
  if (programaId) where.programaId = programaId;

  if (fechaDesde || fechaHasta) {
    where.creadoEn = {};
    if (fechaDesde) where.creadoEn.gte = new Date(fechaDesde);
    if (fechaHasta) where.creadoEn.lte = new Date(fechaHasta + "T23:59:59");
  }

  if (busqueda) {
    where.OR = [
      {
        datosSolicitante: {
          OR: [
            { nombre: { contains: busqueda, mode: "insensitive" } },
            { apellidoPaterno: { contains: busqueda, mode: "insensitive" } },
            { rfc: { contains: busqueda, mode: "insensitive" } },
          ],
        },
      },
    ];
  }
  // ── FIX: asignacion -> asignaciones, con some/none ──────────────────────
  if (asignacion === 'asignados') {
    where.asignaciones = { some: { activa: true } };
  }
  if (asignacion === 'sin_asignar') {
    where.asignaciones = { none: { activa: true } };
  }

  const [solicitudes, total] = await Promise.all([
    prisma.solicitud.findMany({
      where,
      skip,
      take: limit,
      orderBy: { creadoEn: "desc" },
      include: {
        programa: {
          select: {
            id: true,
            nombre: true,
            documentosRequeridos: {
              where: { esObligatorio: true },
              select: { tipoDocumentoId: true, esObligatorio: true },
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
              select: { id: true, nombre: true, apellidoPaterno: true, apellidoMaterno: true },
            },
          },
        },
        documentos: {
          where: { activo: true },
          select: { tipoDocumentoId: true, estatus: true, activo: true },
        },
      },
    }),
    prisma.solicitud.count({ where }),
  ]);

  // ── FIX: aplanar asignaciones[] -> gestorAsignado ────────────────────────
  const solicitudesConMetricas = solicitudes.map((s) => {
    const { asignaciones, ...resto } = s;
    return {
      ...resto,
      metricas: calcularMetricas(s),
      gestorAsignado: asignaciones[0] ?? null,
    };
  });

  return {
    data: solicitudesConMetricas,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const statsPromocion = async () => {
  const [total, borrador, pendiente, enRevision, aprobado, rechazado] =
    await Promise.all([
      prisma.solicitud.count(),
      prisma.solicitud.count({ where: { estatus: "BORRADOR" } }),
      prisma.solicitud.count({ where: { estatus: "PENDIENTE" } }),
      prisma.solicitud.count({ where: { estatus: "EN_REVISION" } }),
      prisma.solicitud.count({ where: { estatus: "APROBADO" } }),
      prisma.solicitud.count({ where: { estatus: "RECHAZADO" } }),
    ]);

  return { total, borrador, pendiente, enRevision, aprobado, rechazado };
};

export const listarMisCasos = async (filtros: FiltrosMisCasos) => {
  const {
    gestorId,
    page,
    limit,
    estatus,
    tipoPersona,
    sector,
    tamanoEmpresa,
    programaId,
    fechaDesde,
    fechaHasta,
    busqueda,
  } = filtros;

  const skip = (page - 1) * limit;
  const ESTATUS_MIS_CASOS: EstatusSolicitud[] = ['EN_REVISION', 'EN_CORRECION'];
  // ── FIX: asignacion -> asignaciones, con some ────────────────────────────
  const where: any = {
    asignaciones: {
      some: {
        gestorId,
        activa: true,
      },
    },
  };

  if (estatus) {
    const estatusArray = estatus.split(',').map(s => s.trim()) as EstatusSolicitud[];
    const estatusFiltrados = estatusArray.filter(e => ESTATUS_MIS_CASOS.includes(e));
    const estatusAplicar = estatusFiltrados.length > 0 ? estatusFiltrados : ESTATUS_MIS_CASOS;
    where.estatus = estatusAplicar.length === 1
      ? estatusAplicar[0]
      : { in: estatusAplicar };
  } else {
    where.estatus = { in: ESTATUS_MIS_CASOS };
  }

  if (tipoPersona) where.tipoPersona = tipoPersona;
  if (sector) where.sector = sector;
  if (tamanoEmpresa) where.tamanoEmpresa = tamanoEmpresa;
  if (programaId) where.programaId = programaId;

  if (fechaDesde || fechaHasta) {
    where.creadoEn = {};
    if (fechaDesde) where.creadoEn.gte = new Date(fechaDesde);
    if (fechaHasta) where.creadoEn.lte = new Date(fechaHasta + "T23:59:59");
  }

  if (busqueda) {
    where.OR = [
      {
        datosSolicitante: {
          OR: [
            { nombre: { contains: busqueda, mode: "insensitive" } },
            { apellidoPaterno: { contains: busqueda, mode: "insensitive" } },
            { rfc: { contains: busqueda, mode: "insensitive" } },
          ],
        },
      },
    ];
  }

  const [solicitudes, total] = await Promise.all([
    prisma.solicitud.findMany({
      where,
      skip,
      take: limit,
      orderBy: { creadoEn: "desc" },
      include: {
        programa: {
          select: {
            id: true,
            nombre: true,
            documentosRequeridos: {
              where: { esObligatorio: true },
              select: { tipoDocumentoId: true, esObligatorio: true },
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
        // ── FIX: filtrar también por gestorId+activa aquí para consistencia ─
        asignaciones: {
          where: { activa: true, gestorId },
          take: 1,
          select: {
            fechaAsignacion: true,
            gestor: {
              select: {
                id: true,
                nombre: true,
                apellidoPaterno: true,
                apellidoMaterno: true,
              },
            },
          },
        },
        documentos: {
          where: { activo: true },
          select: { tipoDocumentoId: true, estatus: true, activo: true },
        },
        historialEstatus: {
          where: { estatusNuevo: 'EN_REVISION' },
          orderBy: { creadoEn: 'desc' },
          take: 1,
          select: {
            motivo: true,
            creadoEn: true,
            usuario: {
              select: { nombre: true, apellidoPaterno: true },
            },
          },
        },
      },
    }),
    prisma.solicitud.count({ where }),
  ]);

  const solicitudesConMetricas = solicitudes.map((s) => {
    const { asignaciones, historialEstatus, ...resto } = s;
    return {
      ...resto,
      metricas: calcularMetricas(s),
      comentarioPromotor: historialEstatus[0]?.motivo ?? null,
      gestorAsignado: asignaciones[0] ?? null,
    };
  });

  return {
    data: solicitudesConMetricas,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const listarAprobacion = async (filtros: Omit<FiltrosPromocion, 'estatus' | 'asignacion'>) => {
  const { page, limit, tipoPersona, sector, tamanoEmpresa, programaId, fechaDesde, fechaHasta, busqueda } = filtros;
  const skip = (page - 1) * limit;

  const where: any = {
    estatus: { in: ["EN_APROBACION"] },
  };

  if (tipoPersona) where.tipoPersona = tipoPersona;
  if (sector) where.sector = sector;
  if (tamanoEmpresa) where.tamanoEmpresa = tamanoEmpresa;
  if (programaId) where.programaId = programaId;

  if (fechaDesde || fechaHasta) {
    where.creadoEn = {};
    if (fechaDesde) where.creadoEn.gte = new Date(fechaDesde);
    if (fechaHasta) where.creadoEn.lte = new Date(fechaHasta + "T23:59:59");
  }

  if (busqueda) {
    where.OR = [{
      datosSolicitante: {
        OR: [
          { nombre: { contains: busqueda, mode: "insensitive" } },
          { apellidoPaterno: { contains: busqueda, mode: "insensitive" } },
          { rfc: { contains: busqueda, mode: "insensitive" } },
        ],
      },
    }];
  }

  const [solicitudes, total] = await Promise.all([
    prisma.solicitud.findMany({
      where,
      skip,
      take: limit,
      orderBy: { creadoEn: "desc" },
      include: {
        programa: {
          select: {
            id: true,
            nombre: true,
            documentosRequeridos: {
              where: { esObligatorio: true },
              select: { tipoDocumentoId: true, esObligatorio: true },
            },
          },
        },
        datosSolicitante: {
          select: {
            id: true, nombre: true, apellidoPaterno: true,
            apellidoMaterno: true, rfc: true, correo: true, celular: true,
          },
        },
        asignaciones: {
          where: { activa: true },
          take: 1,
          select: {
            fechaAsignacion: true,
            gestor: {
              select: { id: true, nombre: true, apellidoPaterno: true, apellidoMaterno: true },
            },
          },
        },
        documentos: {
          where: { activo: true },
          select: { tipoDocumentoId: true, estatus: true, activo: true },
        },
        historialEstatus: {
          where: { estatusNuevo: 'EN_APROBACION' },
          orderBy: { creadoEn: 'desc' },
          take: 1,
          select: {
            motivo: true,
            creadoEn: true,
            usuario: {
              select: { nombre: true, apellidoPaterno: true },
            },
          },
        },
      },
    }),
    prisma.solicitud.count({ where }),
  ]);

  const solicitudesConMetricas = solicitudes.map((s) => {
    const { asignaciones, historialEstatus, ...resto } = s;
    return {
      ...resto,
      metricas: calcularMetricas(s),
      comentarioPromotor: historialEstatus[0]?.motivo ?? null,
      gestorAsignado: asignaciones[0] ?? null,
    };
  });

  return {
    data: solicitudesConMetricas,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const listarHistorico = async (filtros: Omit<FiltrosPromocion, 'estatus' | 'asignacion'>) => {
  const { page, limit, tipoPersona, sector, tamanoEmpresa, programaId, fechaDesde, fechaHasta, busqueda } = filtros;
  const skip = (page - 1) * limit;

  const where: any = {
    estatus: { notIn: ESTATUS_HISTORICO_PROMOCION },
  };

  if (tipoPersona) where.tipoPersona = tipoPersona;
  if (sector) where.sector = sector;
  if (tamanoEmpresa) where.tamanoEmpresa = tamanoEmpresa;
  if (programaId) where.programaId = programaId;

  if (fechaDesde || fechaHasta) {
    where.creadoEn = {};
    if (fechaDesde) where.creadoEn.gte = new Date(fechaDesde);
    if (fechaHasta) where.creadoEn.lte = new Date(fechaHasta + "T23:59:59");
  }

  if (busqueda) {
    where.OR = [{
      datosSolicitante: {
        OR: [
          { nombre: { contains: busqueda, mode: "insensitive" } },
          { apellidoPaterno: { contains: busqueda, mode: "insensitive" } },
          { rfc: { contains: busqueda, mode: "insensitive" } },
        ],
      },
    }];
  }

  const [solicitudes, total] = await Promise.all([
    prisma.solicitud.findMany({
      where,
      skip,
      take: limit,
      orderBy: { creadoEn: "desc" },
      include: {
        programa: {
          select: {
            id: true,
            nombre: true,
            documentosRequeridos: {
              where: { esObligatorio: true },
              select: { tipoDocumentoId: true, esObligatorio: true },
            },
          },
        },
        datosSolicitante: {
          select: {
            id: true, nombre: true, apellidoPaterno: true,
            apellidoMaterno: true, rfc: true, correo: true, celular: true,
          },
        },
        asignaciones: {
          where: { activa: true },
          take: 1,
          select: {
            fechaAsignacion: true,
            gestor: {
              select: { id: true, nombre: true, apellidoPaterno: true, apellidoMaterno: true },
            },
          },
        },
        documentos: {
          where: { activo: true },
          select: { tipoDocumentoId: true, estatus: true, activo: true },
        },
        historialEstatus: {
          orderBy: { creadoEn: 'desc' },
          take: 1,
          select: {
            motivo: true,
            creadoEn: true,
            usuario: {
              select: { nombre: true, apellidoPaterno: true },
            },
          },
        },
      },
    }),
    prisma.solicitud.count({ where }),
  ]);

  const solicitudesConMetricas = solicitudes.map((s) => {
    const { asignaciones, historialEstatus, ...resto } = s;
    return {
      ...resto,
      metricas: calcularMetricas(s),
      comentarioPromotor: historialEstatus[0]?.motivo ?? null,
      gestorAsignado: asignaciones[0] ?? null,
    };
  });

  return {
    data: solicitudesConMetricas,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};


export const devolverAlSolicitante = async (
  solicitudId: string,
  dto: DevolverAlSolicitanteDto,
  usuarioId: string
) => {
  const solicitud = await validarTransicion(solicitudId, ['PENDIENTE', 'EN_REVISION', 'EN_APROBACION'])

  return prisma.$transaction(async (tx) => {
    const actualizada = await tx.solicitud.update({
      where: { id: solicitudId },
      data: { estatus: 'EN_CORRECION' },
      include: incluyeTodo,
    })

    await registrarHistorial(tx, solicitudId, solicitud.estatus, 'EN_CORRECION', usuarioId, dto.motivo)

    return actualizada
  })
}

export const regresarAlPromotor = async (
  solicitudId: string,
  dto: DevolverAlSolicitanteDto,
  usuarioId: string
) => {
  const solicitud = await validarTransicion(solicitudId, ['EN_APROBACION'])

  return prisma.$transaction(async (tx) => {
    const actualizada = await tx.solicitud.update({
      where: { id: solicitudId },
      data: { estatus: 'EN_REVISION' },
      include: incluyeTodo,
    })

    await registrarHistorial(tx, solicitudId, solicitud.estatus, 'EN_REVISION', usuarioId, dto.motivo)

    return actualizada
  })
}

export const enviarAAprobacion = async (
  solicitudId: string,
  dto: EnviarAAprobacionDto,
  usuarioId: string
) => {
  const solicitud = await validarTransicion(solicitudId, ['EN_REVISION'])

  return prisma.$transaction(async (tx) => {
    const actualizada = await tx.solicitud.update({
      where: { id: solicitudId },
      data: { estatus: 'EN_APROBACION' },
      include: incluyeTodo,
    })

    await registrarHistorial(tx, solicitudId, solicitud.estatus, 'EN_APROBACION', usuarioId, dto.motivo)

    return actualizada
  })
}

export const enviarAFinanciamiento = async (
  solicitudId: string,
  dto: EnviarAFinanciamientoDto,
  usuarioId: string
) => {
  const solicitud = await validarTransicion(solicitudId, ['EN_APROBACION'])

  return prisma.$transaction(async (tx) => {
    const actualizada = await tx.solicitud.update({
      where: { id: solicitudId },
      data: { estatus: 'EN_FINANCIAMIENTO' },
      include: incluyeTodo,
    })

    await registrarHistorial(tx, solicitudId, solicitud.estatus, 'EN_FINANCIAMIENTO', usuarioId, dto.motivo)

    return actualizada
  })
}

export const cancelar = async (
  solicitudId: string,
  dto: CancelarDto,
  usuarioId: string
) => {
  const solicitud = await validarTransicion(solicitudId, ['PENDIENTE', 'EN_REVISION', 'EN_APROBACION'])

  return prisma.$transaction(async (tx) => {
    const actualizada = await tx.solicitud.update({
      where: { id: solicitudId },
      data: { estatus: 'CANCELADO' },
      include: incluyeTodo,
    })

    await registrarHistorial(tx, solicitudId, solicitud.estatus, 'CANCELADO', usuarioId, dto.motivo)

    return actualizada
  })
}

export const rechazar = async (
  solicitudId: string,
  dto: RechazarDto,
  usuarioId: string
) => {
  const solicitud = await validarTransicion(solicitudId, ['EN_REVISION', 'EN_APROBACION', 'EN_FINANCIAMIENTO'])

  return prisma.$transaction(async (tx) => {
    const actualizada = await tx.solicitud.update({
      where: { id: solicitudId },
      data: { estatus: 'RECHAZADO' },
      include: incluyeTodo,
    })

    await registrarHistorial(tx, solicitudId, solicitud.estatus, 'RECHAZADO', usuarioId, dto.motivo)

    return actualizada
  })
}