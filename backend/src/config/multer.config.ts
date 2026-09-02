import multer from "multer";
import path from "path";
import { Request } from "express";
import { AppError } from "@middlewares/error.middleware";

// ─────────────────────────────────────────────────────────────────────────────
// DIRECTORIO BASE DE ALMACENAMIENTO LOCAL
// ─────────────────────────────────────────────────────────────────────────────

export const UPLOADS_BASE_DIR = path.join(process.cwd(), "uploads", "expedientes");

// ─────────────────────────────────────────────────────────────────────────────
// STORAGE — en memoria. NO escribimos a disco aquí todavía.
// La escritura real ocurre en el controller, después de validar los magic
// bytes del contenido. Esto evita que un archivo malicioso (renombrado a
// .pdf con Content-Type falso) llegue a tocar el filesystem.
// ─────────────────────────────────────────────────────────────────────────────

const storage = multer.memoryStorage();

// ─────────────────────────────────────────────────────────────────────────────
// FILTRO — primer chequeo superficial (mimetype/extensión declarados por el
// cliente). NO es suficiente por sí solo — ver validación de magic bytes en
// uploads.controller.ts. Este filtro solo descarta casos obviamente inválidos
// temprano, antes de gastar ancho de banda innecesario.
// ─────────────────────────────────────────────────────────────────────────────

const filtroArchivo = (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const esMimeTypePdf = file.mimetype === "application/pdf";
    const esExtensionPdf = extension === ".pdf";

    if (!esMimeTypePdf || !esExtensionPdf) {
        return cb(new AppError("Solo se permiten archivos PDF", 400));
    }

    cb(null, true);
};

// ─────────────────────────────────────────────────────────────────────────────
// INSTANCIA DE MULTER
// ─────────────────────────────────────────────────────────────────────────────

export const uploadPdf = multer({
    storage,
    fileFilter: filtroArchivo,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
        files: 1,
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// SOPORTE — adjuntos de tickets: imágenes (PNG/JPEG) o PDF, hasta 5 por subida.
// Igual que arriba: memoria + filtro superficial; la validación real de
// magic bytes vive en el módulo de soporte antes de escribir a disco.
// ─────────────────────────────────────────────────────────────────────────────

export const UPLOADS_SOPORTE_DIR = path.join(process.cwd(), "uploads", "soporte");

/** mimetype declarado → extensiones aceptadas. */
const TIPOS_SOPORTE = new Map<string, string[]>([
    ["application/pdf", [".pdf"]],
    ["image/png", [".png"]],
    ["image/jpeg", [".jpg", ".jpeg"]],
]);

const filtroSoporte = (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const extensionesOk = TIPOS_SOPORTE.get(file.mimetype);

    if (!extensionesOk || !extensionesOk.includes(extension)) {
        return cb(new AppError("Solo se permiten imágenes PNG o JPEG y archivos PDF", 400));
    }

    cb(null, true);
};

export const uploadSoporte = multer({
    storage,
    fileFilter: filtroSoporte,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB por archivo
        files: 5,
    },
});