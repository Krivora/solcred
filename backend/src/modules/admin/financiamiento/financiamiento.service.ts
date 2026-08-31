import prisma from "@config/db";
import { AppError } from "@middlewares/error.middleware";
import { EstatusSolicitud } from "../../../../generated/prisma/client";
import { paginado } from "@utils/pagination";
import {
  buildIncludeSolicitud,
  calcularMetricas,
  incluyeTodo,
  registrarHistorial,
  validarTransicion,
} from "@modules/admin/_shared/solicitud-estado";

export { obtenerSolicitudPorId } from "@modules/admin/_shared/solicitud-estado";

// ─────────────────────────────────────────────────────────────────────────────
// Listados por etapa
// ─────────────────────────────────────────────────────────────────────────────

export interface FiltrosFinanciamiento {
  page: number;
  pageSize: number;
  tipoPersona?: string;
  sector?: string;
  tamanoEmpresa?: string;
  programaId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  busqueda?: string;
  /** Solo "mis casos": limita a las asignadas a este analista (Personal.id). */
  analistaId?: string;
}

const ASIGNACION_FINANCIAMIENTO_ACTIVA = {
  where: { activa: true },
  take: 1,
  select: {
    fechaAsignacion: true,
    analista: {
      select: {
        id: true,
        usuario: {
          select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true },
        },
      },
    },
  },
} as const;

function construirWhere(estatus: EstatusSolicitud, filtros: FiltrosFinanciamiento) {
  const { tipoPersona, sector, tamanoEmpresa, programaId, fechaDesde, fechaHasta, busqueda, analistaId } =
    filtros;

  const where: any = { estatus };

  if (tipoPersona) where.tipoPersona = tipoPersona;
  if (sector) where.sector = sector;
  if (tamanoEmpresa) where.tamanoEmpresa = tamanoEmpresa;
  if (programaId) where.programaId = programaId;

  if (fechaDesde || fechaHasta) {
    where.creadoEn = {};
    if (fechaDesde) where.creadoEn.gte = new Date(fechaDesde);
    if (fechaHasta) where.creadoEn.lte = new Date(fechaHasta + "T23:59:59");
  }

  if (analistaId) {
    where.asignacionesFinanciamiento = { some: { analistaId, activa: true } };
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

  return where;
}

export const listarPorEtapa = async (
  estatus: EstatusSolicitud,
  filtros: FiltrosFinanciamiento
) => {
  const { page, pageSize } = filtros;
  const skip = (page - 1) * pageSize;
  const where = construirWhere(estatus, filtros);

  const [solicitudes, total] = await Promise.all([
    prisma.solicitud.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { creadoEn: "desc" },
      include: {
        ...buildIncludeSolicitud(estatus),
        asignacionesFinanciamiento: ASIGNACION_FINANCIAMIENTO_ACTIVA,
      },
    }),
    prisma.solicitud.count({ where }),
  ]);

  const data = solicitudes.map((s) => {
    const { asignaciones, asignacionesFinanciamiento, historialEstatus, ...resto } = s as any;
    return {
      ...resto,
      metricas: calcularMetricas(s),
      // "comentario dejado al entrar a esta etapa" — mismo campo que consume
      // `SolicitudesTable` en el frontend (columna Comentario).
      comentarioPromotor: historialEstatus?.[0]?.motivo ?? null,
      gestorAsignado: asignaciones?.[0] ?? null,
      analistaAsignado: asignacionesFinanciamiento?.[0] ?? null,
    };
  });

  return paginado(data, page, pageSize, total);
};

export const stats = async () => {
  const [mesaControl, asignacion, analisis, validacion, comite, aprobados, rechazados] =
    await Promise.all([
      prisma.solicitud.count({ where: { estatus: "EN_FINANCIAMIENTO" } }),
      prisma.solicitud.count({ where: { estatus: "EN_ASIGNACION" } }),
      prisma.solicitud.count({ where: { estatus: "EN_ANALISIS" } }),
      prisma.solicitud.count({ where: { estatus: "EN_VALIDACION" } }),
      prisma.solicitud.count({ where: { estatus: "EN_COMITE" } }),
      prisma.solicitud.count({ where: { estatus: "APROBADO" } }),
      prisma.solicitud.count({ where: { estatus: "RECHAZADO" } }),
    ]);

  return { mesaControl, asignacion, analisis, validacion, comite, aprobados, rechazados };
};

/** Analistas activos con su carga de casos vigentes (para el selector de asignación). */
export const analistasDisponibles = async () => {
  const analistas = await prisma.personal.findMany({
    where: { rol: "ANALISTA", activo: true },
    select: {
      id: true,
      usuario: {
        select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true },
      },
    },
  });

  const cargas = await prisma.asignacionFinanciamiento.groupBy({
    by: ["analistaId"],
    where: {
      activa: true,
      solicitud: { estatus: { in: ["EN_ANALISIS", "EN_VALIDACION", "EN_COMITE"] } },
    },
    _count: { analistaId: true },
  });

  const mapa = new Map(cargas.map((c) => [c.analistaId, c._count.analistaId]));

  return analistas
    .map((a) => ({ ...a, carga: mapa.get(a.id) ?? 0 }))
    .sort((a, b) => a.usuario.nombre.localeCompare(b.usuario.nombre));
};

// ─────────────────────────────────────────────────────────────────────────────
// Transiciones de estatus
// ─────────────────────────────────────────────────────────────────────────────

const transicion =
  (permitidos: EstatusSolicitud[], destino: EstatusSolicitud) =>
  async (solicitudId: string, motivo: string | undefined, usuarioId: string) => {
    const solicitud = await validarTransicion(solicitudId, permitidos);

    return prisma.$transaction(async (tx) => {
      const actualizada = await tx.solicitud.update({
        where: { id: solicitudId },
        data: { estatus: destino },
        include: incluyeTodo,
      });

      await registrarHistorial(tx, solicitudId, solicitud.estatus, destino, usuarioId, motivo);

      return actualizada;
    });
  };

// Mesa de Control
export const regresarAAprobacion = transicion(["EN_FINANCIAMIENTO"], "EN_APROBACION");
export const pasarAAsignacion = transicion(["EN_FINANCIAMIENTO"], "EN_ASIGNACION");

// Analista
export const enviarAValidacion = transicion(["EN_ANALISIS"], "EN_VALIDACION");

// Validación
export const regresarAAnalista = transicion(["EN_VALIDACION"], "EN_ANALISIS");
export const enviarAComite = transicion(["EN_VALIDACION"], "EN_COMITE");

// Comité
export const regresarAValidacion = transicion(["EN_COMITE"], "EN_VALIDACION");
export const aprobar = transicion(["EN_COMITE"], "APROBADO");

/** Asignación (o reasignación) de un analista: EN_ASIGNACION → EN_ANALISIS. */
export const asignarAnalista = async (
  solicitudId: string,
  analistaId: string,
  asignadoPorPersonalId: string | null,
  motivo: string | undefined,
  usuarioId: string
) => {
  await validarTransicion(solicitudId, ["EN_ASIGNACION"]);

  const analista = await prisma.personal.findFirst({
    where: { id: analistaId, rol: "ANALISTA", activo: true },
  });
  if (!analista) throw new AppError("El analista indicado no existe o no está activo", 422);

  return prisma.$transaction(async (tx) => {
    await tx.asignacionFinanciamiento.updateMany({
      where: { solicitudId, activa: true },
      data: { activa: false },
    });

    await tx.asignacionFinanciamiento.create({
      data: { solicitudId, analistaId, asignadoPorId: asignadoPorPersonalId },
    });

    const actualizada = await tx.solicitud.update({
      where: { id: solicitudId },
      data: { estatus: "EN_ANALISIS" },
      include: incluyeTodo,
    });

    await registrarHistorial(tx, solicitudId, "EN_ASIGNACION", "EN_ANALISIS", usuarioId, motivo);

    return actualizada;
  });
};
