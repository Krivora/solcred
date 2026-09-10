import "dotenv/config";
import { z } from "zod";

/**
 * Validación de entorno con fail-fast.
 *
 * Antes, `process.env.JWT_SECRET as string` y `` `${process.env.DATABASE_URL}` ``
 * dejaban arrancar el proceso con configuración inválida (un JWT firmado con
 * `undefined`, una cadena de conexión literal `"undefined"`) y el fallo aparecía
 * mucho después, en runtime y sin causa clara. Este módulo parsea y valida todo
 * al importarse: si algo falta o está mal, el proceso muere con un mensaje que
 * nombra la variable.
 *
 * Lo consumen `config/db.ts` y `utils/jwt.ts`. En `app.ts` se importa de primero
 * para que el chequeo corra antes que cualquier ruta.
 */

const esPrueba =
  process.env.VITEST === "true" || process.env.NODE_ENV === "test";

const esquema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(4000),

  DATABASE_URL: z
    .string()
    .min(1, "requerida — cadena de conexión de PostgreSQL")
    .refine((v) => v.startsWith("postgres://") || v.startsWith("postgresql://"), {
      message: "debe ser una URL postgres:// o postgresql://",
    }),

  JWT_SECRET: z
    .string()
    .min(1, "requerido — secreto para firmar los access tokens"),

  FRONTEND_URL: z.url("debe ser una URL válida").default("http://localhost:3000"),

  // Saltos de proxy en los que confiar para `X-Forwarded-For` (rate-limit / IP de
  // auditoría). Nunca `true`. `0` desactiva `trust proxy` (sin proxy delante).
  TRUST_PROXY: z.coerce.number().int().nonnegative().default(1),

  // La cookie del refresh token es `Secure` solo cuando esto es "true" (prod https).
  COOKIE_SECURE: z.enum(["true", "false"]).default("false"),
});

// En pruebas nadie firma tokens con un secreto real y la BD es PGlite (con
// `@config/db` aliasado), así que damos valores inertes para que el import no
// truene al cargar `jwt.ts` / `sesion.config.ts`.
const fuente: NodeJS.ProcessEnv = esPrueba
  ? {
      ...process.env,
      DATABASE_URL:
        process.env.DATABASE_URL ?? "postgres://test:test@localhost:5432/test",
      JWT_SECRET: process.env.JWT_SECRET ?? "test-secret-solo-para-vitest",
    }
  : process.env;

const parsed = esquema.safeParse(fuente);

if (!parsed.success) {
  const detalle = parsed.error.issues
    .map((i) => `  • ${i.path.join(".") || "(raíz)"}: ${i.message}`)
    .join("\n");
  console.error(
    `\n✖ Configuración de entorno inválida:\n${detalle}\n\n` +
      `Revisa tu archivo .env (ver .env.example).\n`,
  );
  process.exit(1);
}

export const env = {
  ...parsed.data,
  /** `true` si la cookie del refresh token debe ser `Secure`. */
  cookieSecure: parsed.data.COOKIE_SECURE === "true",
  isProduction: parsed.data.NODE_ENV === "production",
  isTest: parsed.data.NODE_ENV === "test",
};

// Aviso (no bloqueante) si el secreto es débil en producción.
if (env.isProduction && env.JWT_SECRET.length < 32) {
  console.warn(
    "⚠️  JWT_SECRET tiene menos de 32 caracteres — usa un secreto más largo en producción.",
  );
}
