/*
  Warnings:

  - The `comentario` column on the `Analisis` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Analisis" DROP COLUMN "comentario",
ADD COLUMN     "comentario" JSONB;
