-- CreateEnum
CREATE TYPE "TicketEstatus" AS ENUM ('NUEVO', 'ASIGNADO', 'EN_PROGRESO', 'ESPERANDO_CLIENTE', 'RESUELTO', 'CERRADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TicketPrioridad" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'URGENTE');

-- CreateEnum
CREATE TYPE "TicketCategoria" AS ENUM ('SOPORTE_TECNICO', 'INCIDENTE', 'DUDA_USO', 'ACCESO_PERMISOS', 'PRESTAMO_EQUIPO', 'SOLICITUD_INFORMACION', 'OTRO');

-- CreateEnum
CREATE TYPE "TicketTipoEvento" AS ENUM ('CREADO', 'ASIGNADO', 'REASIGNADO', 'CAMBIO_ESTATUS', 'CAMBIO_PRIORIDAD', 'CAMBIO_CATEGORIA', 'COMENTARIO', 'NOTA_INTERNA', 'ADJUNTO', 'SLA_INCUMPLIDO', 'REABIERTO', 'CERRADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TicketAutorTipo" AS ENUM ('SOLICITANTE', 'AGENTE', 'SISTEMA');

-- AlterEnum
ALTER TYPE "ModuloLog" ADD VALUE 'SOPORTE';

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "folio" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "categoria" "TicketCategoria" NOT NULL,
    "prioridad" "TicketPrioridad" NOT NULL DEFAULT 'MEDIA',
    "estatus" "TicketEstatus" NOT NULL DEFAULT 'NUEVO',
    "solicitanteId" TEXT NOT NULL,
    "agenteId" TEXT,
    "asignadoPorId" TEXT,
    "slaRespuestaLimite" TIMESTAMP(3),
    "slaResolucionLimite" TIMESTAMP(3),
    "primeraRespuestaEn" TIMESTAMP(3),
    "slaRespuestaCumplida" BOOLEAN,
    "slaResolucionCumplida" BOOLEAN,
    "pausadoSegundos" INTEGER NOT NULL DEFAULT 0,
    "pausadoDesde" TIMESTAMP(3),
    "resueltoEn" TIMESTAMP(3),
    "cerradoEn" TIMESTAMP(3),
    "reabierto" BOOLEAN NOT NULL DEFAULT false,
    "calificacion" INTEGER,
    "calificacionComentario" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketComentario" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "autorTipo" "TicketAutorTipo" NOT NULL,
    "cuerpo" TEXT NOT NULL,
    "esNotaInterna" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editadoEn" TIMESTAMP(3),

    CONSTRAINT "TicketComentario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketAdjunto" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "comentarioId" TEXT,
    "urlArchivo" TEXT NOT NULL,
    "nombreArchivo" TEXT NOT NULL,
    "nombreOriginal" TEXT NOT NULL,
    "tipoMime" TEXT NOT NULL,
    "tamanoBytes" INTEGER NOT NULL,
    "subidoPorId" TEXT NOT NULL,
    "subidoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketAdjunto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketEvento" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "tipo" "TicketTipoEvento" NOT NULL,
    "actorId" TEXT,
    "descripcion" TEXT NOT NULL,
    "valorAnterior" TEXT,
    "valorNuevo" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketEvento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketSlaPolitica" (
    "id" TEXT NOT NULL,
    "prioridad" "TicketPrioridad" NOT NULL,
    "respuestaMinutos" INTEGER NOT NULL,
    "resolucionMinutos" INTEGER NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketSlaPolitica_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_folio_key" ON "Ticket"("folio");

-- CreateIndex
CREATE INDEX "Ticket_solicitanteId_idx" ON "Ticket"("solicitanteId");

-- CreateIndex
CREATE INDEX "Ticket_agenteId_idx" ON "Ticket"("agenteId");

-- CreateIndex
CREATE INDEX "Ticket_estatus_idx" ON "Ticket"("estatus");

-- CreateIndex
CREATE INDEX "Ticket_categoria_idx" ON "Ticket"("categoria");

-- CreateIndex
CREATE INDEX "TicketComentario_ticketId_idx" ON "TicketComentario"("ticketId");

-- CreateIndex
CREATE INDEX "TicketAdjunto_ticketId_idx" ON "TicketAdjunto"("ticketId");

-- CreateIndex
CREATE INDEX "TicketEvento_ticketId_idx" ON "TicketEvento"("ticketId");

-- CreateIndex
CREATE UNIQUE INDEX "TicketSlaPolitica_prioridad_key" ON "TicketSlaPolitica"("prioridad");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "Personal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_asignadoPorId_fkey" FOREIGN KEY ("asignadoPorId") REFERENCES "Personal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketComentario" ADD CONSTRAINT "TicketComentario_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketComentario" ADD CONSTRAINT "TicketComentario_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketAdjunto" ADD CONSTRAINT "TicketAdjunto_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketAdjunto" ADD CONSTRAINT "TicketAdjunto_comentarioId_fkey" FOREIGN KEY ("comentarioId") REFERENCES "TicketComentario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketAdjunto" ADD CONSTRAINT "TicketAdjunto_subidoPorId_fkey" FOREIGN KEY ("subidoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketEvento" ADD CONSTRAINT "TicketEvento_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketEvento" ADD CONSTRAINT "TicketEvento_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ─────────────────────────────────────────────────────────────
-- Secuencia de folio de tickets (mismo patrón que solicitud_folio_seq)
-- ─────────────────────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS ticket_folio_seq START 1;

-- ─────────────────────────────────────────────────────────────
-- Semilla: políticas de SLA por prioridad (minutos). Editable por ADMIN.
--   1ª respuesta / resolución:  URGENTE 30m/4h · ALTA 2h/8h · MEDIA 8h/3d · BAJA 1d/5d
-- ─────────────────────────────────────────────────────────────
INSERT INTO "TicketSlaPolitica" ("id", "prioridad", "respuestaMinutos", "resolucionMinutos", "activa", "actualizadoEn") VALUES
  (gen_random_uuid(), 'URGENTE',   30,  240, true, now()),
  (gen_random_uuid(), 'ALTA',     120,  480, true, now()),
  (gen_random_uuid(), 'MEDIA',    480, 4320, true, now()),
  (gen_random_uuid(), 'BAJA',    1440, 7200, true, now());
