import { PrismaClient } from "../../../../generated/prisma/client";

export async function generarFolio(prisma: PrismaClient): Promise<string> {
    // Busca el folio más alto que exista actualmente
    const ultima = await prisma.solicitud.findFirst({
        orderBy: { creadoEn: 'desc' },
        select: { folio: true },
    });

    const siguiente = ultima?.folio
        ? parseInt(ultima.folio, 10) + 1
        : 1;

    return String(siguiente).padStart(5, '0'); // → "00001", "00042", etc.
}