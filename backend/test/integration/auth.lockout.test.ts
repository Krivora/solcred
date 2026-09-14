import { describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import { prisma } from "./pglite-client";
import { hashContrasena } from "@utils/bcrypt";
import { iniciarSesion } from "@modules/auth/auth.service";
import { AppError } from "@middlewares/error.middleware";

// La factory `crearCliente` guarda "hash" como contraseña sin hashear de
// verdad, así que para probar login (que sí verifica con bcrypt) creamos el
// usuario de prueba directamente con un hash real.
const CONTRASENA_VALIDA = "Passw0rd!123";

async function crearUsuarioConContrasena(over: Record<string, unknown> = {}) {
  const contrasenaHash = await hashContrasena(CONTRASENA_VALIDA);
  return prisma.usuario.create({
    data: {
      correo: `lockout-${randomUUID()}@test.mx`,
      contrasena: contrasenaHash,
      tipoUsuario: "CLIENTE",
      tipoPersona: "FISICA",
      nombre: "Cli",
      apellidoPaterno: "Ente",
      apellidoMaterno: "Prueba",
      ...over,
    },
  });
}

describe("bloqueo temporal de cuenta tras intentos fallidos de login", () => {
  it("bloquea la cuenta tras 5 intentos fallidos, incluso con la contraseña correcta en el 6to", async () => {
    const usuario = await crearUsuarioConContrasena();

    for (let i = 0; i < 5; i++) {
      await expect(
        iniciarSesion({ correo: usuario.correo, contrasena: "incorrecta" })
      ).rejects.toThrow(AppError);
    }

    let error: AppError | undefined;
    try {
      await iniciarSesion({
        correo: usuario.correo,
        contrasena: CONTRASENA_VALIDA,
      });
    } catch (e) {
      error = e as AppError;
    }

    expect(error).toBeInstanceOf(AppError);
    expect(error?.code).toBe("CUENTA_BLOQUEADA");
    expect(error?.statusCode).toBe(423);
    expect(error?.message).toMatch(/minuto/);

    const enBd = await prisma.usuario.findUnique({ where: { id: usuario.id } });
    expect(enBd?.bloqueadoHasta).not.toBeNull();
    expect(enBd?.intentosFallidos).toBe(0);
  });

  it("permite login exitoso tras expirar el bloqueo y resetea los contadores en BD", async () => {
    const usuario = await crearUsuarioConContrasena();

    for (let i = 0; i < 5; i++) {
      await expect(
        iniciarSesion({ correo: usuario.correo, contrasena: "incorrecta" })
      ).rejects.toThrow(AppError);
    }

    const bloqueado = await prisma.usuario.findUnique({ where: { id: usuario.id } });
    expect(bloqueado?.bloqueadoHasta).not.toBeNull();

    // Adelanta el bloqueo manualmente al pasado.
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { bloqueadoHasta: new Date(Date.now() - 60_000) },
    });

    const resultado = await iniciarSesion({
      correo: usuario.correo,
      contrasena: CONTRASENA_VALIDA,
    });
    expect(resultado.usuario.id).toBe(usuario.id);

    const enBd = await prisma.usuario.findUnique({ where: { id: usuario.id } });
    expect(enBd?.bloqueadoHasta).toBeNull();
    expect(enBd?.intentosFallidos).toBe(0);
  });

  it("un login exitoso al primer intento nunca setea bloqueadoHasta", async () => {
    const usuario = await crearUsuarioConContrasena();

    const resultado = await iniciarSesion({
      correo: usuario.correo,
      contrasena: CONTRASENA_VALIDA,
    });
    expect(resultado.usuario.id).toBe(usuario.id);

    const enBd = await prisma.usuario.findUnique({ where: { id: usuario.id } });
    expect(enBd?.bloqueadoHasta).toBeNull();
    expect(enBd?.intentosFallidos).toBe(0);
  });
});
