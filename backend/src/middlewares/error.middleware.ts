import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { fail } from "../utils/response";
import multer from "multer";
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    /** Código legible por el cliente (p. ej. "TOKEN_EXPIRADO") para reaccionar sin parsear el mensaje. */
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof ZodError) {
    const errores = err.issues.map((issue) => ({
      campo: issue.path.join("."),
      mensaje: issue.message,
    }));

    res.status(422).json(fail("Error de validación", errores));
    return;
  }
  if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
          res.status(400).json({
              success: false,
              message: "El archivo excede el tamaño máximo permitido (10 MB)",
          });
          return;
      }
      res.status(400).json({
          success: false,
          message: "Error al subir el archivo",
      });
      return;
  }
  if (err instanceof AppError) {
    res.status(err.statusCode).json(fail(err.message, undefined, err.code));
    return;
  }

  console.error(err);
  res.status(500).json(fail("Error interno del servidor"));
};