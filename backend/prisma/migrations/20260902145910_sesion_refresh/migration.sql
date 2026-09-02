-- CreateTable
CREATE TABLE "SesionRefresh" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "familia" TEXT NOT NULL,
    "expiraEn" TIMESTAMP(3) NOT NULL,
    "revocadoEn" TIMESTAMP(3),
    "reemplazadoPor" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "usadoEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SesionRefresh_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SesionRefresh_tokenHash_key" ON "SesionRefresh"("tokenHash");

-- CreateIndex
CREATE INDEX "SesionRefresh_usuarioId_idx" ON "SesionRefresh"("usuarioId");

-- CreateIndex
CREATE INDEX "SesionRefresh_familia_idx" ON "SesionRefresh"("familia");

-- AddForeignKey
ALTER TABLE "SesionRefresh" ADD CONSTRAINT "SesionRefresh_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
