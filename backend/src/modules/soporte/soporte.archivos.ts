import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { AppError } from "@middlewares/error.middleware";
import { UPLOADS_SOPORTE_DIR } from "@config/multer.config";

/** Firma de contenido (magic bytes) → mimetype real. */
const FIRMAS: { mime: string; ext: string; bytes: Buffer }[] = [
  { mime: "application/pdf", ext: "pdf", bytes: Buffer.from("%PDF-") },
  { mime: "image/png", ext: "png", bytes: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) },
  { mime: "image/jpeg", ext: "jpg", bytes: Buffer.from([0xff, 0xd8, 0xff]) },
];

const MAX_POR_TICKET = 20;

/** Detecta el tipo real por los primeros bytes; null si no coincide con ninguno permitido. */
const detectarTipo = (buffer: Buffer): { mime: string; ext: string } | null => {
  for (const f of FIRMAS) {
    if (buffer.length >= f.bytes.length && buffer.subarray(0, f.bytes.length).equals(f.bytes)) {
      return { mime: f.mime, ext: f.ext };
    }
  }
  return null;
};

export interface AdjuntoGuardado {
  urlArchivo: string; // relativa a UPLOADS_SOPORTE_DIR
  rutaAbsoluta: string;
  nombreArchivo: string;
  nombreOriginal: string;
  tipoMime: string;
  tamanoBytes: number;
}

/**
 * Valida los magic bytes de cada archivo y los escribe a
 * `uploads/soporte/<ticketId>/<uuid>.<ext>`. Si algo falla a mitad, borra lo
 * que ya escribió y lanza. El caller es responsable de crear los registros en BD.
 */
export const validarYGuardarAdjuntos = async (
  ticketId: string,
  archivos: Express.Multer.File[],
  adjuntosPrevios: number
): Promise<AdjuntoGuardado[]> => {
  if (archivos.length === 0) return [];

  if (adjuntosPrevios + archivos.length > MAX_POR_TICKET) {
    throw new AppError(`Un ticket admite hasta ${MAX_POR_TICKET} adjuntos`, 400);
  }

  // 1. Validar todo ANTES de tocar disco.
  const validados = archivos.map((archivo) => {
    const tipo = detectarTipo(archivo.buffer);
    if (!tipo) {
      throw new AppError(
        `El archivo "${archivo.originalname}" no es una imagen PNG/JPEG ni un PDF válido`,
        400
      );
    }
    return { archivo, tipo };
  });

  // 2. Escribir. Si una falla, limpiar las anteriores.
  const carpeta = path.join(UPLOADS_SOPORTE_DIR, ticketId);
  await fs.mkdir(carpeta, { recursive: true });

  const guardados: AdjuntoGuardado[] = [];
  try {
    for (const { archivo, tipo } of validados) {
      const nombreArchivo = `${randomUUID()}.${tipo.ext}`;
      const rutaAbsoluta = path.join(carpeta, nombreArchivo);
      await fs.writeFile(rutaAbsoluta, archivo.buffer);
      guardados.push({
        urlArchivo: `${ticketId}/${nombreArchivo}`,
        rutaAbsoluta,
        nombreArchivo,
        nombreOriginal: archivo.originalname.slice(0, 255),
        tipoMime: tipo.mime,
        tamanoBytes: archivo.size,
      });
    }
  } catch (error) {
    await limpiarAdjuntos(guardados.map((g) => g.rutaAbsoluta));
    throw error;
  }

  return guardados;
};

/** Borra archivos de disco de forma silenciosa (rollback ante error de BD). */
export const limpiarAdjuntos = async (rutas: string[]): Promise<void> => {
  await Promise.all(rutas.map((r) => fs.unlink(r).catch(() => {})));
};

/** Ruta absoluta segura de un adjunto ya persistido (defensa contra path traversal). */
export const rutaAbsolutaAdjunto = (urlArchivo: string): string => {
  const abs = path.normalize(path.join(UPLOADS_SOPORTE_DIR, urlArchivo));
  const base = path.normalize(UPLOADS_SOPORTE_DIR);
  if (!abs.startsWith(base)) {
    throw new AppError("Ruta de archivo inválida", 400);
  }
  return abs;
};
