/*
  Warnings:

  - You are about to drop the column `calle` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `celular` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `ciudad` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `codigoPostal` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `colonia` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `estadoCivil` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `nivelEstudio` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `numeroExterior` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `numeroInterior` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `telefono` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `universidad` on the `Usuario` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "calle",
DROP COLUMN "celular",
DROP COLUMN "ciudad",
DROP COLUMN "codigoPostal",
DROP COLUMN "colonia",
DROP COLUMN "estado",
DROP COLUMN "estadoCivil",
DROP COLUMN "nivelEstudio",
DROP COLUMN "numeroExterior",
DROP COLUMN "numeroInterior",
DROP COLUMN "telefono",
DROP COLUMN "universidad",
ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true;
