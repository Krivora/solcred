-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EstatusSolicitud" ADD VALUE 'EN_ASIGNACION';
ALTER TYPE "EstatusSolicitud" ADD VALUE 'EN_ANALISIS';
ALTER TYPE "EstatusSolicitud" ADD VALUE 'EN_VALIDACION';
ALTER TYPE "EstatusSolicitud" ADD VALUE 'EN_COMITE';

-- CreateTable
CREATE TABLE "AsignacionFinanciamiento" (
    "id" TEXT NOT NULL,
    "solicitudId" TEXT NOT NULL,
    "analistaId" TEXT NOT NULL,
    "asignadoPorId" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "fechaAsignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaReasignacion" TIMESTAMP(3),
    "motivoReasignacion" TEXT,

    CONSTRAINT "AsignacionFinanciamiento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AsignacionFinanciamiento_analistaId_idx" ON "AsignacionFinanciamiento"("analistaId");

-- CreateIndex
CREATE INDEX "AsignacionFinanciamiento_solicitudId_idx" ON "AsignacionFinanciamiento"("solicitudId");

-- AddForeignKey
ALTER TABLE "AsignacionFinanciamiento" ADD CONSTRAINT "AsignacionFinanciamiento_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "Solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionFinanciamiento" ADD CONSTRAINT "AsignacionFinanciamiento_analistaId_fkey" FOREIGN KEY ("analistaId") REFERENCES "Personal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionFinanciamiento" ADD CONSTRAINT "AsignacionFinanciamiento_asignadoPorId_fkey" FOREIGN KEY ("asignadoPorId") REFERENCES "Personal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
