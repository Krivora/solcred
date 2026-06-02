import { z } from "zod";
import { CampoRegla, OperadorRegla } from "../../../../generated/prisma/client";

const reglaSchema = z.object({
    campo: z.enum(CampoRegla, {
        message: "Campo de regla inválido",
    }),
    operador: z.enum(OperadorRegla, {
        message: "Operador de regla inválido",
    }),
    valor: z.string().min(1, "El valor de la regla es requerido"),
});

export const crearGrupoSchema = z.object({
    nombre: z.string().min(1, "El nombre es requerido").max(100),
    descripcion: z.string().max(500).optional(),
    prioridad: z.number().int().min(0).optional(),
    reglas: z.array(reglaSchema).max(20, "Máximo 20 reglas por grupo"),
    gestorIds: z
        .array(z.string().uuid("ID de gestor inválido"))
        .min(1, "Se requiere al menos un gestor"),
});

export const actualizarGrupoSchema = z.object({
    nombre: z.string().min(1).max(100).optional(),
    descripcion: z.string().max(500).optional(),
    prioridad: z.number().int().min(0).optional(),
    activo: z.boolean().optional(),
    reglas: z.array(reglaSchema).max(20).optional(),
    gestorIds: z
        .array(z.string().uuid("ID de gestor inválido"))
        .min(1)
        .optional(),
});

export type CrearGrupoDto = z.infer<typeof crearGrupoSchema>;
export type ActualizarGrupoDto = z.infer<typeof actualizarGrupoSchema>;