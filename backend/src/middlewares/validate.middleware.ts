import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

type ValidateSource = "body" | "params" | "query";

export const validate =
    (schema: ZodSchema, source: ValidateSource = "body") =>
    (req: Request, _res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req[source]);

        if (!result.success) {
            next(result.error);
            return;
        }

        // Reemplazamos la fuente con el dato parseado y limpio por Zod
        // Para params y query usamos cast porque Express los tipifica como read-only
        if (source === "body") {
            req.body = result.data;
        } else if (source === "params") {
            req.params = result.data as Record<string, string>;
        } else if (source === "query") {
            req.query = result.data as Record<string, string>;
        }

        next();
    };