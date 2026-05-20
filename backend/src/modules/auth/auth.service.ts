import prisma from "../../config/db";
import { AppError } from "../../middlewares/error.middleware";
import { hashContrasena, verificarContrasena } from "../../utils/bcrypt";
import { generarToken } from "../../utils/jwt";
import { LoginDto, RegistroDto } from "./auth.schema";

export const registrarUsuario = async (dto: RegistroDto) => {
  const existente = await prisma.usuario.findUnique({
    where: { correo: dto.correo },
  });

  if (existente) {
    throw new AppError("El correo ya está registrado", 409);
  }

  const contrasenaHash = await hashContrasena(dto.contrasena);

  const usuario = await prisma.usuario.create({
    data: {
      ...dto,
      contrasena: contrasenaHash,
    },
    select: {
      id: true,
      correo: true,
      nombre: true,
      apellidoPaterno: true,
      apellidoMaterno: true,
      rol: true,
      tipoPersona: true,
      creadoEn: true,
    },
  });

  const token = generarToken({ id: usuario.id, rol: usuario.rol });

  return { usuario, token };
};

export const iniciarSesion = async (dto: LoginDto) => {
  const usuario = await prisma.usuario.findUnique({
    where: { correo: dto.correo },
    select: {
      id: true,
      correo: true,
      contrasena: true,
      nombre: true,
      apellidoPaterno: true,
      apellidoMaterno: true,
      rol: true,
      tipoPersona: true,
    },
  });

  if (!usuario) {
    // Mensaje genérico por seguridad, no revelar si existe o no
    throw new AppError("Credenciales inválidas", 401);
  }

  const contrasenaValida = await verificarContrasena(
    dto.contrasena,
    usuario.contrasena
  );

  if (!contrasenaValida) {
    throw new AppError("Credenciales inválidas", 401);
  }

  const { contrasena: _, ...usuarioSinContrasena } = usuario;

  const token = generarToken({
    id: usuario.id,
    rol: usuario.rol,
  });

  return { usuario: usuarioSinContrasena, token };
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
      rol: true,
      tipoPersona: true,
      curp: true,
      rfc: true,
      telefono: true,
      celular: true,
      calle: true,
      numeroExterior: true,
      numeroInterior: true,
      colonia: true,
      ciudad: true,
      estado: true,
      codigoPostal: true,
      nivelEstudio: true,
      universidad: true,
      estadoCivil: true,
      creadoEn: true,
    },
  });

  if (!usuario) {
    throw new AppError("Usuario no encontrado", 404);
  }

  return usuario;
};