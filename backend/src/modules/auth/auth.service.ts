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

  // El registro público siempre crea un CLIENTE, nunca PERSONAL
  const usuario = await prisma.usuario.create({
    data: {
      ...dto,
      contrasena: contrasenaHash,
      tipoUsuario: "CLIENTE",
    },
    select: {
      id: true,
      correo: true,
      nombre: true,
      apellidoPaterno: true,
      apellidoMaterno: true,
      tipoUsuario: true,
      tipoPersona: true,
      creadoEn: true,
    },
  });

  // Un registro público siempre es CLIENTE, nunca tiene Personal asociado
  const token = generarToken({
    id: usuario.id,
    rol: "CLIENTE",
    tipoUsuario: usuario.tipoUsuario,
  });

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
      tipoUsuario: true,
      tipoPersona: true,
      activo: true,
      personal: {
        select: {
          id: true,
          rol: true,
          departamento: true,
          activo: true,
        },
      },
    },
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

  const rol = usuario.personal?.rol ?? "CLIENTE";

  const { contrasena: _, ...usuarioSinContrasena } = usuario;

  const token = generarToken({
    id: usuario.id,
    personalId: usuario.personal?.id,
    rol,
    tipoUsuario: usuario.tipoUsuario,
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