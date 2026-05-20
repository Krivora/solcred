import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { fail } from "../utils/response";

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400
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

  if (err instanceof AppError) {
    res.status(err.statusCode).json(fail(err.message));
    return;
  }

  console.error(err);
  res.status(500).json(fail("Error interno del servidor"));
};