/*
  Warnings:

  - You are about to drop the column `montoSolicitado` on the `Solicitud` table. All the data in the column will be lost.
  - You are about to drop the column `plazoSolicitado` on the `Solicitud` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CategoriaCredito" AS ENUM ('CAPITAL', 'MAQUINARIA_EQUIPO', 'REMODELACION');

-- AlterTable
ALTER TABLE "Solicitud" DROP COLUMN "montoSolicitado",
DROP COLUMN "plazoSolicitado";

-- CreateTable
CREATE TABLE "DatosCredito" (
    "id" TEXT NOT NULL,
    "solicitudId" TEXT NOT NULL,
    "plazoMeses" INTEGER NOT NULL,
    "mesesGracia" INTEGER NOT NULL DEFAULT 0,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DatosCredito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConceptoCredito" (
    "id" TEXT NOT NULL,
    "datosCreditoId" TEXT NOT NULL,
    "categoria" "CategoriaCredito" NOT NULL,
    "concepto" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConceptoCredito_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DatosCredito_solicitudId_key" ON "DatosCredito"("solicitudId");

-- CreateIndex
CREATE INDEX "ConceptoCredito_datosCreditoId_idx" ON "ConceptoCredito"("datosCreditoId");

-- CreateIndex
CREATE INDEX "ConceptoCredito_datosCreditoId_categoria_idx" ON "ConceptoCredito"("datosCreditoId", "categoria");

-- AddForeignKey
ALTER TABLE "DatosCredito" ADD CONSTRAINT "DatosCredito_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "Solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConceptoCredito" ADD CONSTRAINT "ConceptoCredito_datosCreditoId_fkey" FOREIGN KEY ("datosCreditoId") REFERENCES "DatosCredito"("id") ON DELETE CASCADE ON UPDATE CASCADE;
