-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('CLIENTE', 'PERSONAL');

-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'ANALISTA', 'GESTOR', 'SUPERVISOR');

-- CreateEnum
CREATE TYPE "TipoPersona" AS ENUM ('FISICA', 'MORAL');

-- CreateEnum
CREATE TYPE "TipoPersonaDocumento" AS ENUM ('FISICA', 'MORAL', 'AMBOS');

-- CreateEnum
CREATE TYPE "EstatusSolicitud" AS ENUM ('BORRADOR', 'PENDIENTE', 'EN_REVISION', 'EN_CORRECCION', 'EN_FINANCIAMIENTO', 'EN_APROBACION', 'APROBADO', 'RECHAZADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "EstadoCivil" AS ENUM ('SOLTERO', 'CASADO', 'DIVORCIADO', 'VIUDO', 'UNION_LIBRE');

-- CreateEnum
CREATE TYPE "NivelEstudio" AS ENUM ('PRIMARIA', 'SECUNDARIA', 'PREPARATORIA', 'TECNICO', 'LICENCIATURA', 'MAESTRIA', 'DOCTORADO');

-- CreateEnum
CREATE TYPE "TamanoEmpresa" AS ENUM ('MICRO', 'PEQUENA', 'MEDIANA', 'GRANDE');

-- CreateEnum
CREATE TYPE "Sector" AS ENUM ('AGROPECUARIO', 'INDUSTRIAL', 'COMERCIAL', 'SERVICIOS', 'TECNOLOGIA', 'OTRO');

-- CreateEnum
CREATE TYPE "Requerimiento" AS ENUM ('NO_REQUIERE', 'OPCIONAL', 'OBLIGATORIO');

-- CreateEnum
CREATE TYPE "TipoVivienda" AS ENUM ('PROPIA', 'RENTADA', 'PAGANDO');

-- CreateEnum
CREATE TYPE "OperadorRegla" AS ENUM ('IGUAL', 'DIFERENTE', 'EN_LISTA', 'MAYOR_QUE', 'MENOR_QUE', 'MAYOR_IGUAL', 'MENOR_IGUAL');

-- CreateEnum
CREATE TYPE "CampoRegla" AS ENUM ('TIPO_PERSONA', 'SECTOR', 'TAMANO_EMPRESA', 'PROGRAMA_ID', 'MONTO_SOLICITADO');

-- CreateEnum
CREATE TYPE "EstatusDocumento" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "CategoriaCredito" AS ENUM ('CAPITAL', 'MAQUINARIA_EQUIPO', 'REMODELACION');

-- CreateEnum
CREATE TYPE "TipoGarantia" AS ENUM ('PRENDARIA', 'HIPOTECARIA');

-- CreateEnum
CREATE TYPE "TipoLocal" AS ENUM ('PROPIO', 'RENTADO', 'FAMILIAR', 'OTRO');

-- CreateEnum
CREATE TYPE "AccionLog" AS ENUM ('CREAR', 'ACTUALIZAR', 'ELIMINAR', 'CONSULTAR', 'LOGIN', 'LOGOUT', 'ERROR');

-- CreateEnum
CREATE TYPE "ModuloLog" AS ENUM ('AUTH', 'USUARIOS', 'PROGRAMAS', 'SOLICITUDES', 'DOCUMENTOS');

-- CreateTable
CREATE TABLE "HistorialEstatus" (
    "id" TEXT NOT NULL,
    "solicitudId" TEXT NOT NULL,
    "estatusAnterior" "EstatusSolicitud" NOT NULL,
    "estatusNuevo" "EstatusSolicitud" NOT NULL,
    "motivo" TEXT,
    "usuarioId" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistorialEstatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrupoGestion" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "prioridad" INTEGER NOT NULL DEFAULT 0,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrupoGestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReglaGrupo" (
    "id" TEXT NOT NULL,
    "grupoId" TEXT NOT NULL,
    "campo" "CampoRegla" NOT NULL,
    "operador" "OperadorRegla" NOT NULL,
    "valor" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReglaGrupo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrupoGestor" (
    "grupoId" TEXT NOT NULL,
    "gestorId" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "asignadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GrupoGestor_pkey" PRIMARY KEY ("grupoId","gestorId")
);

-- CreateTable
CREATE TABLE "AsignacionSolicitud" (
    "id" TEXT NOT NULL,
    "solicitudId" TEXT NOT NULL,
    "gestorId" TEXT NOT NULL,
    "grupoId" TEXT NOT NULL,
    "asignadoPorId" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "fechaAsignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaReasignacion" TIMESTAMP(3),
    "motivoReasignacion" TEXT,

    CONSTRAINT "AsignacionSolicitud_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "tipoUsuario" "TipoUsuario" NOT NULL DEFAULT 'CLIENTE',
    "tipoPersona" "TipoPersona" NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidoPaterno" TEXT NOT NULL,
    "apellidoMaterno" TEXT NOT NULL,
    "curp" TEXT,
    "rfc" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Personal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "departamento" TEXT,
    "extension" TEXT,
    "supervisorId" TEXT,
    "fechaIngreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Personal_pkey" PRIMARY KEY ("id")
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
    "aval" "Requerimiento" NOT NULL DEFAULT 'NO_REQUIERE',
    "garantia" "Requerimiento" NOT NULL DEFAULT 'NO_REQUIERE',
    "datosFinancierosCompletos" BOOLEAN NOT NULL DEFAULT false,
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
    "aplicaA" "TipoPersonaDocumento",

    CONSTRAINT "ProgramaDocumento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Solicitud" (
    "id" TEXT NOT NULL,
    "folio" TEXT NOT NULL,
    "programaId" TEXT NOT NULL,
    "solicitanteId" TEXT NOT NULL,
    "estatus" "EstatusSolicitud" NOT NULL DEFAULT 'BORRADOR',
    "tipoPersona" "TipoPersona",
    "sector" "Sector",
    "tamanoEmpresa" "TamanoEmpresa",
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Solicitud_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatosSolicitante" (
    "id" TEXT NOT NULL,
    "solicitudId" TEXT NOT NULL,
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
    "nombreConyuge" TEXT,
    "numeroINE" TEXT,
    "tipoVivienda" "TipoVivienda",
    "aniosDomicilioActual" INTEGER,
    "aniosDomicilioAnterior" INTEGER,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DatosSolicitante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatosAval" (
    "id" TEXT NOT NULL,
    "solicitudId" TEXT NOT NULL,
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
    "nombreConyuge" TEXT,
    "numeroINE" TEXT,
    "tipoVivienda" "TipoVivienda",
    "aniosDomicilioActual" INTEGER,
    "aniosDomicilioAnterior" INTEGER,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DatosAval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatosCredito" (
    "id" TEXT NOT NULL,
    "solicitudId" TEXT NOT NULL,
    "plazoMeses" INTEGER NOT NULL,
    "mesesGracia" INTEGER NOT NULL DEFAULT 0,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DatosCredito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConceptoCredito" (
    "id" TEXT NOT NULL,
    "datosCreditoId" TEXT NOT NULL,
    "categoria" "CategoriaCredito" NOT NULL,
    "concepto" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConceptoCredito_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "DocumentoSolicitud" (
    "id" TEXT NOT NULL,
    "solicitudId" TEXT NOT NULL,
    "tipoDocumentoId" TEXT NOT NULL,
    "urlArchivo" TEXT NOT NULL,
    "nombreArchivo" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "estatus" "EstatusDocumento" NOT NULL DEFAULT 'PENDIENTE',
    "validadoPorId" TEXT,
    "fechaValidacion" TIMESTAMP(3),
    "motivoRechazo" TEXT,
    "subidoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentoSolicitud_pkey" PRIMARY KEY ("id")
);

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

-- CreateIndex
CREATE INDEX "HistorialEstatus_solicitudId_idx" ON "HistorialEstatus"("solicitudId");

-- CreateIndex
CREATE INDEX "AsignacionSolicitud_gestorId_idx" ON "AsignacionSolicitud"("gestorId");

-- CreateIndex
CREATE INDEX "AsignacionSolicitud_grupoId_idx" ON "AsignacionSolicitud"("grupoId");

-- CreateIndex
CREATE INDEX "AsignacionSolicitud_solicitudId_idx" ON "AsignacionSolicitud"("solicitudId");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_curp_key" ON "Usuario"("curp");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_rfc_key" ON "Usuario"("rfc");

-- CreateIndex
CREATE UNIQUE INDEX "Personal_userId_key" ON "Personal"("userId");

-- CreateIndex
CREATE INDEX "Personal_rol_idx" ON "Personal"("rol");

-- CreateIndex
CREATE INDEX "Personal_departamento_idx" ON "Personal"("departamento");

-- CreateIndex
CREATE UNIQUE INDEX "TipoDocumento_nombre_key" ON "TipoDocumento"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramaDocumento_programaId_tipoDocumentoId_key" ON "ProgramaDocumento"("programaId", "tipoDocumentoId");

-- CreateIndex
CREATE UNIQUE INDEX "Solicitud_folio_key" ON "Solicitud"("folio");

-- CreateIndex
CREATE UNIQUE INDEX "DatosSolicitante_solicitudId_key" ON "DatosSolicitante"("solicitudId");

-- CreateIndex
CREATE UNIQUE INDEX "DatosAval_solicitudId_key" ON "DatosAval"("solicitudId");

-- CreateIndex
CREATE UNIQUE INDEX "DatosCredito_solicitudId_key" ON "DatosCredito"("solicitudId");

-- CreateIndex
CREATE INDEX "ConceptoCredito_datosCreditoId_idx" ON "ConceptoCredito"("datosCreditoId");

-- CreateIndex
CREATE INDEX "ConceptoCredito_datosCreditoId_categoria_idx" ON "ConceptoCredito"("datosCreditoId", "categoria");

-- CreateIndex
CREATE UNIQUE INDEX "DatosGarantia_solicitudId_key" ON "DatosGarantia"("solicitudId");

-- CreateIndex
CREATE INDEX "Garantia_datosGarantiaId_idx" ON "Garantia"("datosGarantiaId");

-- CreateIndex
CREATE INDEX "Garantia_datosGarantiaId_tipo_idx" ON "Garantia"("datosGarantiaId", "tipo");

-- CreateIndex
CREATE UNIQUE INDEX "DatosNegocio_solicitudId_key" ON "DatosNegocio"("solicitudId");

-- CreateIndex
CREATE UNIQUE INDEX "DatosMercado_solicitudId_key" ON "DatosMercado"("solicitudId");

-- CreateIndex
CREATE UNIQUE INDEX "DatosBancarios_solicitudId_key" ON "DatosBancarios"("solicitudId");

-- CreateIndex
CREATE INDEX "DocumentoSolicitud_solicitudId_tipoDocumentoId_idx" ON "DocumentoSolicitud"("solicitudId", "tipoDocumentoId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentoSolicitud_solicitudId_tipoDocumentoId_version_key" ON "DocumentoSolicitud"("solicitudId", "tipoDocumentoId", "version");

-- AddForeignKey
ALTER TABLE "HistorialEstatus" ADD CONSTRAINT "HistorialEstatus_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "Solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialEstatus" ADD CONSTRAINT "HistorialEstatus_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReglaGrupo" ADD CONSTRAINT "ReglaGrupo_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "GrupoGestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrupoGestor" ADD CONSTRAINT "GrupoGestor_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "GrupoGestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrupoGestor" ADD CONSTRAINT "GrupoGestor_gestorId_fkey" FOREIGN KEY ("gestorId") REFERENCES "Personal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionSolicitud" ADD CONSTRAINT "AsignacionSolicitud_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "Solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionSolicitud" ADD CONSTRAINT "AsignacionSolicitud_gestorId_fkey" FOREIGN KEY ("gestorId") REFERENCES "Personal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionSolicitud" ADD CONSTRAINT "AsignacionSolicitud_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "GrupoGestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionSolicitud" ADD CONSTRAINT "AsignacionSolicitud_asignadoPorId_fkey" FOREIGN KEY ("asignadoPorId") REFERENCES "Personal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Personal" ADD CONSTRAINT "Personal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Personal" ADD CONSTRAINT "Personal_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "Personal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramaDocumento" ADD CONSTRAINT "ProgramaDocumento_programaId_fkey" FOREIGN KEY ("programaId") REFERENCES "Programa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramaDocumento" ADD CONSTRAINT "ProgramaDocumento_tipoDocumentoId_fkey" FOREIGN KEY ("tipoDocumentoId") REFERENCES "TipoDocumento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitud" ADD CONSTRAINT "Solicitud_programaId_fkey" FOREIGN KEY ("programaId") REFERENCES "Programa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitud" ADD CONSTRAINT "Solicitud_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatosSolicitante" ADD CONSTRAINT "DatosSolicitante_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "Solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatosAval" ADD CONSTRAINT "DatosAval_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "Solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatosCredito" ADD CONSTRAINT "DatosCredito_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "Solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConceptoCredito" ADD CONSTRAINT "ConceptoCredito_datosCreditoId_fkey" FOREIGN KEY ("datosCreditoId") REFERENCES "DatosCredito"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatosGarantia" ADD CONSTRAINT "DatosGarantia_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "Solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Garantia" ADD CONSTRAINT "Garantia_datosGarantiaId_fkey" FOREIGN KEY ("datosGarantiaId") REFERENCES "DatosGarantia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatosNegocio" ADD CONSTRAINT "DatosNegocio_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "Solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatosMercado" ADD CONSTRAINT "DatosMercado_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "Solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatosBancarios" ADD CONSTRAINT "DatosBancarios_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "Solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoSolicitud" ADD CONSTRAINT "DocumentoSolicitud_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "Solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoSolicitud" ADD CONSTRAINT "DocumentoSolicitud_tipoDocumentoId_fkey" FOREIGN KEY ("tipoDocumentoId") REFERENCES "TipoDocumento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoSolicitud" ADD CONSTRAINT "DocumentoSolicitud_validadoPorId_fkey" FOREIGN KEY ("validadoPorId") REFERENCES "Personal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogAuditoria" ADD CONSTRAINT "LogAuditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
