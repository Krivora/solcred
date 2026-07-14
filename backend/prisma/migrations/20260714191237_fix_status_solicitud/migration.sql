/*
  Warnings:

  - The values [EN_CORRECION] on the enum `EstatusSolicitud` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EstatusSolicitud_new" AS ENUM ('BORRADOR', 'PENDIENTE', 'EN_REVISION', 'EN_CORRECCION', 'EN_FINANCIAMIENTO', 'EN_APROBACION', 'APROBADO', 'RECHAZADO', 'CANCELADO');
ALTER TABLE "public"."Solicitud" ALTER COLUMN "estatus" DROP DEFAULT;
ALTER TABLE "HistorialEstatus" ALTER COLUMN "estatusAnterior" TYPE "EstatusSolicitud_new" USING ("estatusAnterior"::text::"EstatusSolicitud_new");
ALTER TABLE "HistorialEstatus" ALTER COLUMN "estatusNuevo" TYPE "EstatusSolicitud_new" USING ("estatusNuevo"::text::"EstatusSolicitud_new");
ALTER TABLE "Solicitud" ALTER COLUMN "estatus" TYPE "EstatusSolicitud_new" USING ("estatus"::text::"EstatusSolicitud_new");
ALTER TYPE "EstatusSolicitud" RENAME TO "EstatusSolicitud_old";
ALTER TYPE "EstatusSolicitud_new" RENAME TO "EstatusSolicitud";
DROP TYPE "public"."EstatusSolicitud_old";
ALTER TABLE "Solicitud" ALTER COLUMN "estatus" SET DEFAULT 'BORRADOR';
COMMIT;
