import { Router, Request, Response, NextFunction } from "express";
import { ok } from "@utils/response";
import { listarPublico } from "./programas-publico.service";

const router = Router();

// Sin `autenticar`: es justo el punto — el simulador de crédito corre antes
// de que la persona tenga cuenta. Solo devuelve catálogo de marketing (nada
// de datos personales), así que el rate-limit global de la API basta.
router.get("/", async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const programas = await listarPublico();
    res.status(200).json(ok("Programas obtenidos", programas));
  } catch (error) {
    next(error);
  }
});

export default router;
