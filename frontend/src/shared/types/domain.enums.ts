/* ─────────────────────────────────────────────────────────────────────────
 * GENERADO — no editar a mano.  Fuente: backend/prisma/schema.prisma
 * Regenerar: `npm run gen:enums` (también corre en predev/prebuild del front)
 * ───────────────────────────────────────────────────────────────────────── */

export type TipoUsuario = 'CLIENTE' | 'PERSONAL'
export const TIPO_USUARIO_VALUES = ['CLIENTE', 'PERSONAL'] as const satisfies readonly TipoUsuario[]

export type Rol = 'ADMIN' | 'ANALISTA' | 'GESTOR' | 'SUPERVISOR'
export const ROL_VALUES = ['ADMIN', 'ANALISTA', 'GESTOR', 'SUPERVISOR'] as const satisfies readonly Rol[]

export type TipoPersona = 'FISICA' | 'MORAL'
export const TIPO_PERSONA_VALUES = ['FISICA', 'MORAL'] as const satisfies readonly TipoPersona[]

export type TipoPersonaDocumento = 'FISICA' | 'MORAL' | 'AMBOS'
export const TIPO_PERSONA_DOCUMENTO_VALUES = ['FISICA', 'MORAL', 'AMBOS'] as const satisfies readonly TipoPersonaDocumento[]

export type EstatusSolicitud = 'BORRADOR' | 'PENDIENTE' | 'EN_REVISION' | 'EN_CORRECCION' | 'EN_FINANCIAMIENTO' | 'EN_APROBACION' | 'EN_ASIGNACION' | 'EN_ANALISIS' | 'EN_VALIDACION' | 'EN_COMITE' | 'APROBADO' | 'RECHAZADO' | 'CANCELADO'
export const ESTATUS_SOLICITUD_VALUES = ['BORRADOR', 'PENDIENTE', 'EN_REVISION', 'EN_CORRECCION', 'EN_FINANCIAMIENTO', 'EN_APROBACION', 'EN_ASIGNACION', 'EN_ANALISIS', 'EN_VALIDACION', 'EN_COMITE', 'APROBADO', 'RECHAZADO', 'CANCELADO'] as const satisfies readonly EstatusSolicitud[]

export type EstadoCivil = 'SOLTERO' | 'CASADO' | 'DIVORCIADO' | 'VIUDO' | 'UNION_LIBRE'
export const ESTADO_CIVIL_VALUES = ['SOLTERO', 'CASADO', 'DIVORCIADO', 'VIUDO', 'UNION_LIBRE'] as const satisfies readonly EstadoCivil[]

export type NivelEstudio = 'PRIMARIA' | 'SECUNDARIA' | 'PREPARATORIA' | 'TECNICO' | 'LICENCIATURA' | 'MAESTRIA' | 'DOCTORADO'
export const NIVEL_ESTUDIO_VALUES = ['PRIMARIA', 'SECUNDARIA', 'PREPARATORIA', 'TECNICO', 'LICENCIATURA', 'MAESTRIA', 'DOCTORADO'] as const satisfies readonly NivelEstudio[]

export type TamanoEmpresa = 'MICRO' | 'PEQUENA' | 'MEDIANA' | 'GRANDE'
export const TAMANO_EMPRESA_VALUES = ['MICRO', 'PEQUENA', 'MEDIANA', 'GRANDE'] as const satisfies readonly TamanoEmpresa[]

export type Sector = 'AGROPECUARIO' | 'INDUSTRIAL' | 'COMERCIAL' | 'SERVICIOS' | 'TECNOLOGIA' | 'OTRO'
export const SECTOR_VALUES = ['AGROPECUARIO', 'INDUSTRIAL', 'COMERCIAL', 'SERVICIOS', 'TECNOLOGIA', 'OTRO'] as const satisfies readonly Sector[]

export type Requerimiento = 'NO_REQUIERE' | 'OPCIONAL' | 'OBLIGATORIO'
export const REQUERIMIENTO_VALUES = ['NO_REQUIERE', 'OPCIONAL', 'OBLIGATORIO'] as const satisfies readonly Requerimiento[]

export type TipoVivienda = 'PROPIA' | 'RENTADA' | 'PAGANDO'
export const TIPO_VIVIENDA_VALUES = ['PROPIA', 'RENTADA', 'PAGANDO'] as const satisfies readonly TipoVivienda[]

export type EstatusDocumento = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'
export const ESTATUS_DOCUMENTO_VALUES = ['PENDIENTE', 'APROBADO', 'RECHAZADO'] as const satisfies readonly EstatusDocumento[]

export type CategoriaCredito = 'CAPITAL' | 'MAQUINARIA_EQUIPO' | 'REMODELACION'
export const CATEGORIA_CREDITO_VALUES = ['CAPITAL', 'MAQUINARIA_EQUIPO', 'REMODELACION'] as const satisfies readonly CategoriaCredito[]

export type TipoGarantia = 'PRENDARIA' | 'HIPOTECARIA'
export const TIPO_GARANTIA_VALUES = ['PRENDARIA', 'HIPOTECARIA'] as const satisfies readonly TipoGarantia[]

export type TipoLocal = 'PROPIO' | 'RENTADO' | 'FAMILIAR' | 'OTRO'
export const TIPO_LOCAL_VALUES = ['PROPIO', 'RENTADO', 'FAMILIAR', 'OTRO'] as const satisfies readonly TipoLocal[]

export type SeccionSolicitud = 'SOLICITANTE' | 'AVAL' | 'CREDITO' | 'GARANTIA' | 'NEGOCIO' | 'MERCADO' | 'BANCARIOS'
export const SECCION_SOLICITUD_VALUES = ['SOLICITANTE', 'AVAL', 'CREDITO', 'GARANTIA', 'NEGOCIO', 'MERCADO', 'BANCARIOS'] as const satisfies readonly SeccionSolicitud[]

export type AccionLog = 'CREAR' | 'ACTUALIZAR' | 'ELIMINAR' | 'CONSULTAR' | 'LOGIN' | 'LOGOUT' | 'ERROR'
export const ACCION_LOG_VALUES = ['CREAR', 'ACTUALIZAR', 'ELIMINAR', 'CONSULTAR', 'LOGIN', 'LOGOUT', 'ERROR'] as const satisfies readonly AccionLog[]

export type ModuloLog = 'AUTH' | 'USUARIOS' | 'PROGRAMAS' | 'SOLICITUDES' | 'DOCUMENTOS'
export const MODULO_LOG_VALUES = ['AUTH', 'USUARIOS', 'PROGRAMAS', 'SOLICITUDES', 'DOCUMENTOS'] as const satisfies readonly ModuloLog[]

export type OperadorRegla = 'IGUAL' | 'DIFERENTE' | 'EN_LISTA' | 'MAYOR_QUE' | 'MENOR_QUE' | 'MAYOR_IGUAL' | 'MENOR_IGUAL'
export const OPERADOR_REGLA_VALUES = ['IGUAL', 'DIFERENTE', 'EN_LISTA', 'MAYOR_QUE', 'MENOR_QUE', 'MAYOR_IGUAL', 'MENOR_IGUAL'] as const satisfies readonly OperadorRegla[]

export type CampoRegla = 'TIPO_PERSONA' | 'SECTOR' | 'TAMANO_EMPRESA' | 'PROGRAMA_ID' | 'MONTO_SOLICITADO'
export const CAMPO_REGLA_VALUES = ['TIPO_PERSONA', 'SECTOR', 'TAMANO_EMPRESA', 'PROGRAMA_ID', 'MONTO_SOLICITADO'] as const satisfies readonly CampoRegla[]
