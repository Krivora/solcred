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

        // Se reemplaza la fuente con el dato ya parseado y saneado por Zod.
        if (source === "body") {
            req.body = result.data;
        } else if (source === "params") {
            req.params = result.data as Record<string, string>;
        } else {
            // Express 5: `req.query` es un getter de solo lectura — reasignarlo
            // lanza `TypeError`. Se muta el objeto en sitio: se vacía y se
            // rellena con lo parseado.
            const q = req.query as Record<string, unknown>;
            for (const clave of Object.keys(q)) delete q[clave];
            Object.assign(q, result.data);
        }

        next();
    };