/*
  Warnings:

  - You are about to drop the column `aval` on the `Programa` table. All the data in the column will be lost.
  - You are about to drop the column `garantia` on the `Programa` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SeccionSolicitud" AS ENUM ('SOLICITANTE', 'AVAL', 'CREDITO', 'GARANTIA', 'NEGOCIO', 'MERCADO', 'BANCARIOS');

-- AlterTable
ALTER TABLE "Programa" DROP COLUMN "aval",
DROP COLUMN "garantia";

-- CreateTable
CREATE TABLE "ProgramaSeccion" (
    "id" TEXT NOT NULL,
    "programaId" TEXT NOT NULL,
    "seccion" "SeccionSolicitud" NOT NULL,
    "requerimiento" "Requerimiento" NOT NULL DEFAULT 'NO_REQUIERE',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramaSeccion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProgramaSeccion_programaId_idx" ON "ProgramaSeccion"("programaId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramaSeccion_programaId_seccion_key" ON "ProgramaSeccion"("programaId", "seccion");

-- AddForeignKey
ALTER TABLE "ProgramaSeccion" ADD CONSTRAINT "ProgramaSeccion_programaId_fkey" FOREIGN KEY ("programaId") REFERENCES "Programa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
