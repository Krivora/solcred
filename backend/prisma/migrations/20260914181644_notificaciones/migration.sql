-- CreateEnum
CREATE TYPE "NotificacionTipo" AS ENUM ('ASIGNACION_GESTOR', 'ASIGNACION_ANALISTA', 'SOLICITUD_REGRESADA', 'CAMBIO_ESTATUS', 'RESPONSABLE_ASIGNADO', 'DOCUMENTO_RECHAZADO');

-- CreateEnum
CREATE TYPE "NotificacionCanal" AS ENUM ('APP', 'CORREO');

-- CreateTable
CREATE TABLE "Notificacion" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" "NotificacionTipo" NOT NULL,
    "titulo" TEXT NOT NULL,
    "cuerpo" TEXT,
    "solicitudId" TEXT,
    "documentoId" TEXT,
    "agrupadoCount" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB,
    "canal" "NotificacionCanal" NOT NULL DEFAULT 'APP',
    "leidaEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notificacion_usuarioId_creadoEn_idx" ON "Notificacion"("usuarioId", "creadoEn");

-- CreateIndex
CREATE INDEX "Notificacion_usuarioId_leidaEn_idx" ON "Notificacion"("usuarioId", "leidaEn");

-- CreateIndex
CREATE INDEX "Notificacion_solicitudId_idx" ON "Notificacion"("solicitudId");

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "Solicitud"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_documentoId_fkey" FOREIGN KEY ("documentoId") REFERENCES "DocumentoSolicitud"("id") ON DELETE SET NULL ON UPDATE CASCADE;
