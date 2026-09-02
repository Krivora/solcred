/**
 * Chequeo de contrato a nivel de TIPOS entre backend y frontend.
 *
 * Falla en `tsc` (sin emitir nada) si:
 *  1. Los enums del frontend (`frontend/src/shared/types/domain.enums.ts`,
 *     generado) dejan de coincidir con los de Prisma
 *     (`backend/generated/prisma/enums.ts`, fuente de verdad = `schema.prisma`).
 *  2. El shape de respuesta del backend para los endpoints de solicitud y
 *     expediente deja de satisfacer lo que el frontend espera de ellos.
 *
 * Ejecutar: `npm run check:contract` (raíz). Corre también en `githooks/pre-push`.
 * Se compila desde `backend/` para que resuelva el cliente de Prisma.
 */
import type * as Prisma from '../backend/generated/prisma/enums'
import type * as Front from '../frontend/src/shared/types/domain.enums'

import type * as SolContract from '../backend/src/modules/clientes/solicitudes/solicitudes.contract'
import type * as ExpContract from '../backend/src/modules/expediente/expediente.contract'
import type * as CrmContract from '../backend/src/modules/crm/crm.contract'
import type {
  Solicitud as FrontSolicitud,
  SolicitudListItem as FrontSolicitudListItem,
  DatosPersona as FrontDatosPersona,
  DatosCredito as FrontDatosCredito,
  DatosGarantia as FrontDatosGarantia,
  DatosNegocio as FrontDatosNegocio,
  DatosMercado as FrontDatosMercado,
  DatosBancarios as FrontDatosBancarios,
} from '../frontend/src/features/solicitudes/types/solicitud.types'
import type {
  Expediente as FrontExpediente,
  DocumentoConValidacionRaw as FrontDocumentoConValidacion,
} from '../frontend/src/features/expediente/types/expediente.types'
import type {
  Comunicacion as FrontComunicacion,
  ResumenComunicaciones as FrontResumenComunicaciones,
} from '../frontend/src/features/crm/types/crm.types'

type IgualA<A, B> = [A] extends [B]
  ? [B] extends [A]
    ? true
    : { faltan_en_front: Exclude<B, A> }
  : { sobran_en_front: Exclude<A, B> }

type Assert<T extends true> = T

/* eslint-disable @typescript-eslint/no-unused-vars */
type _TipoUsuario = Assert<IgualA<Prisma.TipoUsuario, Front.TipoUsuario>>
type _Rol = Assert<IgualA<Prisma.Rol, Front.Rol>>
type _TipoPersona = Assert<IgualA<Prisma.TipoPersona, Front.TipoPersona>>
type _TipoPersonaDocumento = Assert<IgualA<Prisma.TipoPersonaDocumento, Front.TipoPersonaDocumento>>
type _EstatusSolicitud = Assert<IgualA<Prisma.EstatusSolicitud, Front.EstatusSolicitud>>
type _EstadoCivil = Assert<IgualA<Prisma.EstadoCivil, Front.EstadoCivil>>
type _NivelEstudio = Assert<IgualA<Prisma.NivelEstudio, Front.NivelEstudio>>
type _TamanoEmpresa = Assert<IgualA<Prisma.TamanoEmpresa, Front.TamanoEmpresa>>
type _Sector = Assert<IgualA<Prisma.Sector, Front.Sector>>
type _Requerimiento = Assert<IgualA<Prisma.Requerimiento, Front.Requerimiento>>
type _TipoVivienda = Assert<IgualA<Prisma.TipoVivienda, Front.TipoVivienda>>
type _EstatusDocumento = Assert<IgualA<Prisma.EstatusDocumento, Front.EstatusDocumento>>
type _CategoriaCredito = Assert<IgualA<Prisma.CategoriaCredito, Front.CategoriaCredito>>
type _TipoGarantia = Assert<IgualA<Prisma.TipoGarantia, Front.TipoGarantia>>
type _TipoLocal = Assert<IgualA<Prisma.TipoLocal, Front.TipoLocal>>
type _SeccionSolicitud = Assert<IgualA<Prisma.SeccionSolicitud, Front.SeccionSolicitud>>
type _AccionLog = Assert<IgualA<Prisma.AccionLog, Front.AccionLog>>
type _ModuloLog = Assert<IgualA<Prisma.ModuloLog, Front.ModuloLog>>
type _OperadorRegla = Assert<IgualA<Prisma.OperadorRegla, Front.OperadorRegla>>
type _CampoRegla = Assert<IgualA<Prisma.CampoRegla, Front.CampoRegla>>
type _ComunicacionTipo = Assert<IgualA<Prisma.ComunicacionTipo, Front.ComunicacionTipo>>
type _ComunicacionMotivo = Assert<IgualA<Prisma.ComunicacionMotivo, Front.ComunicacionMotivo>>
type _ComunicacionResultado = Assert<IgualA<Prisma.ComunicacionResultado, Front.ComunicacionResultado>>

// ─────────────────────────────────────────────────────────────────────────────
// SHAPES DE RESPUESTA — solicitud y expediente
//
// El chequeo es DIRECCIONAL: el backend (normalizado a JSON) debe SATISFACER lo
// que el frontend espera. El backend puede mandar campos de más; no puede faltar
// ninguno que el front declare ni cambiar su tipo.
// ─────────────────────────────────────────────────────────────────────────────

/** Normaliza un tipo del backend a lo que llega por HTTP: `Date` → string. */
type Wire<T> = T extends Date
  ? string
  : T extends (infer U)[]
    ? Wire<U>[]
    : T extends object
      ? { [K in keyof T]: Wire<T[K]> }
      : T

/**
 * Igual que `Wire` pero para tipos del frontend: cada propiedad opcional acepta
 * además `null` (el backend manda `null` donde el front escribió `?:`).
 */
type WireLoose<T> = T extends Date
  ? string
  : T extends (infer U)[]
    ? WireLoose<U>[]
    : T extends object
      ? { [K in keyof T]: WireLoose<T[K]> | (undefined extends T[K] ? null : never) }
      : T

type Satisface<Backend, Front> = Wire<Backend> extends WireLoose<Front>
  ? true
  : { el_backend_no_satisface_al_frontend: Wire<Backend> }

// GET /clientes/solicitudes/:id · POST / · PUT /:id/generales · PATCH /:id/enviar
type _SolicitudDetalle = Assert<Satisface<SolContract.SolicitudDetalle, FrontSolicitud>>
// GET /clientes/solicitudes  (fila del listado paginado)
type _SolicitudLista = Assert<Satisface<SolContract.SolicitudListaItem, FrontSolicitudListItem>>
// GET /expediente/:id
type _Expediente = Assert<Satisface<ExpContract.ExpedienteResponse, FrontExpediente>>
// PATCH /expediente/:id/documentos/:docId/validar · GET .../historial
type _DocumentoValidacion = Assert<
  Satisface<ExpContract.DocumentoConValidacion, FrontDocumentoConValidacion>
>

// GET /crm/comunicaciones (fila del listado paginado) · POST · PATCH /:id
type _Comunicacion = Assert<Satisface<CrmContract.ComunicacionResponse, FrontComunicacion>>
// GET /crm/solicitudes/:id/resumen
type _ResumenComunicaciones = Assert<
  Satisface<CrmContract.ResumenComunicaciones, FrontResumenComunicaciones>
>

// Sub-formularios: PUT /clientes/solicitudes/:id/{solicitante,aval,credito,...}
type ConId<T> = T & { id: string }
type _DatosSolicitante = Assert<Satisface<SolContract.DatosSolicitanteResp, ConId<FrontDatosPersona>>>
type _DatosAval = Assert<Satisface<SolContract.DatosAvalResp, ConId<FrontDatosPersona>>>
type _DatosCredito = Assert<Satisface<SolContract.DatosCreditoResp, ConId<FrontDatosCredito>>>
type _DatosGarantia = Assert<Satisface<SolContract.DatosGarantiaResp, ConId<FrontDatosGarantia>>>
type _DatosNegocio = Assert<Satisface<SolContract.DatosNegocioResp, ConId<FrontDatosNegocio>>>
type _DatosMercado = Assert<Satisface<SolContract.DatosMercadoResp, ConId<FrontDatosMercado>>>
type _DatosBancarios = Assert<Satisface<SolContract.DatosBancariosResp, ConId<FrontDatosBancarios>>>
