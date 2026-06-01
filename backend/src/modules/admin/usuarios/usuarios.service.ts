import prisma from "@config/db";
import { AppError } from "@middlewares/error.middleware";
import { ActualizarUsuarioDto, CambiarRolDto } from "./usuarios.schema";

const seleccionSegura = {
  id: true,
  correo: true,
  nombre: true,
  apellidoPaterno: true,
  apellidoMaterno: true,
  rol: true,
  tipoPersona: true,
  curp: true,
  rfc: true,
  activo: true,
  creadoEn: true,
  actualizadoEn: true,
};

export const listarUsuarios = async () => {
  return prisma.usuario.findMany({
    where: { activo: true },
    select: seleccionSegura,
    orderBy: { creadoEn: "desc" },
  });
};

export const obtenerUsuarioPorId = async (id: string) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    select: seleccionSegura,
  });

  if (!usuario) throw new AppError("Usuario no encontrado", 404);

  return usuario;
};

export const actualizarUsuario = async (
  id: string,
  dto: ActualizarUsuarioDto,
  solicitanteId: string,
  solicitanteRol: string
) => {
  const usuario = await prisma.usuario.findUnique({ where: { id } });

  if (!usuario) throw new AppError("Usuario no encontrado", 404);
  if (!usuario.activo) throw new AppError("El usuario está desactivado", 400);

  // Solo el mismo usuario o un admin puede actualizar
  if (id !== solicitanteId && solicitanteRol !== "ADMIN") {
    throw new AppError("No tienes permisos para modificar este usuario", 403);
  }

  return prisma.usuario.update({
    where: { id },
    data: dto,
    select: seleccionSegura,
  });
};

export const cambiarRol = async (id: string, dto: CambiarRolDto) => {
  const usuario = await prisma.usuario.findUnique({ where: { id } });

  if (!usuario) throw new AppError("Usuario no encontrado", 404);
  if (!usuario.activo) throw new AppError("El usuario está desactivado", 400);

  return prisma.usuario.update({
    where: { id },
    data: { rol: dto.rol },
    select: seleccionSegura,
  });
};

export const desactivarUsuario = async (id: string, solicitanteId: string) => {
  if (id === solicitanteId) {
    throw new AppError("No puedes desactivar tu propia cuenta", 400);
  }

  const usuario = await prisma.usuario.findUnique({ where: { id } });

  if (!usuario) throw new AppError("Usuario no encontrado", 404);
  if (!usuario.activo) throw new AppError("El usuario ya está desactivado", 400);

  return prisma.usuario.update({
    where: { id },
    data: { activo: false },
    select: seleccionSegura,
  });
};