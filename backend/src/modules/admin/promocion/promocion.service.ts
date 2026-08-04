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
import { CartaRechazoPDFData, SolicitudPDFData, DatosPersonaPDF, TarjetaInformativaPDFData, AcuseEntregaExpedientePDFData } from "../../../shared/pdf/pdf.types";

const ESTATUS_RECHAZO: EstatusSolicitud[] = ["RECHAZADO", "CANCELADO"];

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
const INCLUDE_SOLICITUD_BASE = {
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
}

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
  }
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
}

// helper reutilizable
function calcularMetricas(solicitud: any) {
  const tipoPersona = solicitud.tipoPersona
  const requeridos = (solicitud.programa?.documentosRequeridos ?? []).filter((r: any) => {
    if (!r.aplicaA) return true
    if (!tipoPersona) return true
    return r.aplicaA === tipoPersona || r.aplicaA === 'AMBOS'
  })
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
    metricas: calcularMetricas(solicitud),
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
  const ESTATUS_PRICIPAL_PROMOCION: EstatusSolicitud[] = ['EN_REVISION', 'EN_CORRECCION', 'PENDIENTE', 'BORRADOR'];
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
      include: buildIncludeSolicitud(),
    }),
    prisma.solicitud.count({ where }),
  ]);

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
  const ESTATUS_MIS_CASOS: EstatusSolicitud[] = ['EN_REVISION', 'EN_CORRECCION'];
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
      include: buildIncludeSolicitud("EN_REVISION"),
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
    include: buildIncludeSolicitud("EN_APROBACION"),
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
    include: buildIncludeSolicitud(),
  }),
  prisma.solicitud.count({ where }),
]);

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
      data: { estatus: 'EN_CORRECCION' },
      include: incluyeTodo,
    })

    await registrarHistorial(tx, solicitudId, solicitud.estatus, 'EN_CORRECCION', usuarioId, dto.motivo)

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

export const SolicitudId = async (
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
const capitalizar = (texto: string): string =>
  texto
    .toLowerCase()
    .split(" ")
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(" ");

const construirDomicilio = (d: {
  calle?: string | null;
  numeroExterior?: string | null;
  numeroInterior?: string | null;
  colonia?: string | null;
  ciudad?: string | null;
  estado?: string | null;
  codigoPostal?: string | null;
}): string => {
  const partes = [
    d.calle,
    d.numeroExterior ? `#${d.numeroExterior}` : null,
    d.numeroInterior ? `Int. ${d.numeroInterior}` : null,
    d.colonia,
    d.ciudad,
    d.estado,
    d.codigoPostal ? `C.P. ${d.codigoPostal}` : null,
  ].filter(Boolean);

  return partes.length > 0 ? partes.join(", ") : "";
};

const mapearPersona = (p: {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  curp: string | null;
  rfc: string | null;
  telefono: string | null;
  celular: string | null;
  correo: string | null;
  calle: string | null;
  numeroExterior: string | null;
  numeroInterior: string | null;
  colonia: string | null;
  ciudad: string | null;
  estado: string | null;
  codigoPostal: string | null;
  nivelEstudio: string | null;
  universidad: string | null;
  estadoCivil: string | null;
  nombreConyuge: string | null;
  numeroINE: string | null;
  tipoVivienda: string | null;
  aniosDomicilioActual: number | null;
  aniosDomicilioAnterior: number | null;
}): DatosPersonaPDF => ({
  nombreCompleto: `${p.nombre} ${p.apellidoPaterno} ${p.apellidoMaterno}`,
  curp: p.curp,
  rfc: p.rfc,
  telefono: p.telefono,
  celular: p.celular,
  correo: p.correo,
  domicilio: construirDomicilio(p),
  nivelEstudio: p.nivelEstudio,
  universidad: p.universidad,
  estadoCivil: p.estadoCivil,
  nombreConyuge: p.nombreConyuge,
  numeroINE: p.numeroINE,
  tipoVivienda: p.tipoVivienda,
  aniosDomicilioActual: p.aniosDomicilioActual,
  aniosDomicilioAnterior: p.aniosDomicilioAnterior,
});

const formatearFechaHora = (fecha: Date): string =>
  fecha.toLocaleString("es-MX", {
    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

const formatearFecha = (fecha: Date): string =>
  fecha.toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });

const nombreUsuario = (u: { nombre: string; apellidoPaterno: string; apellidoMaterno: string }): string =>
  `${u.nombre} ${u.apellidoPaterno} ${u.apellidoMaterno}`;
const cargoPorRol = (rol: string): string => {
  const cargos: Record<string, string> = {
    ADMIN: "Administrador",
    ANALISTA: "Analista de Crédito",
    GESTOR: "Gestor",
  };
  return cargos[rol] ?? rol;
};
export const mapearSolicitudAPDF = (
  solicitud: Awaited<ReturnType<typeof SolicitudId>>
): SolicitudPDFData => {
  return {
    folio: solicitud.folio,
    estatus: solicitud.estatus,
    programa: solicitud.programa.nombre,
    fechaSolicitud: formatearFecha(solicitud.creadoEn) ?? "",
    tipoPersona: solicitud.tipoPersona,
    sector: solicitud.sector,
    tamanoEmpresa: solicitud.tamanoEmpresa,

    datosSolicitante: solicitud.datosSolicitante
      ? mapearPersona(solicitud.datosSolicitante)
      : null,

    datosAval: solicitud.datosAval
      ? mapearPersona(solicitud.datosAval)
      : null,

    datosNegocio: solicitud.datosNegocio
      ? {
        razonSocial: solicitud.datosNegocio.razonSocial,
        rfcNegocio: solicitud.datosNegocio.rfcNegocio,
        nombreNegocio: solicitud.datosNegocio.nombreNegocio,
        domicilioNegocio: [
          solicitud.datosNegocio.domicilioNegocio,
          solicitud.datosNegocio.numeroExteriorNegocio ? `#${solicitud.datosNegocio.numeroExteriorNegocio}` : null,
          solicitud.datosNegocio.numeroInteriorNegocio ? `Int. ${solicitud.datosNegocio.numeroInteriorNegocio}` : null,
          solicitud.datosNegocio.coloniaLocal,
          solicitud.datosNegocio.municipioLocal,
          solicitud.datosNegocio.estadoLocal,
          solicitud.datosNegocio.codigoPostalLocal ? `C.P. ${solicitud.datosNegocio.codigoPostalLocal}` : null,
        ].filter(Boolean).join(", "),
        actividadNegocio: solicitud.datosNegocio.actividadNegocio,
        areaNegocio: solicitud.datosNegocio.areaNegocio,
        empleosConservados: solicitud.datosNegocio.empleosConservados,
        empleosNuevos: solicitud.datosNegocio.empleosNuevos,
        fechaInicioOperaciones: formatearFecha(solicitud.datosNegocio.fechaInicioOperaciones),
        antiguedadNegocio: solicitud.datosNegocio.antiguedadNegocio,
        tipoLocal: solicitud.datosNegocio.tipoLocal,
        experienciaActividadSolicitante: solicitud.datosNegocio.experienciaActividadSolicitante,
        experienciaEmpresarioSolicitante: solicitud.datosNegocio.experienciaEmpresarioSolicitante,
        actualExporta: solicitud.datosNegocio.actualExporta,
        telefonoRecadosNegocio: solicitud.datosNegocio.telefonoRecadosNegocio,
        telefonoFijoNegocio: solicitud.datosNegocio.telefonoFijoNegocio,
      }
      : null,

    datosCredito: solicitud.datosCredito
      ? {
        plazoMeses: solicitud.datosCredito.plazoMeses,
        mesesGracia: solicitud.datosCredito.mesesGracia,
        montoTotal: solicitud.datosCredito.conceptos.reduce((sum, c) => sum + c.monto, 0),
        conceptos: solicitud.datosCredito.conceptos.map((c) => ({
          categoria: c.categoria,
          concepto: c.concepto,
          monto: c.monto,
        })),
      }
      : null,

    datosGarantia:
      solicitud.datosGarantia && solicitud.datosGarantia.garantias.length > 0
        ? solicitud.datosGarantia.garantias.map((g) => ({
          tipo: g.tipo,
          nombrePropietario: g.nombrePropietario,
          valor: g.valor,
          descripcion: g.descripcion,
          marca: g.marca,
          modelo: g.modelo,
          anio: g.anio,
          numeroSerie: g.numeroSerie,
          domicilio:
            g.tipo === "HIPOTECARIA"
              ? construirDomicilio(g)
              : null,
          numeroEscritura: g.numeroEscritura,
          folioReal: g.folioReal,
        }))
        : null,

    datosMercado: solicitud.datosMercado
      ? {
        principalesProductos: solicitud.datosMercado.principalesProductos,
        distribucionClientes: [
          { label: "Mayoristas", valor: solicitud.datosMercado.porcentajeMayoristas },
          { label: "Detallistas", valor: solicitud.datosMercado.porcentajeDetallistas },
          { label: "Cliente final", valor: solicitud.datosMercado.porcentajeClienteFinal },
        ],
        coberturaGeografica: [
          { label: "Local", valor: solicitud.datosMercado.coberturaLocal },
          { label: "Regional", valor: solicitud.datosMercado.coberturaRegional },
          { label: "Estatal", valor: solicitud.datosMercado.coberturaEstatal },
          { label: "Nacional", valor: solicitud.datosMercado.coberturaNacional },
          { label: "Exportación", valor: solicitud.datosMercado.coberturaExportacion },
        ],
      }
      : null,

    datosBancarios: solicitud.datosBancarios
      ? {
        banco: solicitud.datosBancarios.banco,
        numeroCuenta: solicitud.datosBancarios.numeroCuenta,
        clabe: solicitud.datosBancarios.clabe,
      }
      : null,

    documentos:
      solicitud.documentos.length > 0
        ? solicitud.documentos.map((d) => ({
          nombreArchivo: d.nombreArchivo,
          tipoDocumento: d.tipoDocumento.nombre,
          estatus: d.estatus,
          fechaCarga: formatearFecha(d.subidoEn) ?? "",
        }))
        : null,
  };
};

export const mapearAcuseEntregaAPDF = (
  solicitud: Awaited<ReturnType<typeof SolicitudId>>,
  usuarioActual: {
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    personal: { rol: string } | null;
  },
  comentarios: string | null
): AcuseEntregaExpedientePDFData => {
  if (!solicitud.datosSolicitante) {
    throw new AppError("La solicitud no cuenta con datos del solicitante capturados", 400);
  }

  if (solicitud.documentos.length === 0) {
    throw new AppError("La solicitud no tiene documentos activos para generar el acuse", 400);
  }

  const montoTotal = solicitud.datosCredito
    ? solicitud.datosCredito.conceptos.reduce((sum, c) => sum + c.monto, 0)
    : 0;

  const documentoValidado = solicitud.documentos.find((d) => d.validadoPor);

  const entregaInfo = {
    nombre: nombreUsuario(usuarioActual).toUpperCase(),
    cargo: cargoPorRol(usuarioActual.personal?.rol ?? ""),
  };

  return {
    folio: solicitud.folio,
    lugar: "Hermosillo, Sonora",
    fecha: formatearFecha(new Date()),
    solicitanteNombre: mapearPersona(solicitud.datosSolicitante).nombreCompleto.toUpperCase(),
    programa: solicitud.programa.nombre,
    monto: montoTotal.toLocaleString("es-MX", { style: "currency", currency: "MXN" }),
    documentos: solicitud.documentos.map((d) => d.tipoDocumento.nombre),
    comentarios,
    entrega: entregaInfo,
    reviso: documentoValidado?.validadoPor
      ? {
        nombre: nombreUsuario(documentoValidado.validadoPor.usuario).toUpperCase(),
        cargo: cargoPorRol(documentoValidado.validadoPor.rol),
      }
      : entregaInfo,
  };
};

export const obtenerAcuseEntregaExpediente = async (
  solicitudId: string,
  usuarioId: string,
  rol: string,
  comentarios?: string | null
): Promise<AcuseEntregaExpedientePDFData> => {
  const solicitud = await SolicitudId(solicitudId, usuarioId, rol);

  const usuarioActual = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    include: { personal: true },
  });

  if (!usuarioActual) throw new AppError("Usuario no encontrado", 404);
  if (!usuarioActual.personal) throw new AppError("El usuario no tiene un perfil de personal asociado", 400);

  return mapearAcuseEntregaAPDF(solicitud, usuarioActual, comentarios ?? null);
};

export const obtenerCartaRechazo = async (
  solicitudId: string,
  usuarioId: string,
  rol: string
): Promise<CartaRechazoPDFData> => {
  const solicitud = await prisma.solicitud.findUnique({
    where: { id: solicitudId },
    include: incluyeTodo,
  });

  if (!solicitud) throw new AppError("Solicitud no encontrada", 404);

  if (rol === "CLIENTE" && solicitud.solicitanteId !== usuarioId) {
    throw new AppError("No tienes permisos para ver este documento", 403);
  }

  if (!ESTATUS_RECHAZO.includes(solicitud.estatus)) {
    throw new AppError("Solo se puede generar la carta para solicitudes rechazadas o canceladas", 400);
  }

  if (!solicitud.datosSolicitante) {
    throw new AppError("La solicitud no cuenta con datos del solicitante capturados", 400);
  }

  const historialRechazo = await prisma.historialEstatus.findFirst({
    where: {
      solicitudId,
      estatusNuevo: { in: ESTATUS_RECHAZO },
    },
    orderBy: { creadoEn: "desc" },
  });

  if (!historialRechazo || !historialRechazo.motivo) {
    throw new AppError("No se encontró un motivo de rechazo registrado para esta solicitud", 400);
  }

  const p = solicitud.datosSolicitante;
  const nombreCompleto = `${p.nombre} ${p.apellidoPaterno} ${p.apellidoMaterno}`.toUpperCase();

  const domicilioPartes = [
    p.calle,
    p.numeroExterior ? `#${p.numeroExterior}` : null,
    p.colonia ? `COL: ${p.colonia}` : null,
    p.codigoPostal ? `C.P: ${p.codigoPostal}` : null,
    p.ciudad,
    p.estado,
  ].filter(Boolean);

  const montoTotal = solicitud.datosCredito
    ? solicitud.datosCredito.conceptos.reduce((sum, c) => sum + c.monto, 0)
    : 0;

  return {
    folio: solicitud.folio,
    programa: solicitud.programa.nombre,
    monto: montoTotal.toLocaleString("es-MX", { style: "currency", currency: "MXN" }),
    fechaSolicitud: solicitud.creadoEn.toLocaleDateString("es-MX", {
      year: "numeric", month: "long", day: "numeric",
    }),
    fechaRechazo: historialRechazo.creadoEn.toLocaleDateString("es-MX", {
      year: "numeric", month: "long", day: "numeric",
    }),
    lugarFecha: `Hermosillo, Sonora a ${historialRechazo.creadoEn.toLocaleDateString("es-MX", {
      day: "numeric", month: "long", year: "numeric",
    })}`,
    nombreDestinatario: nombreCompleto,
    domicilioDestinatario: domicilioPartes.join(", "),
    motivoRechazo: capitalizar(historialRechazo.motivo),
  };
};
export const obtenerTarjetaInformativa = async (
  solicitudId: string,
  usuarioId: string,
  rol: string
): Promise<TarjetaInformativaPDFData> => {
  const solicitud = await prisma.solicitud.findUnique({
    where: { id: solicitudId },
    include: {
      ...incluyeTodo,
      solicitante: true,
      historialEstatus: {
        include: { usuario: true },
        orderBy: { creadoEn: "asc" },
      },
      asignaciones: {
        include: {
          gestor: { include: { usuario: true } },
          grupo: true,
          asignadoPor: { include: { usuario: true } },
        },
        orderBy: { fechaAsignacion: "asc" },
      },
      documentos: {
        where: { activo: true },
        include: { tipoDocumento: true },
        orderBy: { subidoEn: "desc" },
      },
    },
  });

  if (!solicitud) throw new AppError("Solicitud no encontrada", 404);

  if (rol === "CLIENTE" && solicitud.solicitanteId !== usuarioId) {
    throw new AppError("No tienes permisos para ver esta solicitud", 403);
  }

  // ── Documentos requeridos según el programa y tipo de persona ──
  const documentosRequeridosPrograma = await prisma.programaDocumento.findMany({
    where: {
      programaId: solicitud.programaId,
      esObligatorio: true,
      OR: [
        { aplicaA: null },
        ...(solicitud.tipoPersona
          ? [{ aplicaA: solicitud.tipoPersona as any }, { aplicaA: "AMBOS" as any }]
          : []),
      ],
    },
  });

  const totalRequeridos = documentosRequeridosPrograma.length;
  const totalSubidos = solicitud.documentos.length;
  const aprobados = solicitud.documentos.filter((d) => d.estatus === "APROBADO").length;
  const rechazados = solicitud.documentos.filter((d) => d.estatus === "RECHAZADO").length;
  const pendientes = solicitud.documentos.filter((d) => d.estatus === "PENDIENTE").length;
  const porcentajeAvance = totalRequeridos > 0 ? Math.round((aprobados / totalRequeridos) * 100) : 0;

  // ── Gestor actual (asignación activa) ──
  const asignacionActiva = solicitud.asignaciones.find((a) => a.activa) ?? null;

  const gestorActual = asignacionActiva
    ? {
      nombre: nombreUsuario(asignacionActiva.gestor.usuario),
      grupo: asignacionActiva.grupo.nombre,
      fechaAsignacion: formatearFecha(asignacionActiva.fechaAsignacion),
    }
    : null;

  const historialAsignaciones = solicitud.asignaciones.map((a) => ({
    gestor: nombreUsuario(a.gestor.usuario),
    grupo: a.grupo.nombre,
    fechaAsignacion: formatearFecha(a.fechaAsignacion),
    fechaReasignacion: a.fechaReasignacion ? formatearFecha(a.fechaReasignacion) : null,
    motivoReasignacion: a.motivoReasignacion,
    asignadoPor: a.asignadoPor ? nombreUsuario(a.asignadoPor.usuario) : null,
  }));

  // ── Historial de estatus ──
  const historialEstatus = solicitud.historialEstatus.map((h) => ({
    estatusAnterior: h.estatusAnterior,
    estatusNuevo: h.estatusNuevo,
    fecha: formatearFechaHora(h.creadoEn),
    usuario: nombreUsuario(h.usuario),
    motivo: h.motivo,
  }));

  // ── Timeline unificada: estatus + asignaciones, ordenada cronológicamente ──
  const eventosTimeline: { fechaRaw: Date; fecha: string; titulo: string; detalle: string | null; tipo: "estatus" | "asignacion" }[] = [];

  eventosTimeline.push({
    fechaRaw: solicitud.creadoEn,
    fecha: formatearFechaHora(solicitud.creadoEn),
    titulo: "Solicitud creada",
    detalle: `Folio ${solicitud.folio} — Programa ${solicitud.programa.nombre}`,
    tipo: "estatus",
  });

  solicitud.historialEstatus.forEach((h) => {
    eventosTimeline.push({
      fechaRaw: h.creadoEn,
      fecha: formatearFechaHora(h.creadoEn),
      titulo: `Cambio de estatus: ${h.estatusAnterior.replace(/_/g, " ")} → ${h.estatusNuevo.replace(/_/g, " ")}`,
      detalle: h.motivo ? `${nombreUsuario(h.usuario)} — ${h.motivo}` : nombreUsuario(h.usuario),
      tipo: "estatus",
    });
  });

  solicitud.asignaciones.forEach((a) => {
    eventosTimeline.push({
      fechaRaw: a.fechaAsignacion,
      fecha: formatearFechaHora(a.fechaAsignacion),
      titulo: `Asignado a ${nombreUsuario(a.gestor.usuario)}`, // ── FIX ──
      detalle: `Grupo: ${a.grupo.nombre}`,
      tipo: "asignacion",
    });
    if (a.fechaReasignacion) {
      eventosTimeline.push({
        fechaRaw: a.fechaReasignacion,
        fecha: formatearFechaHora(a.fechaReasignacion),
        titulo: `Reasignado — dejó de ser ${nombreUsuario(a.gestor.usuario)}`, // ── FIX ──
        detalle: a.motivoReasignacion,
        tipo: "asignacion",
      });
    }
  });

  eventosTimeline.sort((a, b) => a.fechaRaw.getTime() - b.fechaRaw.getTime());

  // ── Observaciones: motivos de rechazo de documentos + motivos de historial ──
  const observaciones: string[] = [];
  solicitud.documentos
    .filter((d) => d.motivoRechazo)
    .forEach((d) => observaciones.push(`Documento "${d.tipoDocumento.nombre}": ${d.motivoRechazo}`));

  const montoTotal = solicitud.datosCredito
    ? solicitud.datosCredito.conceptos.reduce((sum, c) => sum + c.monto, 0)
    : null;

  return {
    folio: solicitud.folio,
    solicitanteNombre: nombreUsuario(solicitud.solicitante),
    programa: solicitud.programa.nombre,
    fechaRegistro: formatearFecha(solicitud.creadoEn),
    montoSolicitado: montoTotal !== null ? montoTotal.toLocaleString("es-MX", { style: "currency", currency: "MXN" }) : null,
    municipio: solicitud.datosNegocio?.municipioLocal ?? solicitud.datosSolicitante?.ciudad ?? null,
    sector: solicitud.sector,
    tamanoEmpresa: solicitud.tamanoEmpresa,
    tipoPersona: solicitud.tipoPersona,
    estatusActual: solicitud.estatus,

    gestorActual,
    historialAsignaciones,
    historialEstatus,

    timeline: eventosTimeline.map(({ fecha, titulo, detalle, tipo }) => ({ fecha, titulo, detalle, tipo })),

    documentos: {
      totalRequeridos,
      totalSubidos,
      aprobados,
      rechazados,
      pendientes,
      porcentajeAvance,
      detalle: solicitud.documentos.map((d) => ({
        nombre: d.tipoDocumento.nombre,
        estatus: d.estatus,
        version: d.version,
        motivoRechazo: d.motivoRechazo,
      })),
    },

    observaciones,
  };
};