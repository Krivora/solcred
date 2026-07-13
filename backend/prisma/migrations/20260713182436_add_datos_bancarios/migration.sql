-- CreateTable
CREATE TABLE "DatosBancarios" (
    "id" TEXT NOT NULL,
    "solicitudId" TEXT NOT NULL,
    "banco" TEXT NOT NULL,
    "numeroCuenta" TEXT,
    "clabe" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DatosBancarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DatosBancarios_solicitudId_key" ON "DatosBancarios"("solicitudId");

-- AddForeignKey
ALTER TABLE "DatosBancarios" ADD CONSTRAINT "DatosBancarios_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "Solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
