import { PrismaClient } from "../../../../../generated/prisma/client";

export async function generarFolio(prisma: PrismaClient): Promise<string> {
    const result = await prisma.$queryRaw<{ nextval: bigint }[]>`
        SELECT nextval('solicitud_folio_seq')
    `;

    const siguiente = Number(result[0].nextval);

    return String(siguiente).padStart(5, '0'); // → "00001", "00042", etc.
}