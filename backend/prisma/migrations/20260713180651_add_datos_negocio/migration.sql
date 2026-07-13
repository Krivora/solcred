-- CreateEnum
CREATE TYPE "TipoLocal" AS ENUM ('PROPIO', 'RENTADO', 'FAMILIAR', 'OTRO');

-- CreateTable
CREATE TABLE "DatosNegocio" (
    "id" TEXT NOT NULL,
    "solicitudId" TEXT NOT NULL,
    "razonSocial" TEXT,
    "rfcNegocio" TEXT,
    "nombreNegocio" TEXT,
    "domicilioNegocio" TEXT,
    "numeroExteriorNegocio" TEXT,
    "numeroInteriorNegocio" TEXT,
    "coloniaLocal" TEXT,
    "codigoPostalLocal" TEXT,
    "municipioLocal" TEXT,
    "estadoLocal" TEXT,
    "actividadNegocio" TEXT,
    "areaNegocio" TEXT,
    "empleosConservados" INTEGER,
    "empleosNuevos" INTEGER,
    "fechaInicioOperaciones" TIMESTAMP(3),
    "antiguedadNegocio" INTEGER,
    "tipoLocal" "TipoLocal",
    "experienciaActividadSolicitante" INTEGER,
    "experienciaEmpresarioSolicitante" INTEGER,
    "actualExporta" BOOLEAN,
    "obtuvoExperiencia" BOOLEAN,
    "negocioConsidera" TEXT,
    "telefonoRecadosNegocio" TEXT,
    "telefonoFijoNegocio" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DatosNegocio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DatosNegocio_solicitudId_key" ON "DatosNegocio"("solicitudId");

-- AddForeignKey
ALTER TABLE "DatosNegocio" ADD CONSTRAINT "DatosNegocio_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "Solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
