-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'ANALISTA', 'CLIENTE');

-- CreateEnum
CREATE TYPE "TipoPersona" AS ENUM ('FISICA', 'MORAL');

-- CreateEnum
CREATE TYPE "EstatusCredito" AS ENUM ('BORRADOR', 'PENDIENTE', 'EN_REVISION', 'APROBADO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "EstadoCivil" AS ENUM ('SOLTERO', 'CASADO', 'DIVORCIADO', 'VIUDO', 'UNION_LIBRE');

-- CreateEnum
CREATE TYPE "NivelEstudio" AS ENUM ('PRIMARIA', 'SECUNDARIA', 'PREPARATORIA', 'TECNICO', 'LICENCIATURA', 'MAESTRIA', 'DOCTORADO');

-- CreateEnum
CREATE TYPE "TamanoEmpresa" AS ENUM ('MICRO', 'PEQUENA', 'MEDIANA', 'GRANDE');

-- CreateEnum
CREATE TYPE "Sector" AS ENUM ('AGROPECUARIO', 'INDUSTRIAL', 'COMERCIAL', 'SERVICIOS', 'TECNOLOGIA', 'OTRO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'CLIENTE',
    "tipoPersona" "TipoPersona" NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidoPaterno" TEXT NOT NULL,
    "apellidoMaterno" TEXT NOT NULL,
    "curp" TEXT,
    "rfc" TEXT,
    "telefono" TEXT,
    "celular" TEXT,
    "calle" TEXT,
    "numeroExterior" TEXT,
    "numeroInterior" TEXT,
    "colonia" TEXT,
    "ciudad" TEXT,
    "estado" TEXT,
    "codigoPostal" TEXT,
    "nivelEstudio" "NivelEstudio",
    "universidad" TEXT,
    "estadoCivil" "EstadoCivil",
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Programa" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "objetivo" TEXT NOT NULL,
    "permitePersonaFisica" BOOLEAN NOT NULL DEFAULT true,
    "permitePersonaMoral" BOOLEAN NOT NULL DEFAULT true,
    "montoMinimo" DOUBLE PRECISION NOT NULL,
    "montoMaximo" DOUBLE PRECISION NOT NULL,
    "tasaOrdinaria" DOUBLE PRECISION NOT NULL,
    "tasaMoratoria" DOUBLE PRECISION NOT NULL,
    "tasaAnual" DOUBLE PRECISION NOT NULL,
    "plazoMinimoMeses" INTEGER NOT NULL,
    "plazoMaximoMeses" INTEGER NOT NULL,
    "avalObligatorio" BOOLEAN NOT NULL DEFAULT false,
    "avalOpcional" BOOLEAN NOT NULL DEFAULT false,
    "garantiaObligatoria" BOOLEAN NOT NULL DEFAULT false,
    "garantiaOpcional" BOOLEAN NOT NULL DEFAULT false,
    "datosFinancierosCompletos" BOOLEAN NOT NULL DEFAULT false,
    "requiereCurp" BOOLEAN NOT NULL DEFAULT true,
    "requiereRfc" BOOLEAN NOT NULL DEFAULT true,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Programa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoDocumento" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TipoDocumento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramaDocumento" (
    "id" TEXT NOT NULL,
    "programaId" TEXT NOT NULL,
    "tipoDocumentoId" TEXT NOT NULL,
    "esObligatorio" BOOLEAN NOT NULL DEFAULT true,
    "aplicaA" "TipoPersona",

    CONSTRAINT "ProgramaDocumento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Credito" (
    "id" TEXT NOT NULL,
    "programaId" TEXT NOT NULL,
    "solicitanteId" TEXT NOT NULL,
    "estatus" "EstatusCredito" NOT NULL DEFAULT 'BORRADOR',
    "tipoPersona" "TipoPersona" NOT NULL,
    "sector" "Sector" NOT NULL,
    "tamanoEmpresa" "TamanoEmpresa",
    "montoSolicitado" DOUBLE PRECISION NOT NULL,
    "plazoSolicitado" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Credito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatosSolicitante" (
    "id" TEXT NOT NULL,
    "creditoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidoPaterno" TEXT NOT NULL,
    "apellidoMaterno" TEXT NOT NULL,
    "curp" TEXT,
    "rfc" TEXT,
    "telefono" TEXT,
    "celular" TEXT,
    "correo" TEXT,
    "calle" TEXT,
    "numeroExterior" TEXT,
    "numeroInterior" TEXT,
    "colonia" TEXT,
    "ciudad" TEXT,
    "estado" TEXT,
    "codigoPostal" TEXT,
    "nivelEstudio" "NivelEstudio",
    "universidad" TEXT,
    "estadoCivil" "EstadoCivil",
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DatosSolicitante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatosAval" (
    "id" TEXT NOT NULL,
    "creditoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidoPaterno" TEXT NOT NULL,
    "apellidoMaterno" TEXT NOT NULL,
    "curp" TEXT,
    "rfc" TEXT,
    "telefono" TEXT,
    "celular" TEXT,
    "correo" TEXT,
    "calle" TEXT,
    "numeroExterior" TEXT,
    "numeroInterior" TEXT,
    "colonia" TEXT,
    "ciudad" TEXT,
    "estado" TEXT,
    "codigoPostal" TEXT,
    "nivelEstudio" "NivelEstudio",
    "universidad" TEXT,
    "estadoCivil" "EstadoCivil",
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DatosAval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentoCredito" (
    "id" TEXT NOT NULL,
    "creditoId" TEXT NOT NULL,
    "tipoDocumentoId" TEXT NOT NULL,
    "urlArchivo" TEXT NOT NULL,
    "nombreArchivo" TEXT NOT NULL,
    "subidoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentoCredito_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_curp_key" ON "Usuario"("curp");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_rfc_key" ON "Usuario"("rfc");

-- CreateIndex
CREATE UNIQUE INDEX "TipoDocumento_nombre_key" ON "TipoDocumento"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramaDocumento_programaId_tipoDocumentoId_key" ON "ProgramaDocumento"("programaId", "tipoDocumentoId");

-- CreateIndex
CREATE UNIQUE INDEX "DatosSolicitante_creditoId_key" ON "DatosSolicitante"("creditoId");

-- CreateIndex
CREATE UNIQUE INDEX "DatosAval_creditoId_key" ON "DatosAval"("creditoId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentoCredito_creditoId_tipoDocumentoId_key" ON "DocumentoCredito"("creditoId", "tipoDocumentoId");

-- AddForeignKey
ALTER TABLE "ProgramaDocumento" ADD CONSTRAINT "ProgramaDocumento_programaId_fkey" FOREIGN KEY ("programaId") REFERENCES "Programa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramaDocumento" ADD CONSTRAINT "ProgramaDocumento_tipoDocumentoId_fkey" FOREIGN KEY ("tipoDocumentoId") REFERENCES "TipoDocumento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credito" ADD CONSTRAINT "Credito_programaId_fkey" FOREIGN KEY ("programaId") REFERENCES "Programa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credito" ADD CONSTRAINT "Credito_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatosSolicitante" ADD CONSTRAINT "DatosSolicitante_creditoId_fkey" FOREIGN KEY ("creditoId") REFERENCES "Credito"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatosAval" ADD CONSTRAINT "DatosAval_creditoId_fkey" FOREIGN KEY ("creditoId") REFERENCES "Credito"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoCredito" ADD CONSTRAINT "DocumentoCredito_creditoId_fkey" FOREIGN KEY ("creditoId") REFERENCES "Credito"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoCredito" ADD CONSTRAINT "DocumentoCredito_tipoDocumentoId_fkey" FOREIGN KEY ("tipoDocumentoId") REFERENCES "TipoDocumento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
