/**
 * Contrato de RESPUESTA del módulo `expediente`.
 *
 * `include`/`select` reutilizables + tipos de respuesta. Las consultas crudas se
 * tipan con `Prisma.*GetPayload`; `obtenerExpediente` devuelve un shape
 * transformado y por eso se declara con una interfaz explícita, anclada al
 * servicio por su tipo de retorno y verificada contra el frontend en
 * `scripts/check-contract.ts`.
 *
 * Sin dependencias de runtime (`import type` de Prisma).
 */
import type { Prisma } from "../../../generated/prisma/client";
import type {
  EstatusDocumento,
  EstatusSolicitud,
  Sector,
  TamanoEmpresa,
  TipoPersona,
  TipoPersonaDocumento,
} from "../../../generated/prisma/enums";

// ─────────────────────────────────────────────────────────────────────────────
// includes / selects
// ─────────────────────────────────────────────────────────────────────────────

export const SELECT_TIPO_DOCUMENTO = {
  id: true,
  nombre: true,
} satisfies Prisma.TipoDocumentoSelect;

export const SELECT_PERSONAL_BASICO = {
  id: true,
  rol: true,
  usuario: {
    select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true },
  },
} satisfies Prisma.PersonalSelect;

export const INCLUDE_DOCUMENTO_CON_VALIDACION = {
  tipoDocumento: { select: SELECT_TIPO_DOCUMENTO },
  validadoPor: { select: SELECT_PERSONAL_BASICO },
} satisfies Prisma.DocumentoSolicitudInclude;

// ─────────────────────────────────────────────────────────────────────────────
// tipos de respuesta — crudos (Prisma)
// ─────────────────────────────────────────────────────────────────────────────

/** Lo que devuelven `validarDocumento`, `crearVersionDocumento` (parcial) y
 *  `obtenerHistorialDocumento` (arreglo). `validadoPor` sin aplanar. */
export type DocumentoConValidacion = Prisma.DocumentoSolicitudGetPayload<{
  include: typeof INCLUDE_DOCUMENTO_CON_VALIDACION;
}>;

// ─────────────────────────────────────────────────────────────────────────────
// tipos de respuesta — transformados (obtenerExpediente)
// ─────────────────────────────────────────────────────────────────────────────

/** Personal aplanado a `{ id, nombre, apellido* }` (sin la relación `usuario`). */
export interface PersonaPlana {
  id: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
}

/** Documento activo del resumen: fila cruda con `validadoPor` ya aplanado. */
export type DocumentoActivoResumen = Omit<DocumentoConValidacion, "validadoPor"> & {
  validadoPor: PersonaPlana | null;
};

export interface ResumenDocumento {
  tipoDocumento: { id: string; nombre: string; descripcion: string | null };
  esObligatorio: boolean;
  aplicaA: TipoPersonaDocumento | null;
  documentoActivo: DocumentoActivoResumen | null;
  estatus: EstatusDocumento | "NO_SUBIDO";
}

export interface MetricasExpediente {
  totalRequeridos: number;
  totalAprobados: number;
  totalPendientes: number;
  totalRechazados: number;
  totalNoSubidos: number;
  porcentajeCompletado: number;
}

export interface ExpedienteResponse {
  id: string;
  folio: string;
  estatus: EstatusSolicitud;
  tipoPersona: TipoPersona | null;
  sector: Sector | null;
  tamanoEmpresa: TamanoEmpresa | null;
  montoSolicitado: number | null;
  plazoSolicitado: number | null;
  creadoEn: Date;
  actualizadoEn: Date;
  programa: { id: string; nombre: string };
  solicitante: {
    id: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    correo: string;
  };
  datosSolicitante: {
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    celular: string | null;
    correo: string | null;
    telefono: string | null;
  } | null;
  gestor: PersonaPlana | null;
  fechaAsignacion: Date | null;
  documentos: ResumenDocumento[];
  metricas: MetricasExpediente;
}
