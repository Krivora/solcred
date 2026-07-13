-- CreateEnum
CREATE TYPE "TipoGarantia" AS ENUM ('PRENDARIA', 'HIPOTECARIA');

-- CreateTable
CREATE TABLE "DatosGarantia" (
    "id" TEXT NOT NULL,
    "solicitudId" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DatosGarantia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Garantia" (
    "id" TEXT NOT NULL,
    "datosGarantiaId" TEXT NOT NULL,
    "tipo" "TipoGarantia" NOT NULL,
    "nombrePropietario" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "descripcion" TEXT,
    "marca" TEXT,
    "modelo" TEXT,
    "anio" INTEGER,
    "numeroSerie" TEXT,
    "calle" TEXT,
    "numeroExterior" TEXT,
    "numeroInterior" TEXT,
    "colonia" TEXT,
    "ciudad" TEXT,
    "estado" TEXT,
    "codigoPostal" TEXT,
    "numeroEscritura" TEXT,
    "folioReal" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Garantia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DatosGarantia_solicitudId_key" ON "DatosGarantia"("solicitudId");

-- CreateIndex
CREATE INDEX "Garantia_datosGarantiaId_idx" ON "Garantia"("datosGarantiaId");

-- CreateIndex
CREATE INDEX "Garantia_datosGarantiaId_tipo_idx" ON "Garantia"("datosGarantiaId", "tipo");

-- AddForeignKey
ALTER TABLE "DatosGarantia" ADD CONSTRAINT "DatosGarantia_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "Solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Garantia" ADD CONSTRAINT "Garantia_datosGarantiaId_fkey" FOREIGN KEY ("datosGarantiaId") REFERENCES "DatosGarantia"("id") ON DELETE CASCADE ON UPDATE CASCADE;
