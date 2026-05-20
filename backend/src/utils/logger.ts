import morgan from "morgan";
import { Request, Response } from "express";

export const httpLogger = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  {
    skip: (_req: Request, res: Response) => res.statusCode < 400,
  }
);