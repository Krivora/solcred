-- CreateEnum
CREATE TYPE "ComunicacionTipo" AS ENUM ('LLAMADA', 'CORREO', 'MENSAJE', 'PRESENCIAL', 'OTRO');

-- CreateEnum
CREATE TYPE "ComunicacionMotivo" AS ENUM ('ACTUALIZACION_DOCUMENTACION', 'DOCUMENTACION_FALTANTE', 'CONFIRMACION_INFORMACION', 'SEGUIMIENTO_SOLICITUD', 'CONFIRMACION_INTERES', 'NOTIFICACION_AVANCE', 'ACLARACION_INFORMACION', 'NOTIFICACION_INCIDENCIA', 'RECORDATORIO_PENDIENTE', 'OTRO');

-- CreateEnum
CREATE TYPE "ComunicacionResultado" AS ENUM ('CONTACTADO', 'NO_CONTACTADO', 'SOLICITA_RECONTACTO', 'CONFIRMA_CONTINUIDAD', 'DESISTE', 'DOCUMENTACION_PENDIENTE', 'DOCUMENTACION_ENVIADA', 'INFORMACION_ACLARADA', 'SIN_RESPUESTA', 'OTRO');

-- AlterEnum
ALTER TYPE "ModuloLog" ADD VALUE 'CRM';

-- CreateTable
CREATE TABLE "Comunicacion" (
    "id" TEXT NOT NULL,
    "solicitudId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "registradoPorId" TEXT NOT NULL,
    "fechaContacto" TIMESTAMP(3) NOT NULL,
    "tipo" "ComunicacionTipo" NOT NULL,
    "motivo" "ComunicacionMotivo" NOT NULL,
    "resultado" "ComunicacionResultado" NOT NULL,
    "observaciones" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "editadoEn" TIMESTAMP(3),

    CONSTRAINT "Comunicacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Comunicacion_solicitudId_fechaContacto_idx" ON "Comunicacion"("solicitudId", "fechaContacto");

-- CreateIndex
CREATE INDEX "Comunicacion_clienteId_fechaContacto_idx" ON "Comunicacion"("clienteId", "fechaContacto");

-- CreateIndex
CREATE INDEX "Comunicacion_registradoPorId_idx" ON "Comunicacion"("registradoPorId");

-- AddForeignKey
ALTER TABLE "Comunicacion" ADD CONSTRAINT "Comunicacion_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "Solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comunicacion" ADD CONSTRAINT "Comunicacion_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comunicacion" ADD CONSTRAINT "Comunicacion_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "Personal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
