import app from "./app";
import prisma from "./config/db";
import { env } from "./config/env";

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});

// Cierre ordenado: deja de aceptar conexiones nuevas, espera las en curso y
// libera el pool de Prisma. Necesario para despliegues en contenedores, que
// envían SIGTERM antes de matar el proceso.
const cerrar = (senal: string) => {
  console.log(`↩️  ${senal} recibido, cerrando servidor...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGTERM", () => cerrar("SIGTERM"));
process.on("SIGINT", () => cerrar("SIGINT"));

export default app;
