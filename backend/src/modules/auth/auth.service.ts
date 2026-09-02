import crypto from "crypto";
import prisma from "../../config/db";
import { AppError } from "../../middlewares/error.middleware";
import { hashContrasena, verificarContrasena } from "../../utils/bcrypt";
import { generarToken, RolAplicacion } from "../../utils/jwt";
import {
  generarRefreshToken,
  hashRefreshToken,
  fechaExpiracionRefresh,
} from "../../utils/refresh";
import { LoginDto, RegistroDto } from "./auth.schema";

/** Datos de origen de la petición, para trazabilidad de la sesión. */
export interface ContextoSesion {
  ip?: string | null;
  userAgent?: string | null;
}

/** Selección estándar del usuario que consume el frontend (store de sesión). */
const SELECT_USUARIO_SESION = {
  id: true,
  correo: true,
  nombre: true,
  apellidoPaterno: true,
  apellidoMaterno: true,
  tipoUsuario: true,
  tipoPersona: true,
  activo: true,
  personal: {
    select: { id: true, rol: true, departamento: true, activo: true },
  },
} as const;

/** Rol efectivo: el de Personal si está activo, si no CLIENTE. */
const rolEfectivo = (usuario: {
  personal: { rol: RolAplicacion; activo: boolean } | null;
}): RolAplicacion =>
  usuario.personal?.activo ? usuario.personal.rol : "CLIENTE";

/**
 * Crea una fila de refresh token y devuelve el token opaco en claro (única
 * vez que existe sin hashear). `familia` encadena las rotaciones de un login.
 */
const emitirRefreshToken = async (
  usuarioId: string,
  familia: string,
  ctx: ContextoSesion
): Promise<string> => {
  const raw = generarRefreshToken();

  await prisma.sesionRefresh.create({
    data: {
      usuarioId,
      familia,
      tokenHash: hashRefreshToken(raw),
      expiraEn: fechaExpiracionRefresh(),
      ip: ctx.ip ?? null,
      userAgent: ctx.userAgent ?? null,
    },
  });

  return raw;
};

/** Revoca todas las sesiones vivas de una familia (reuso detectado / logout). */
const revocarFamilia = (familia: string) =>
  prisma.sesionRefresh.updateMany({
    where: { familia, revocadoEn: null },
    data: { revocadoEn: new Date() },
  });

export const registrarUsuario = async (dto: RegistroDto) => {
  const existente = await prisma.usuario.findUnique({
    where: { correo: dto.correo },
  });

  if (existente) {
    throw new AppError("El correo ya está registrado", 409);
  }

  const contrasenaHash = await hashContrasena(dto.contrasena);

  // El registro público siempre crea un CLIENTE, nunca PERSONAL. No abre
  // sesión: el flujo redirige a /login, así que no se emite refresh token.
  const usuario = await prisma.usuario.create({
    data: {
      ...dto,
      contrasena: contrasenaHash,
      tipoUsuario: "CLIENTE",
    },
    select: { ...SELECT_USUARIO_SESION, creadoEn: true },
  });

  return { usuario };
};

export const iniciarSesion = async (
  dto: LoginDto,
  ctx: ContextoSesion = {}
) => {
  const usuario = await prisma.usuario.findUnique({
    where: { correo: dto.correo },
    select: { ...SELECT_USUARIO_SESION, contrasena: true },
  });

  if (!usuario) {
    throw new AppError("Credenciales inválidas", 401);
  }

  const contrasenaValida = await verificarContrasena(
    dto.contrasena,
    usuario.contrasena
  );

  if (!contrasenaValida) {
    throw new AppError("Credenciales inválidas", 401);
  }

  if (!usuario.activo || (usuario.personal && !usuario.personal.activo)) {
    throw new AppError("Usuario inactivo", 403);
  }

  const { contrasena: _, ...usuarioSinContrasena } = usuario;
  const rol = rolEfectivo(usuarioSinContrasena);

  const token = generarToken({
    id: usuario.id,
    personalId: usuario.personal?.id,
    rol,
    tipoUsuario: usuario.tipoUsuario,
  });

  const refreshToken = await emitirRefreshToken(
    usuario.id,
    crypto.randomUUID(),
    ctx
  );

  return { usuario: usuarioSinContrasena, token, refreshToken };
};

/**
 * Rota el refresh token: valida el que llega, lo invalida y emite uno nuevo
 * en la misma familia (ventana deslizante). Si el token ya había sido rotado
 * o revocado se asume reuso → se revoca la familia completa.
 */
export const refrescarSesion = async (
  rawToken: string | undefined,
  ctx: ContextoSesion = {}
) => {
  if (!rawToken) {
    throw new AppError("Sesión no válida", 401, "REFRESH_INVALIDO");
  }

  const sesion = await prisma.sesionRefresh.findUnique({
    where: { tokenHash: hashRefreshToken(rawToken) },
  });

  if (!sesion) {
    throw new AppError("Sesión no válida", 401, "REFRESH_INVALIDO");
  }

  // Token ya rotado o revocado presentado de nuevo → posible robo.
  if (sesion.revocadoEn || sesion.reemplazadoPor) {
    await revocarFamilia(sesion.familia);
    throw new AppError("Sesión revocada", 401, "REFRESH_REUSO");
  }

  if (sesion.expiraEn.getTime() < Date.now()) {
    throw new AppError("Sesión expirada", 401, "REFRESH_EXPIRADO");
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: sesion.usuarioId },
    select: SELECT_USUARIO_SESION,
  });

  if (
    !usuario ||
    !usuario.activo ||
    (usuario.personal && !usuario.personal.activo)
  ) {
    await revocarFamilia(sesion.familia);
    throw new AppError("Usuario inactivo", 403, "USUARIO_INACTIVO");
  }

  const rol = rolEfectivo(usuario);
  const nuevoRaw = generarRefreshToken();
  const nuevoHash = hashRefreshToken(nuevoRaw);

  await prisma.$transaction([
    prisma.sesionRefresh.update({
      where: { id: sesion.id },
      data: { revocadoEn: new Date(), usadoEn: new Date(), reemplazadoPor: nuevoHash },
    }),
    prisma.sesionRefresh.create({
      data: {
        usuarioId: sesion.usuarioId,
        familia: sesion.familia,
        tokenHash: nuevoHash,
        expiraEn: fechaExpiracionRefresh(),
        ip: ctx.ip ?? null,
        userAgent: ctx.userAgent ?? null,
      },
    }),
  ]);

  const token = generarToken({
    id: usuario.id,
    personalId: usuario.personal?.id,
    rol,
    tipoUsuario: usuario.tipoUsuario,
  });

  return { usuario, token, refreshToken: nuevoRaw };
};

/** Cierra la sesión: revoca la familia del refresh token presentado. Idempotente. */
export const cerrarSesion = async (rawToken: string | undefined) => {
  if (!rawToken) return;

  const sesion = await prisma.sesionRefresh.findUnique({
    where: { tokenHash: hashRefreshToken(rawToken) },
    select: { familia: true, usuarioId: true },
  });

  if (sesion) await revocarFamilia(sesion.familia);

  return sesion;
};

export const obtenerPerfil = async (usuarioId: string) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: {
      id: true,
      correo: true,
      nombre: true,
      apellidoPaterno: true,
      apellidoMaterno: true,
      tipoUsuario: true,
      tipoPersona: true,
      curp: true,
      rfc: true,
      activo: true,
      creadoEn: true,
      personal: {
        select: {
          id: true,
          rol: true,
          departamento: true,
          extension: true,
          fechaIngreso: true,
          activo: true,
        },
      },
    },
  });

  if (!usuario) {
    throw new AppError("Usuario no encontrado", 404);
  }

  return usuario;
};
