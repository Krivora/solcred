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