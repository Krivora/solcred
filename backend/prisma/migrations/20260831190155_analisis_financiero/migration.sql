-- CreateTable
CREATE TABLE "Analisis" (
    "id" TEXT NOT NULL,
    "solicitudId" TEXT NOT NULL,
    "analistaId" TEXT NOT NULL,
    "general" JSONB,
    "situacionFinanciera" JSONB,
    "ajustesCredito" JSONB,
    "criteriosEvaluacion" JSONB,
    "amortizacion" JSONB,
    "comentario" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Analisis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Analisis_solicitudId_key" ON "Analisis"("solicitudId");

-- CreateIndex
CREATE INDEX "Analisis_analistaId_idx" ON "Analisis"("analistaId");

-- AddForeignKey
ALTER TABLE "Analisis" ADD CONSTRAINT "Analisis_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "Solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analisis" ADD CONSTRAINT "Analisis_analistaId_fkey" FOREIGN KEY ("analistaId") REFERENCES "Personal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
