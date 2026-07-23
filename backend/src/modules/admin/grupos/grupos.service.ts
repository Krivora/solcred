import prisma from "@config/db";
import { AppError } from "@middlewares/error.middleware";
import { CrearGrupoDto, ActualizarGrupoDto } from "./grupos.schema";

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
                            activo: true,
                            // ── FIX: Personal -> usuario anidado ────────────
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
                            activo: true,
                            // ── FIX: mismo caso ──────────────────────────────
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

export const actualizarGrupo = async (id: string, dto: ActualizarGrupoDto) => {
    const grupo = await prisma.grupoGestion.findUnique({ where: { id } });
    if (!grupo) throw new AppError("Grupo no encontrado", 404);

    return prisma.$transaction(async (tx) => {
        if (dto.reglas !== undefined) {
            await tx.reglaGrupo.deleteMany({ where: { grupoId: id } });
        }

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

    // Si tiene historial de asignaciones, solo desactivar (soft delete)
    if (grupo._count.asignaciones > 0) {
        return prisma.grupoGestion.update({
            where: { id },
            data: { activo: false },
        });
    }

    return prisma.grupoGestion.delete({ where: { id } });
};