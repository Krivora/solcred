-- CreateEnum
CREATE TYPE "AccionLog" AS ENUM ('CREAR', 'ACTUALIZAR', 'ELIMINAR', 'CONSULTAR', 'LOGIN', 'LOGOUT', 'ERROR');

-- CreateEnum
CREATE TYPE "ModuloLog" AS ENUM ('AUTH', 'USUARIOS', 'PROGRAMAS', 'CREDITOS', 'DOCUMENTOS');

-- CreateTable
CREATE TABLE "LogAuditoria" (
    "id" TEXT NOT NULL,
    "accion" "AccionLog" NOT NULL,
    "modulo" "ModuloLog" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "entidadId" TEXT,
    "usuarioId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogAuditoria_pkey" PRIMARY KEY ("id")
);
