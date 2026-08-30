/**
 * Chequeo de contrato a nivel de TIPOS.
 *
 * Falla en `tsc` (sin emitir nada) si los enums del frontend
 * (`frontend/src/shared/types/domain.enums.ts`, generado) dejan de coincidir con
 * los de Prisma (`backend/generated/prisma/enums.ts`, fuente de verdad =
 * `schema.prisma`).
 *
 * Ejecutar: `npm run check:contract` (raíz). Corre también en `githooks/pre-push`.
 *
 * Cuando un enum diverge, el error de `tsc` NOMBRA los valores que sobran o
 * faltan en el frontend (propiedad `sobran_en_front` / `faltan_en_front`).
 */
import type * as Prisma from '../backend/generated/prisma/enums'
import type * as Front from '../frontend/src/shared/types/domain.enums'

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
