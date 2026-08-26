import prisma from "@config/db";
import { AppError } from "@middlewares/error.middleware";
import { CampoRegla, EstatusSolicitud, OperadorRegla } from "../../../../generated/prisma/client";
import { AsignarManualDto } from "./asignacion.schema";
const ESTATUS_REVISION: EstatusSolicitud[] = ["EN_REVISION"];

// ─── Tipos internos ──────────────────────────────────────────────────────────

interface SolicitudParaEvaluar {
    id: string;
    tipoPersona: string | null;
    sector: string | null;
    tamanoEmpresa: string | null;
    programaId: string;
}

interface FiltrosAsignacion {
    page: number;
    limit: number;
    estatus?: string;
    tipoPersona?: string;
    sector?: string;
    tamanoEmpresa?: string;
    programaId?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    busqueda?: string;
    asignacion?: string;
    gestorId?: string;   // filtrar por gestor específico
    grupoId?: string;    // filtrar por grupo específico
}

export interface ResultadoAsignacion {
    solicitudId: string;
    exito: boolean;
    mensaje?: string;
}
export const listarAsignacion = async (filtros: FiltrosAsignacion) => {
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
        asignacion,
        gestorId,
        grupoId,
    } = filtros;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (estatus) {
        const estatusArray = estatus.split(",").map((s) => s.trim()) as EstatusSolicitud[];
        where.estatus =
            estatusArray.length === 1 ? estatusArray[0] : { in: estatusArray };
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
            { folio: { contains: busqueda, mode: "insensitive" } },
        ];
    }

    // ── Filtro de asignación ──────────────────────────────────────────────────
    const condicionesAsignacion: any = {};

    if (asignacion === "asignados") {
        where.asignaciones = { some: { activa: true } };
    } else if (asignacion === "sin_asignar") {
        where.asignaciones = { none: { activa: true } };
    }

    if (gestorId) {
        condicionesAsignacion.gestorId = gestorId;
        condicionesAsignacion.activa = true;
    }

    if (grupoId) {
        condicionesAsignacion.grupoId = grupoId;
        condicionesAsignacion.activa = true;
    }

    if (Object.keys(condicionesAsignacion).length > 0) {
        where.asignaciones = { some: condicionesAsignacion };
    }

    const [solicitudes, total] = await Promise.all([
        prisma.solicitud.findMany({
            where,
            skip,
            take: limit,
            orderBy: { creadoEn: "desc" },
            include: {
                programa: { select: { id: true, nombre: true } },
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
                        grupoId: true,
                        grupo: { select: { id: true, nombre: true } },
                        // ── FIX: Personal -> usuario anidado ──────────────
                        gestor: {
                            select: {
                                id: true,
                                usuario: {
                                    select: {
                                        nombre: true,
                                        apellidoPaterno: true,
                                        apellidoMaterno: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        }),
        prisma.solicitud.count({ where }),
    ]);

    // ── Aplanar: de arreglo "asignaciones" a objeto singular "asignacion" ─────
    const data = solicitudes.map((sol) => {
        const { asignaciones, ...resto } = sol;
        const a = asignaciones[0] ?? null;
        return {
            ...resto,
            asignacion: a
                ? {
                    fechaAsignacion: a.fechaAsignacion,
                    grupoId: a.grupoId,
                    grupo: a.grupo,
                    gestor: {
                        id: a.gestor.id,
                        nombre: a.gestor.usuario.nombre,
                        apellidoPaterno: a.gestor.usuario.apellidoPaterno,
                        apellidoMaterno: a.gestor.usuario.apellidoMaterno,
                    },
                }
                : null,
        };
    });

    return {
        data,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
const evaluarRegla = async (
    regla: { campo: CampoRegla; operador: OperadorRegla; valor: string },
    solicitud: SolicitudParaEvaluar
): Promise<boolean> => {
    const valorSolicitud: string | number | null = await (async () => {
        switch (regla.campo) {
            case CampoRegla.TIPO_PERSONA: return solicitud.tipoPersona;
            case CampoRegla.SECTOR: return solicitud.sector;
            case CampoRegla.TAMANO_EMPRESA: return solicitud.tamanoEmpresa;
            case CampoRegla.PROGRAMA_ID: {
                // Resuelve el nombre del programa de la solicitud para comparar
                const programa = await prisma.programa.findUnique({
                    where: { id: solicitud.programaId },
                    select: { nombre: true },
                });
                return programa?.nombre ?? null;
            }
            default: return null;
        }
    })();

    if (valorSolicitud === null || valorSolicitud === undefined) return false;

    switch (regla.operador) {
        case OperadorRegla.IGUAL:
            return String(valorSolicitud) === regla.valor;
        case OperadorRegla.DIFERENTE:
            return String(valorSolicitud) !== regla.valor;
        case OperadorRegla.EN_LISTA: {
            const lista: string[] = JSON.parse(regla.valor);
            return lista.includes(String(valorSolicitud));
        }
        case OperadorRegla.MAYOR_QUE: return Number(valorSolicitud) > Number(regla.valor);
        case OperadorRegla.MENOR_QUE: return Number(valorSolicitud) < Number(regla.valor);
        case OperadorRegla.MAYOR_IGUAL: return Number(valorSolicitud) >= Number(regla.valor);
        case OperadorRegla.MENOR_IGUAL: return Number(valorSolicitud) <= Number(regla.valor);
        default: return false;
    }
};

const encontrarGrupo = async (
    solicitud: SolicitudParaEvaluar
): Promise<string | null> => {
    const grupos = await prisma.grupoGestion.findMany({
        where: { activo: true },
        include: {
            reglas: true,
            gestores: { where: { activo: true } },
        },
        orderBy: { prioridad: "desc" },
    });

    for (const grupo of grupos) {
        if (grupo.gestores.length === 0) continue;
        if (grupo.reglas.length === 0) continue;

        const resultados = await Promise.all(
            grupo.reglas.map((regla) => evaluarRegla(regla, solicitud))
        );
        const cumple = resultados.every(Boolean);

        if (cumple) return grupo.id;
    }

    const grupoGeneral = grupos.find(
        (g) => g.reglas.length === 0 && g.gestores.length > 0
    );

    return grupoGeneral?.id ?? null;
};

const elegirGestor = async (grupoId: string): Promise<string | null> => {
    const gestoresGrupo = await prisma.grupoGestor.findMany({
        where: { grupoId, activo: true },
        select: { gestorId: true },
    });

    if (gestoresGrupo.length === 0) return null;

    const gestorIds = gestoresGrupo.map((g) => g.gestorId);

    const cargas = await prisma.asignacionSolicitud.groupBy({
        by: ["gestorId"],
        where: { gestorId: { in: gestorIds }, activa: true },
        _count: { gestorId: true },
    });

    const mapaCargas = new Map<string, number>();
    gestorIds.forEach((id) => mapaCargas.set(id, 0));
    cargas.forEach((c) => mapaCargas.set(c.gestorId, c._count.gestorId));

    let gestorElegido = gestorIds[0];
    let menorCarga = mapaCargas.get(gestorIds[0]) ?? 0;

    for (const id of gestorIds) {
        const carga = mapaCargas.get(id) ?? 0;
        if (carga < menorCarga) {
            menorCarga = carga;
            gestorElegido = id;
        }
    }

    return gestorElegido;
};

// ─── Casos de uso ─────────────────────────────────────────────────────────────


export const asignarAutomaticamente = async (
    solicitudIds: string[]
): Promise<ResultadoAsignacion[]> => {
    const resultados: ResultadoAsignacion[] = [];

    for (const solicitudId of solicitudIds) {
        try {
            const solicitud = await prisma.solicitud.findUnique({
                where: { id: solicitudId },
                select: {
                    id: true,
                    tipoPersona: true,
                    sector: true,
                    tamanoEmpresa: true,
                    programaId: true,
                    asignaciones: { where: { activa: true } },
                },
            });

            if (!solicitud) {
                throw new AppError("Solicitud no encontrada", 404);
            }
            if (solicitud.asignaciones.length > 0) {
                // ya tiene asignación activa, no es error, simplemente se omite
                resultados.push({ solicitudId, exito: true, mensaje: "Ya tenía asignación activa" });
                continue;
            }

            const grupoId = await encontrarGrupo(solicitud as SolicitudParaEvaluar);
            if (!grupoId) {
                throw new AppError("No hay grupo disponible para esta solicitud", 422);
            }

            const gestorId = await elegirGestor(grupoId);
            if (!gestorId) {
                throw new AppError("No hay gestores disponibles en el grupo", 422);
            }

            await prisma.$transaction([
                prisma.asignacionSolicitud.create({
                    data: { solicitudId, gestorId, grupoId, asignadoPorId: null },
                }),
                prisma.solicitud.update({
                    where: { id: solicitudId },
                    data: { estatus: "EN_REVISION" },
                }),
            ]);

            resultados.push({ solicitudId, exito: true });
        } catch (error) {
            resultados.push({
                solicitudId,
                exito: false,
                mensaje:
                    error instanceof AppError
                        ? error.message
                        : "Error desconocido al asignar",
            });
            // no hace throw, sigue con la siguiente solicitud del array
        }
    }

    return resultados;
};
export const asignarManualmente = async (
    solicitudId: string,
    dto: AsignarManualDto,
    supervisorId: string
): Promise<void> => {
    const solicitud = await prisma.solicitud.findUnique({
        where: { id: solicitudId },
        include: {
            asignaciones: { where: { activa: true } },
        },
    });

    if (!solicitud) throw new AppError("Solicitud no encontrada", 404);

    const asignacionActiva = solicitud.asignaciones[0];

    // ── FIX: dto.gestorId es Personal.id, no Usuario.id ──────────────────
    const gestor = await prisma.personal.findUnique({
        where: { id: dto.gestorId },
        include: { gruposGestion: { where: { activo: true } } },
    });

    if (!gestor) throw new AppError("Gestor no encontrado", 404);
    if (!gestor.activo) throw new AppError("El gestor no está activo", 400);
    if (gestor.rol !== "GESTOR")
        throw new AppError("El usuario no es un gestor", 400);
    if (gestor.gruposGestion.length === 0)
        throw new AppError("El gestor no pertenece a ningún grupo activo", 400);

    const grupoId = gestor.gruposGestion[0].grupoId;

    await prisma.$transaction(async (tx) => {
        if (asignacionActiva) {
            await tx.asignacionSolicitud.update({
                where: { id: asignacionActiva.id },
                data: {
                    activa: false,
                    fechaReasignacion: new Date(),
                    motivoReasignacion: dto.motivo ?? "Reasignación manual",
                },
            });
        }

        await tx.asignacionSolicitud.create({
            data: {
                solicitudId,
                gestorId: dto.gestorId,
                grupoId,
                asignadoPorId: supervisorId,
            },
        });

        await tx.solicitud.update({
            where: { id: solicitudId },
            data: { estatus: "EN_REVISION" },
        });
    });
};

export const obtenerCargaGestores = async (grupoId?: string) => {
    const where = grupoId ? { grupoId, activo: true } : { activo: true };

    const gestores = await prisma.grupoGestor.findMany({
        where,
        select: {
            gestorId: true,
            grupoId: true,
            gestor: {
                select: {
                    id: true,
                    activo: true,
                    // ── FIX: nombre/apellidos/correo viven en usuario ──────
                    usuario: {
                        select: {
                            nombre: true,
                            apellidoPaterno: true,
                            apellidoMaterno: true,
                            correo: true,
                        },
                    },
                },
            },
        },
    });

    const gestorIds = gestores.map((g) => g.gestorId);

    const cargas = await prisma.asignacionSolicitud.groupBy({
        by: ["gestorId"],
        where: {
            gestorId: { in: gestorIds },
            activa: true,
            solicitud: {
                estatus: { in: ESTATUS_REVISION },
            },
        },
        _count: { gestorId: true },
    });

    const mapaCargas = new Map<string, number>();
    cargas.forEach((c) => mapaCargas.set(c.gestorId, c._count.gestorId));

    return gestores.map((g) => ({
        id: g.gestor.id,
        nombre: g.gestor.usuario.nombre,
        apellidoPaterno: g.gestor.usuario.apellidoPaterno,
        apellidoMaterno: g.gestor.usuario.apellidoMaterno,
        correo: g.gestor.usuario.correo,
        activo: g.gestor.activo,
        grupoId: g.grupoId,
        cargaActual: mapaCargas.get(g.gestorId) ?? 0,
    }));
};