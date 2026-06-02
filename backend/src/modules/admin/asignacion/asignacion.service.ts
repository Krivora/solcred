import prisma from "@config/db";
import { AppError } from "@middlewares/error.middleware";
import { CampoRegla, OperadorRegla } from "../../../../generated/prisma/client";
import { AsignarManualDto } from "./asignacion.schema";

// ─── Tipos internos ──────────────────────────────────────────────────────────

interface SolicitudParaEvaluar {
    id: string;
    tipoPersona: string | null;
    sector: string | null;
    tamanoEmpresa: string | null;
    programaId: string;
    montoSolicitado: number | null;
}

// ─── Motor de reglas ─────────────────────────────────────────────────────────

const evaluarRegla = (
    regla: { campo: CampoRegla; operador: OperadorRegla; valor: string },
    solicitud: SolicitudParaEvaluar
): boolean => {
    const valorSolicitud: string | number | null = (() => {
        switch (regla.campo) {
            case CampoRegla.TIPO_PERSONA:      return solicitud.tipoPersona;
            case CampoRegla.SECTOR:            return solicitud.sector;
            case CampoRegla.TAMANO_EMPRESA:    return solicitud.tamanoEmpresa;
            case CampoRegla.PROGRAMA_ID:       return solicitud.programaId;
            case CampoRegla.MONTO_SOLICITADO:  return solicitud.montoSolicitado;
            default:                           return null;
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
        case OperadorRegla.MAYOR_QUE:    return Number(valorSolicitud) > Number(regla.valor);
        case OperadorRegla.MENOR_QUE:    return Number(valorSolicitud) < Number(regla.valor);
        case OperadorRegla.MAYOR_IGUAL:  return Number(valorSolicitud) >= Number(regla.valor);
        case OperadorRegla.MENOR_IGUAL:  return Number(valorSolicitud) <= Number(regla.valor);
        default:                          return false;
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
        if (grupo.reglas.length === 0) continue; // fallback, se evalúa al final

        const cumple = grupo.reglas.every((regla) =>
            evaluarRegla(regla, solicitud)
        );

        if (cumple) return grupo.id;
    }

    // Fallback: grupo general (sin reglas)
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
    if (!grupoId)
        throw new AppError("No hay grupo disponible para esta solicitud", 422);

    const gestorId = await elegirGestor(grupoId);
    if (!gestorId)
        throw new AppError("No hay gestores disponibles en el grupo", 422);

    await prisma.$transaction([
        prisma.asignacionSolicitud.create({
            data: { solicitudId, gestorId, grupoId, asignadoPorId: null },
        }),
        prisma.solicitud.update({
            where: { id: solicitudId },
            data: { estatus: "EN_REVISION" },
        }),
    ]);
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
    if (gestor.rol !== "GESTOR")
        throw new AppError("El usuario no es un gestor", 400);
    if (gestor.gruposGestion.length === 0)
        throw new AppError("El gestor no pertenece a ningún grupo activo", 400);

    const grupoId = gestor.gruposGestion[0].grupoId;

    await prisma.$transaction(async (tx) => {
        if (solicitud.asignacion?.activa) {
            await tx.asignacionSolicitud.update({
                where: { id: solicitud.asignacion.id },
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