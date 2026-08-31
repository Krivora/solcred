import prisma from "@config/db";
import { AppError } from "@middlewares/error.middleware";
import { EstatusSolicitud, Prisma } from "../../../../generated/prisma/client";
import { paginado } from "@utils/pagination";
import {
  INCLUDE_SOLICITUD_BASE,
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
  /** "Mis casos" y filtro de la pantalla de Asignación: limita a este analista (Personal.id). */
  analistaId?: string;
  /** Pantalla de Asignación: `sin_asignar` = sin analista activo; `asignados` = con analista. */
  asignacion?: "asignados" | "sin_asignar";
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

/**
 * Include estático de los listados de etapa. Al no depender de la forma del
 * argumento, el resultado de `findMany` queda completamente tipado (sin
 * `as any` en el map) y el `select` del historial se limita a lo que se usa.
 */
function buildIncludeListado(estatus: EstatusSolicitud | EstatusSolicitud[]) {
  return {
    ...INCLUDE_SOLICITUD_BASE,
    // "Comentario dejado al entrar a esta etapa": última transición hacia
    // alguno de los estatus de la vista.
    historialEstatus: {
      where: { estatusNuevo: Array.isArray(estatus) ? { in: estatus } : estatus },
      orderBy: { creadoEn: "desc" as const },
      take: 1,
      select: { motivo: true },
    },
    datosCredito: {
      select: { plazoMeses: true, conceptos: { select: { monto: true } } },
    },
    asignacionesFinanciamiento: ASIGNACION_FINANCIAMIENTO_ACTIVA,
  } satisfies Prisma.SolicitudInclude;
}

// El where se arma dinámicamente a partir de filtros que llegan como string de
// la query; Prisma valida el shape al ejecutarse.
function construirWhere(
  estatus: EstatusSolicitud | EstatusSolicitud[],
  filtros: FiltrosFinanciamiento
): Prisma.SolicitudWhereInput {
  const { tipoPersona, sector, tamanoEmpresa, programaId, fechaDesde, fechaHasta, busqueda, analistaId, asignacion } =
    filtros;

  const where: Record<string, unknown> = {
    estatus: Array.isArray(estatus) ? { in: estatus } : estatus,
  };

  if (tipoPersona) where.tipoPersona = tipoPersona;
  if (sector) where.sector = sector;
  if (tamanoEmpresa) where.tamanoEmpresa = tamanoEmpresa;
  if (programaId) where.programaId = programaId;

  if (fechaDesde || fechaHasta) {
    where.creadoEn = {
      ...(fechaDesde && { gte: new Date(fechaDesde) }),
      ...(fechaHasta && { lte: new Date(fechaHasta + "T23:59:59") }),
    };
  }

  if (analistaId) {
    where.asignacionesFinanciamiento = { some: { analistaId, activa: true } };
  } else if (asignacion === "asignados") {
    where.asignacionesFinanciamiento = { some: { activa: true } };
  } else if (asignacion === "sin_asignar") {
    where.asignacionesFinanciamiento = { none: { activa: true } };
  }

  if (busqueda) {
    where.OR = [
      {
        datosSolicitante: {
          is: {
            OR: [
              { nombre: { contains: busqueda, mode: "insensitive" } },
              { apellidoPaterno: { contains: busqueda, mode: "insensitive" } },
              { rfc: { contains: busqueda, mode: "insensitive" } },
            ],
          },
        },
      },
    ];
  }

  return where as Prisma.SolicitudWhereInput;
}

export const listarPorEtapa = async (
  estatus: EstatusSolicitud | EstatusSolicitud[],
  filtros: FiltrosFinanciamiento
) => {
  const { page, pageSize } = filtros;
  const skip = (page - 1) * pageSize;
  const where = construirWhere(estatus, filtros);
  const include = buildIncludeListado(estatus);

  const [solicitudes, total] = await Promise.all([
    prisma.solicitud.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { creadoEn: "desc" },
      include,
    }),
    prisma.solicitud.count({ where }),
  ]);

  const data = solicitudes.map((s) => {
    const { asignaciones, asignacionesFinanciamiento, historialEstatus, datosCredito, ...resto } = s;
    return {
      ...resto,
      metricas: calcularMetricas(s),
      montoSolicitado: datosCredito
        ? datosCredito.conceptos.reduce((acc, c) => acc + c.monto, 0)
        : null,
      plazoSolicitado: datosCredito?.plazoMeses ?? null,
      comentarioPromotor: historialEstatus[0]?.motivo ?? null,
      gestorAsignado: asignaciones[0] ?? null,
      analistaAsignado: asignacionesFinanciamiento[0] ?? null,
    };
  });

  return paginado(data, page, pageSize, total);
};

/**
 * Conteo por estatus. Cada campo es exactamente un estatus — `asignacion` son
 * las pendientes de asignar (`EN_ASIGNACION`), no todo lo visible en la pantalla
 * de Asignación (que además lista `EN_ANALISIS` para poder reasignar). Un badge
 * de "por asignar" debe usar `asignacion`; uno de "carga del área", `asignacion + analisis`.
 */
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

/**
 * Analistas activos con su carga de casos vigentes (para el selector de
 * asignación). Shape aplanado, igual que `obtenerCargaGestores` de Promoción,
 * para reutilizar los componentes de tarjeta/carga.
 */
export const analistasDisponibles = async () => {
  const analistas = await prisma.personal.findMany({
    where: { rol: "ANALISTA", activo: true },
    select: {
      id: true,
      usuario: {
        select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true, correo: true },
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
    .map((a) => ({
      id: a.id,
      nombre: a.usuario.nombre,
      apellidoPaterno: a.usuario.apellidoPaterno,
      apellidoMaterno: a.usuario.apellidoMaterno,
      correo: a.usuario.correo,
      cargaActual: mapa.get(a.id) ?? 0,
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
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

export interface ResultadoAsignacion {
  solicitudId: string;
  exito: boolean;
  mensaje?: string;
}

const ESTATUS_REASIGNABLES: EstatusSolicitud[] = ["EN_ANALISIS", "EN_VALIDACION", "EN_COMITE"];

/**
 * Asigna (o reasigna) un analista a una o varias solicitudes.
 *  - `EN_ASIGNACION`  → crea la asignación y avanza a `EN_ANALISIS`.
 *  - `EN_ANALISIS` / `EN_VALIDACION` / `EN_COMITE` → **reasignación**: cambia el
 *    analista activo sin mover el estatus.
 * No lanza por solicitud individual: devuelve un `ResultadoAsignacion` por cada una.
 */
export const asignarAnalistas = async (
  solicitudIds: string[],
  analistaId: string,
  asignadoPorPersonalId: string | null,
  motivo: string | undefined,
  usuarioId: string
): Promise<ResultadoAsignacion[]> => {
  const analista = await prisma.personal.findFirst({
    where: { id: analistaId, rol: "ANALISTA", activo: true },
  });
  if (!analista) throw new AppError("El analista indicado no existe o no está activo", 422);

  const resultados: ResultadoAsignacion[] = [];

  for (const solicitudId of solicitudIds) {
    try {
      resultados.push(
        await prisma.$transaction(async (tx) => {
          // Serializa cualquier (re)asignación concurrente sobre esta solicitud:
          // sin este lock, dos peticiones simultáneas podrían dejar dos
          // `AsignacionFinanciamiento` activas a la vez.
          await tx.$queryRaw`SELECT id FROM "Solicitud" WHERE id = ${solicitudId} FOR UPDATE`;

          const solicitud = await tx.solicitud.findUnique({
            where: { id: solicitudId },
            select: {
              estatus: true,
              asignacionesFinanciamiento: {
                where: { activa: true },
                select: { analistaId: true },
              },
            },
          });
          if (!solicitud) throw new AppError("Solicitud no encontrada", 404);

          const asignacionActiva = solicitud.asignacionesFinanciamiento[0] ?? null;
          if (asignacionActiva?.analistaId === analistaId) {
            return { solicitudId, exito: true, mensaje: "Ya estaba asignada a ese analista" };
          }

          const esAlta = solicitud.estatus === "EN_ASIGNACION";
          if (!esAlta && !ESTATUS_REASIGNABLES.includes(solicitud.estatus)) {
            throw new AppError(`No se puede asignar en estatus ${solicitud.estatus}`, 422);
          }

          // Cierra la asignación activa (no-op en el alta: aún no hay ninguna).
          await tx.asignacionFinanciamiento.updateMany({
            where: { solicitudId, activa: true },
            data: {
              activa: false,
              fechaReasignacion: new Date(),
              motivoReasignacion: motivo ?? "Reasignación",
            },
          });

          await tx.asignacionFinanciamiento.create({
            data: { solicitudId, analistaId, asignadoPorId: asignadoPorPersonalId },
          });

          if (esAlta) {
            await tx.solicitud.update({
              where: { id: solicitudId },
              data: { estatus: "EN_ANALISIS" },
            });
            await registrarHistorial(tx, solicitudId, "EN_ASIGNACION", "EN_ANALISIS", usuarioId, motivo);
          }

          return { solicitudId, exito: true };
        })
      );
    } catch (error) {
      resultados.push({
        solicitudId,
        exito: false,
        mensaje: error instanceof AppError ? error.message : "Error desconocido al asignar",
      });
    }
  }

  return resultados;
};
