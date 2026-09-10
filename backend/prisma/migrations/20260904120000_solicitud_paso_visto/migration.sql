-- CreateEnum
CREATE TYPE "PasoFormulario" AS ENUM ('PROGRAMA', 'GENERAL', 'SOLICITANTE', 'AVAL', 'CREDITO', 'GARANTIA', 'NEGOCIO', 'MERCADO', 'BANCARIOS', 'RESUMEN');

-- AlterTable
ALTER TABLE "Solicitud" ADD COLUMN "ultimoPasoVisto" "PasoFormulario",
ADD COLUMN "ultimoPasoVistoEn" TIMESTAMP(3);
