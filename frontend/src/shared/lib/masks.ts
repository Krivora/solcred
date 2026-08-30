/**
 * masks.ts
 * Funciones puras de formateo y limpieza para inputs controlados.
 * No dependen de React — se pueden usar en hooks, schemas o tests.
 */

// ─────────────────────────────────────────
// TELÉFONO: (XXX) XXX-XXXX — 10 dígitos
// ─────────────────────────────────────────

/** Deja solo dígitos, máximo 10 */
export function limpiarTelefono(valor: string): string {
  return valor.replace(/\D/g, "").slice(0, 10);
}

/** Convierte "3312345678" -> "(331) 234-5678" (progresivo, para mientras se escribe) */
export function formatearTelefono(valor: string): string {
  const digitos = limpiarTelefono(valor);
  const len = digitos.length;

  if (len === 0) return "";
  if (len < 4) return `(${digitos}`;
  if (len < 7) return `(${digitos.slice(0, 3)}) ${digitos.slice(3)}`;
  return `(${digitos.slice(0, 3)}) ${digitos.slice(3, 6)}-${digitos.slice(6)}`;
}

// ─────────────────────────────────────────
// CÓDIGO POSTAL: 5 dígitos
// ─────────────────────────────────────────

export function limpiarCodigoPostal(valor: string): string {
  return valor.replace(/\D/g, "").slice(0, 5);
}

// ─────────────────────────────────────────
// MONTO / MONEDA: "$1,234.50"
// ─────────────────────────────────────────

/**
 * Quita todo lo que no sea dígito o punto decimal, conserva solo un punto,
 * y limita a 2 decimales. Devuelve un string "crudo" sin formato de miles
 * (ej. "1234.5"), útil para guardar/parsear a número.
 */
export function limpiarMonto(valor: string): string {
  // Permitimos dígitos y un solo punto decimal
  let limpio = valor.replace(/[^\d.]/g, "");

  const partes = limpio.split(".");
  if (partes.length > 2) {
    // más de un punto -> nos quedamos con el primero
    limpio = partes[0] + "." + partes.slice(1).join("");
  }

  const [entero, decimal] = limpio.split(".");
  if (decimal !== undefined) {
    limpio = `${entero}.${decimal.slice(0, 2)}`;
  }

  return limpio;
}

/** Convierte "1234.5" -> "$1,234.50" para mostrar en el input */
export function formatearMonto(valorCrudo: string): string {
  if (!valorCrudo) return "";

  const [entero = "", decimal] = valorCrudo.split(".");
  const enteroFormateado = entero === "" ? "" : Number(entero).toLocaleString("es-MX");

  if (decimal === undefined) {
    // El usuario aún no escribe el punto
    return valorCrudo.endsWith(".") ? `$${enteroFormateado}.` : `$${enteroFormateado}`;
  }

  return `$${enteroFormateado}.${decimal}`;
}

/** "$1,234.50" -> 1234.5 (number), o null si está vacío/inválido */
export function montoAFloat(valorCrudo: string): number | null {
  const limpio = limpiarMonto(valorCrudo);
  if (limpio === "" || limpio === ".") return null;
  const num = parseFloat(limpio);
  return Number.isNaN(num) ? null : num;
}

// ─────────────────────────────────────────
// CORREO: no hay máscara (no restringimos tecleo),
// solo normalización ligera
// ─────────────────────────────────────────

/** quita espacios accidentales al inicio/fin y fuerza minúsculas */
export function normalizarCorreo(valor: string): string {
  return valor.trim().toLowerCase();
}