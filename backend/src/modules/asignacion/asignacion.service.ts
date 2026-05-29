// src/modules/asignacion/asignacion.service.ts

import prisma from "../../config/db";
import { AppError } from "../../middlewares/error.middleware";
import { CampoRegla, OperadorRegla } from "../../../generated/prisma/client";

// ─── Tipos internos ──────────────────────────────────────────────────────────

interface SolicitudParaEvaluar {
    id: string;
    tipoPersona: string | null;
    sector: string | null;
    tamanoEmpresa: string | null;
    programaId: string;
    montoSolicitado: number | null;
}

interface CrearGrupoDto {
    nombre: string;
    descripcion?: string;
    prioridad?: number;
    reglas: ReglaDto[];
    gestorIds: string[];
}

interface ActualizarGrupoDto {
    nombre?: string;
    descripcion?: string;
    prioridad?: number;
    activo?: boolean;
    reglas?: ReglaDto[];
    gestorIds?: string[];
}

interface ReglaDto {
    campo: CampoRegla;
    operador: OperadorRegla;
    valor: string;
}

interface AsignarManualDto {
    gestorId: string;
    motivo?: string;
}

// ─── Motor de reglas ─────────────────────────────────────────────────────────

const evaluarRegla = (
    regla: { campo: CampoRegla; operador: OperadorRegla; valor: string },
    solicitud: SolicitudParaEvaluar
): boolean => {
    // Obtener el valor real de la solicitud según el campo
    const valorSolicitud: string | number | null = (() => {
        switch (regla.campo) {
            case CampoRegla.TIPO_PERSONA:
                return solicitud.tipoPersona;
            case CampoRegla.SECTOR:
                return solicitud.sector;
            case CampoRegla.TAMANO_EMPRESA:
                return solicitud.tamanoEmpresa;
            case CampoRegla.PROGRAMA_ID:
                return solicitud.programaId;
            case CampoRegla.MONTO_SOLICITADO:
                return solicitud.montoSolicitado;
            default:
                return null;
        }
    })();

    if (valorSolicitud === null || valorSolicitud === undefined) return false;

    switch (regla.operador) {
        case OperadorRegla.IGUAL:
            return String(valorSolicitud) === regla.valor;

        case OperadorRegla.DIFERENTE:
            return String(valorSolicitud) !== regla.valor;

        case OperadorRegla.EN_LISTA: {
            // valor almacenado como JSON: '["FISICA","MORAL"]'
            const lista: string[] = JSON.parse(regla.valor);
            return lista.includes(String(valorSolicitud));
        }

        case OperadorRegla.MAYOR_QUE:
            return Number(valorSolicitud) > Number(regla.valor);

        case OperadorRegla.MENOR_QUE:
            return Number(valorSolicitud) < Number(regla.valor);

        case OperadorRegla.MAYOR_IGUAL:
            return Number(valorSolicitud) >= Number(regla.valor);

        case OperadorRegla.MENOR_IGUAL:
            return Number(valorSolicitud) <= Number(regla.valor);

        default:
            return false;
    }
};

// Evalúa todos los grupos activos y retorna el que aplica
// Las reglas dentro de un grupo son AND (todas deben cumplirse)
// Si varios grupos aplican, gana el de mayor prioridad
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
        // Grupos sin gestores activos se saltan
        if (grupo.gestores.length === 0) continue;

        // Si el grupo no tiene reglas, es el grupo general (fallback)
        if (grupo.reglas.length === 0) continue;

        // Todas las reglas deben cumplirse (AND)
        const cumpleTodasLasReglas = grupo.reglas.every((regla) =>
            evaluarRegla(regla, solicitud)
        );

        if (cumpleTodasLasReglas) return grupo.id;
    }

    // Fallback: buscar grupo general (sin reglas)
    const grupoGeneral = grupos.find(
        (g) => g.reglas.length === 0 && g.gestores.length > 0
    );

    return grupoGeneral?.id ?? null;
};

// Elige el gestor con menor carga activa dentro del grupo (round-robin por carga)
const elegirGestor = async (grupoId: string): Promise<string | null> => {
    const gestoresGrupo = await prisma.grupoGestor.findMany({
        where: { grupoId, activo: true },
        select: { gestorId: true },
    });

    if (gestoresGrupo.length === 0) return null;

    const gestorIds = gestoresGrupo.map((g) => g.gestorId);

    // Contar asignaciones activas por gestor
    const cargas = await prisma.asignacionSolicitud.groupBy({
        by: ["gestorId"],
        where: {
            gestorId: { in: gestorIds },
            activa: true,
        },
        _count: { gestorId: true },
    });

    // Construir mapa de carga
    const mapaCargas = new Map<string, number>();
    gestorIds.forEach((id) => mapaCargas.set(id, 0));
    cargas.forEach((c) => mapaCargas.set(c.gestorId, c._count.gestorId));

    // Elegir el de menor carga
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

// ─── Asignación ──────────────────────────────────────────────────────────────

export const asignarAutomaticamente = async (
    solicitudId: string
): Promise<void> => {
    const solicitud = await prisma.solicitud.findUnique({
        where: { id: solicitudId },
        select: {
            id: true,
            tipoPersona: true,
            sector: true,
            tamanoEmpresa: true,
            programaId: true,
            montoSolicitado: true,
            asignacion: true,
        },
    });

    if (!solicitud) throw new AppError("Solicitud no encontrada", 404);
    if (solicitud.asignacion?.activa) return; // ya tiene asignación activa

    const grupoId = await encontrarGrupo(solicitud as SolicitudParaEvaluar);
    if (!grupoId) throw new AppError("No hay grupo disponible para esta solicitud", 422);

    const gestorId = await elegirGestor(grupoId);
    if (!gestorId) throw new AppError("No hay gestores disponibles en el grupo", 422);

    await prisma.asignacionSolicitud.create({
        data: {
            solicitudId,
            gestorId,
            grupoId,
            asignadoPorId: null, // null = automática
        },
    });
};

export const asignarManualmente = async (
    solicitudId: string,
    dto: AsignarManualDto,
    supervisorId: string
): Promise<void> => {
    const solicitud = await prisma.solicitud.findUnique({
        where: { id: solicitudId },
        include: { asignacion: true },
    });

    if (!solicitud) throw new AppError("Solicitud no encontrada", 404);

    const gestor = await prisma.usuario.findUnique({
        where: { id: dto.gestorId },
        include: { gruposGestion: { where: { activo: true } } },
    });

    if (!gestor) throw new AppError("Gestor no encontrado", 404);
    if (gestor.rol !== "GESTOR") throw new AppError("El usuario no es un gestor", 400);
    if (gestor.gruposGestion.length === 0)
        throw new AppError("El gestor no pertenece a ningún grupo activo", 400);

    // Usar el primer grupo activo del gestor
    const grupoId = gestor.gruposGestion[0].grupoId;

    // Si ya tiene asignación activa, desactivarla (reasignación)
    if (solicitud.asignacion?.activa) {
        await prisma.asignacionSolicitud.update({
            where: { id: solicitud.asignacion.id },
            data: {
                activa: false,
                fechaReasignacion: new Date(),
                motivoReasignacion: dto.motivo ?? "Reasignación manual",
            },
        });
    }

    await prisma.asignacionSolicitud.create({
        data: {
            solicitudId,
            gestorId: dto.gestorId,
            grupoId,
            asignadoPorId: supervisorId,
        },
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
                    nombre: true,
                    apellidoPaterno: true,
                    apellidoMaterno: true,
                    correo: true,
                    activo: true,
                },
            },
        },
    });

    const gestorIds = gestores.map((g) => g.gestorId);

    const cargas = await prisma.asignacionSolicitud.groupBy({
        by: ["gestorId"],
        where: { gestorId: { in: gestorIds }, activa: true },
        _count: { gestorId: true },
    });

    const mapaCargas = new Map<string, number>();
    cargas.forEach((c) => mapaCargas.set(c.gestorId, c._count.gestorId));

    return gestores.map((g) => ({
        ...g.gestor,
        grupoId: g.grupoId,
        cargaActual: mapaCargas.get(g.gestorId) ?? 0,
    }));
};

// ─── CRUD Grupos ─────────────────────────────────────────────────────────────

export const listarGrupos = async () => {
    return prisma.grupoGestion.findMany({
        include: {
            reglas: true,
            gestores: {
                where: { activo: true },
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
                },
            },
            _count: { select: { asignaciones: true } },
        },
        orderBy: { prioridad: "desc" },
    });
};

export const obtenerGrupoPorId = async (id: string) => {
    const grupo = await prisma.grupoGestion.findUnique({
        where: { id },
        include: {
            reglas: true,
            gestores: {
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
                },
            },
            _count: { select: { asignaciones: true } },
        },
    });

    if (!grupo) throw new AppError("Grupo no encontrado", 404);
    return grupo;
};

export const crearGrupo = async (dto: CrearGrupoDto) => {
    return prisma.grupoGestion.create({
        data: {
            nombre: dto.nombre,
            descripcion: dto.descripcion,
            prioridad: dto.prioridad ?? 0,
            reglas: {
                create: dto.reglas,
            },
            gestores: {
                create: dto.gestorIds.map((gestorId) => ({ gestorId })),
            },
        },
        include: { reglas: true, gestores: true },
    });
};

export const actualizarGrupo = async (
    id: string,
    dto: ActualizarGrupoDto
) => {
    const grupo = await prisma.grupoGestion.findUnique({ where: { id } });
    if (!grupo) throw new AppError("Grupo no encontrado", 404);

    return prisma.$transaction(async (tx) => {
        // Si vienen reglas nuevas, borrar las anteriores y recrear
        if (dto.reglas !== undefined) {
            await tx.reglaGrupo.deleteMany({ where: { grupoId: id } });
        }

        // Si vienen gestores nuevos, borrar los anteriores y recrear
        if (dto.gestorIds !== undefined) {
            await tx.grupoGestor.deleteMany({ where: { grupoId: id } });
        }

        return tx.grupoGestion.update({
            where: { id },
            data: {
                nombre: dto.nombre,
                descripcion: dto.descripcion,
                prioridad: dto.prioridad,
                activo: dto.activo,
                ...(dto.reglas && {
                    reglas: { create: dto.reglas },
                }),
                ...(dto.gestorIds && {
                    gestores: {
                        create: dto.gestorIds.map((gestorId) => ({ gestorId })),
                    },
                }),
            },
            include: { reglas: true, gestores: true },
        });
    });
};

export const eliminarGrupo = async (id: string) => {
    const grupo = await prisma.grupoGestion.findUnique({
        where: { id },
        include: { _count: { select: { asignaciones: true } } },
    });

    if (!grupo) throw new AppError("Grupo no encontrado", 404);

    // Si tiene asignaciones históricas, solo desactivar
    if (grupo._count.asignaciones > 0) {
        return prisma.grupoGestion.update({
            where: { id },
            data: { activo: false },
        });
    }

    return prisma.grupoGestion.delete({ where: { id } });
};