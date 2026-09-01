import { z } from "zod";
import {
  EstatusSolicitud,
  Sector,
  TamanoEmpresa,
  TipoPersona,
} from "../../../../generated/prisma/client";

const arregloUuid = z.array(z.string().uuid("ID inválido")).max(200).optional();

const fechaSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida (YYYY-MM-DD)")
  .optional();

/**
 * Filtros del reporte de solicitudes. Cada campo de catálogo/enum admite
 * selección múltiple (arreglo) — así se puede pedir, por ejemplo,
 * sector Tecnología + Comercial + Agropecuario en un solo reporte.
 *
 * Todos los valores se validan contra los enums/UUIDs reales antes de tocar
 * Prisma: es la primera línea de defensa de un endpoint que expone datos
 * personales (RFC, CURP, teléfono, correo) en bloque.
 */
export const filtrosReporteSchema = z.object({
  estatus: z.array(z.nativeEnum(EstatusSolicitud)).max(20).optional(),
  sector: z.array(z.nativeEnum(Sector)).max(20).optional(),
  tamanoEmpresa: z.array(z.nativeEnum(TamanoEmpresa)).max(20).optional(),
  tipoPersona: z.array(z.nativeEnum(TipoPersona)).max(20).optional(),
  programaId: arregloUuid,
  gestorId: arregloUuid,
  analistaId: arregloUuid,
  grupoId: arregloUuid,

  fechaDesde: fechaSchema,
  fechaHasta: fechaSchema,
  fechaResueltaDesde: fechaSchema,
  fechaResueltaHasta: fechaSchema,

  montoMin: z.coerce.number().nonnegative().optional(),
  montoMax: z.coerce.number().nonnegative().optional(),

  busqueda: z.string().trim().max(120).optional(),
});

export const previsualizarReporteSchema = filtrosReporteSchema.extend({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(25),
});

export type FiltrosReporteDto = z.infer<typeof filtrosReporteSchema>;
export type PrevisualizarReporteDto = z.infer<typeof previsualizarReporteSchema>;
