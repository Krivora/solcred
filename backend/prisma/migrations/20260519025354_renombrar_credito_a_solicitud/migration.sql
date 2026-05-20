/*
  Warnings:

  - The values [CREDITOS] on the enum `ModuloLog` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `creditoId` on the `DatosAval` table. All the data in the column will be lost.
  - You are about to drop the column `creditoId` on the `DatosSolicitante` table. All the data in the column will be lost.
  - You are about to drop the `Credito` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DocumentoCredito` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[solicitudId]` on the table `DatosAval` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[solicitudId]` on the table `DatosSolicitante` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `solicitudId` to the `DatosAval` table without a default value. This is not possible if the table is not empty.
  - Added the required column `solicitudId` to the `DatosSolicitante` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EstatusSolicitud" AS ENUM ('BORRADOR', 'PENDIENTE', 'EN_REVISION', 'APROBADO', 'RECHAZADO');

-- AlterEnum
BEGIN;
CREATE TYPE "ModuloLog_new" AS ENUM ('AUTH', 'USUARIOS', 'PROGRAMAS', 'SOLICITUDES', 'DOCUMENTOS');
ALTER TABLE "LogAuditoria" ALTER COLUMN "modulo" TYPE "ModuloLog_new" USING ("modulo"::text::"ModuloLog_new");
ALTER TYPE "ModuloLog" RENAME TO "ModuloLog_old";
ALTER TYPE "ModuloLog_new" RENAME TO "ModuloLog";
DROP TYPE "public"."ModuloLog_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Credito" DROP CONSTRAINT "Credito_programaId_fkey";

-- DropForeignKey
ALTER TABLE "Credito" DROP CONSTRAINT "Credito_solicitanteId_fkey";

-- DropForeignKey
ALTER TABLE "DatosAval" DROP CONSTRAINT "DatosAval_creditoId_fkey";

-- DropForeignKey
ALTER TABLE "DatosSolicitante" DROP CONSTRAINT "DatosSolicitante_creditoId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentoCredito" DROP CONSTRAINT "DocumentoCredito_creditoId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentoCredito" DROP CONSTRAINT "DocumentoCredito_tipoDocumentoId_fkey";

-- DropIndex
DROP INDEX "DatosAval_creditoId_key";

-- DropIndex
DROP INDEX "DatosSolicitante_creditoId_key";

-- AlterTable
ALTER TABLE "DatosAval" DROP COLUMN "creditoId",
ADD COLUMN     "solicitudId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DatosSolicitante" DROP COLUMN "creditoId",
ADD COLUMN     "solicitudId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Credito";

-- DropTable
DROP TABLE "DocumentoCredito";

-- DropEnum
DROP TYPE "EstatusCredito";

-- CreateTable
CREATE TABLE "Solicitud" (
    "id" TEXT NOT NULL,
    "programaId" TEXT NOT NULL,
    "solicitanteId" TEXT NOT NULL,
    "estatus" "EstatusSolicitud" NOT NULL DEFAULT 'BORRADOR',
    "tipoPersona" "TipoPersona" NOT NULL,
    "sector" "Sector" NOT NULL,
    "tamanoEmpresa" "TamanoEmpresa",
    "montoSolicitado" DOUBLE PRECISION NOT NULL,
    "plazoSolicitado" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Solicitud_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentoSolicitud" (
    "id" TEXT NOT NULL,
    "solicitudId" TEXT NOT NULL,
    "tipoDocumentoId" TEXT NOT NULL,
    "urlArchivo" TEXT NOT NULL,
    "nombreArchivo" TEXT NOT NULL,
    "subidoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentoSolicitud_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentoSolicitud_solicitudId_tipoDocumentoId_key" ON "DocumentoSolicitud"("solicitudId", "tipoDocumentoId");

-- CreateIndex
CREATE UNIQUE INDEX "DatosAval_solicitudId_key" ON "DatosAval"("solicitudId");

-- CreateIndex
CREATE UNIQUE INDEX "DatosSolicitante_solicitudId_key" ON "DatosSolicitante"("solicitudId");

-- AddForeignKey
ALTER TABLE "Solicitud" ADD CONSTRAINT "Solicitud_programaId_fkey" FOREIGN KEY ("programaId") REFERENCES "Programa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitud" ADD CONSTRAINT "Solicitud_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatosSolicitante" ADD CONSTRAINT "DatosSolicitante_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "Solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatosAval" ADD CONSTRAINT "DatosAval_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "Solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoSolicitud" ADD CONSTRAINT "DocumentoSolicitud_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "Solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoSolicitud" ADD CONSTRAINT "DocumentoSolicitud_tipoDocumentoId_fkey" FOREIGN KEY ("tipoDocumentoId") REFERENCES "TipoDocumento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
