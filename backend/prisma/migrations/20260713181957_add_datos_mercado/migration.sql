-- CreateTable
CREATE TABLE "DatosMercado" (
    "id" TEXT NOT NULL,
    "solicitudId" TEXT NOT NULL,
    "principalesProductos" TEXT,
    "porcentajeMayoristas" DOUBLE PRECISION,
    "porcentajeDetallistas" DOUBLE PRECISION,
    "porcentajeClienteFinal" DOUBLE PRECISION,
    "coberturaLocal" DOUBLE PRECISION,
    "coberturaRegional" DOUBLE PRECISION,
    "coberturaEstatal" DOUBLE PRECISION,
    "coberturaNacional" DOUBLE PRECISION,
    "coberturaExportacion" DOUBLE PRECISION,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DatosMercado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DatosMercado_solicitudId_key" ON "DatosMercado"("solicitudId");

-- AddForeignKey
ALTER TABLE "DatosMercado" ADD CONSTRAINT "DatosMercado_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "Solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
