/*
  Warnings:

  - You are about to drop the column `avalObligatorio` on the `Programa` table. All the data in the column will be lost.
  - You are about to drop the column `avalOpcional` on the `Programa` table. All the data in the column will be lost.
  - You are about to drop the column `garantiaObligatoria` on the `Programa` table. All the data in the column will be lost.
  - You are about to drop the column `garantiaOpcional` on the `Programa` table. All the data in the column will be lost.
  - You are about to drop the column `requiereCurp` on the `Programa` table. All the data in the column will be lost.
  - You are about to drop the column `requiereRfc` on the `Programa` table. All the data in the column will be lost.
  - The `aplicaA` column on the `ProgramaDocumento` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[solicitudId,tipoDocumentoId,version]` on the table `DocumentoSolicitud` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[folio]` on the table `Solicitud` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `folio` to the `Solicitud` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoPersonaDocumento" AS ENUM ('FISICA', 'MORAL', 'AMBOS');

-- CreateEnum
CREATE TYPE "Requerimiento" AS ENUM ('NO_REQUIERE', 'OPCIONAL', 'OBLIGATORIO');

-- CreateEnum
CREATE TYPE "TipoVivienda" AS ENUM ('PROPIA', 'RENTADA', 'PAGANDO');

-- CreateEnum
CREATE TYPE "OperadorRegla" AS ENUM ('IGUAL', 'DIFERENTE', 'EN_LISTA', 'MAYOR_QUE', 'MENOR_QUE', 'MAYOR_IGUAL', 'MENOR_IGUAL');

-- CreateEnum
CREATE TYPE "CampoRegla" AS ENUM ('TIPO_PERSONA', 'SECTOR', 'TAMANO_EMPRESA', 'PROGRAMA_ID', 'MONTO_SOLICITADO');

-- CreateEnum
CREATE TYPE "EstatusDocumento" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EstatusSolicitud" ADD VALUE 'EN_CORRECION';
ALTER TYPE "EstatusSolicitud" ADD VALUE 'EN_FINANCIAMIENTO';
ALTER TYPE "EstatusSolicitud" ADD VALUE 'EN_APROBACION';
ALTER TYPE "EstatusSolicitud" ADD VALUE 'CANCELADO';

-- AlterEnum
ALTER TYPE "Rol" ADD VALUE 'GESTOR';

-- DropIndex
DROP INDEX "DocumentoSolicitud_solicitudId_tipoDocumentoId_key";

-- AlterTable
ALTER TABLE "DatosAval" ADD COLUMN     "aniosDomicilioActual" INTEGER,
ADD COLUMN     "aniosDomicilioAnterior" INTEGER,
ADD COLUMN     "nombreConyuge" TEXT,
ADD COLUMN     "numeroINE" TEXT,
ADD COLUMN     "tipoVivienda" "TipoVivienda";

-- AlterTable
ALTER TABLE "DatosSolicitante" ADD COLUMN     "aniosDomicilioActual" INTEGER,
ADD COLUMN     "aniosDomicilioAnterior" INTEGER,
ADD COLUMN     "nombreConyuge" TEXT,
ADD COLUMN     "numeroINE" TEXT,
ADD COLUMN     "tipoVivienda" "TipoVivienda";

-- AlterTable
ALTER TABLE "DocumentoSolicitud" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "estatus" "EstatusDocumento" NOT NULL DEFAULT 'PENDIENTE',
ADD COLUMN     "fechaValidacion" TIMESTAMP(3),
ADD COLUMN     "motivoRechazo" TEXT,
ADD COLUMN     "validadoPorId" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Programa" DROP COLUMN "avalObligatorio",
DROP COLUMN "avalOpcional",
DROP COLUMN "garantiaObligatoria",
DROP COLUMN "garantiaOpcional",
DROP COLUMN "requiereCurp",
DROP COLUMN "requiereRfc",
ADD COLUMN     "aval" "Requerimiento" NOT NULL DEFAULT 'NO_REQUIERE',
ADD COLUMN     "garantia" "Requerimiento" NOT NULL DEFAULT 'NO_REQUIERE';

-- AlterTable
ALTER TABLE "ProgramaDocumento" DROP COLUMN "aplicaA",
ADD COLUMN     "aplicaA" "TipoPersonaDocumento";

-- AlterTable
ALTER TABLE "Solicitud" ADD COLUMN     "folio" TEXT NOT NULL,
ALTER COLUMN "tipoPersona" DROP NOT NULL,
ALTER COLUMN "sector" DROP NOT NULL,
ALTER COLUMN "montoSolicitado" DROP NOT NULL,
ALTER COLUMN "plazoSolicitado" DROP NOT NULL;

-- CreateTable
CREATE TABLE "HistorialEstatus" (
    "id" TEXT NOT NULL,
    "solicitudId" TEXT NOT NULL,
    "estatusAnterior" "EstatusSolicitud" NOT NULL,
    "estatusNuevo" "EstatusSolicitud" NOT NULL,
    "motivo" TEXT,
    "usuarioId" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistorialEstatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrupoGestion" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "prioridad" INTEGER NOT NULL DEFAULT 0,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrupoGestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReglaGrupo" (
    "id" TEXT NOT NULL,
    "grupoId" TEXT NOT NULL,
    "campo" "CampoRegla" NOT NULL,
    "operador" "OperadorRegla" NOT NULL,
    "valor" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReglaGrupo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrupoGestor" (
    "grupoId" TEXT NOT NULL,
    "gestorId" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "asignadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GrupoGestor_pkey" PRIMARY KEY ("grupoId","gestorId")
);

-- CreateTable
CREATE TABLE "AsignacionSolicitud" (
    "id" TEXT NOT NULL,
    "solicitudId" TEXT NOT NULL,
    "gestorId" TEXT NOT NULL,
    "grupoId" TEXT NOT NULL,
    "asignadoPorId" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "fechaAsignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaReasignacion" TIMESTAMP(3),
    "motivoReasignacion" TEXT,

    CONSTRAINT "AsignacionSolicitud_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HistorialEstatus_solicitudId_idx" ON "HistorialEstatus"("solicitudId");

-- CreateIndex
CREATE INDEX "AsignacionSolicitud_gestorId_idx" ON "AsignacionSolicitud"("gestorId");

-- CreateIndex
CREATE INDEX "AsignacionSolicitud_grupoId_idx" ON "AsignacionSolicitud"("grupoId");

-- CreateIndex
CREATE INDEX "AsignacionSolicitud_solicitudId_idx" ON "AsignacionSolicitud"("solicitudId");

-- CreateIndex
CREATE INDEX "DocumentoSolicitud_solicitudId_tipoDocumentoId_idx" ON "DocumentoSolicitud"("solicitudId", "tipoDocumentoId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentoSolicitud_solicitudId_tipoDocumentoId_version_key" ON "DocumentoSolicitud"("solicitudId", "tipoDocumentoId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "Solicitud_folio_key" ON "Solicitud"("folio");

-- AddForeignKey
ALTER TABLE "HistorialEstatus" ADD CONSTRAINT "HistorialEstatus_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "Solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialEstatus" ADD CONSTRAINT "HistorialEstatus_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReglaGrupo" ADD CONSTRAINT "ReglaGrupo_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "GrupoGestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrupoGestor" ADD CONSTRAINT "GrupoGestor_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "GrupoGestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrupoGestor" ADD CONSTRAINT "GrupoGestor_gestorId_fkey" FOREIGN KEY ("gestorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionSolicitud" ADD CONSTRAINT "AsignacionSolicitud_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "Solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionSolicitud" ADD CONSTRAINT "AsignacionSolicitud_gestorId_fkey" FOREIGN KEY ("gestorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionSolicitud" ADD CONSTRAINT "AsignacionSolicitud_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "GrupoGestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionSolicitud" ADD CONSTRAINT "AsignacionSolicitud_asignadoPorId_fkey" FOREIGN KEY ("asignadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoSolicitud" ADD CONSTRAINT "DocumentoSolicitud_validadoPorId_fkey" FOREIGN KEY ("validadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogAuditoria" ADD CONSTRAINT "LogAuditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
