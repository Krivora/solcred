import prisma from "@config/db";

/**
 * Catálogo público de programas de crédito — para el simulador que corre
 * ANTES de que la persona tenga cuenta. Solo lo mínimo para estimar un pago:
 * nada de `tasaOrdinaria`/`tasaMoratoria`, documentos requeridos ni secciones
 * (eso es catálogo administrativo, vive detrás de `autenticar`).
 */
export const listarPublico = async () => {
  return prisma.programa.findMany({
    where: { activo: true },
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      montoMinimo: true,
      montoMaximo: true,
      plazoMinimoMeses: true,
      plazoMaximoMeses: true,
      tasaAnual: true,
    },
    orderBy: { nombre: "asc" },
  });
};
