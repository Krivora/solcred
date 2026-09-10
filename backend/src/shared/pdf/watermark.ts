/**
 * Marca de agua de trazabilidad para los PDF que sirve el sistema.
 *
 * Cada página recibe:
 *  - un texto diagonal repetido a baja opacidad (para que se note en una
 *    captura de pantalla sin tapar el contenido), y
 *  - una línea discreta al pie con la cadena de auditoría (folio + quién
 *    consulta + cuándo).
 *
 * Regla de oro: la marca NUNCA debe impedir ver el documento. Si `pdf-lib`
 * no puede parsear el archivo, se devuelve el buffer original intacto.
 */
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import prisma from "@config/db";

const GRIS = rgb(0.45, 0.45, 0.45);

/**
 * Estampa `lineas` sobre cada página de `pdf`. La primera línea se usa como
 * texto diagonal (marca visible); todas juntas van al pie como rastro.
 *
 * Función pura (sin BD) — es la que cubre la suite `unit`.
 */
export async function aplicarMarcaAgua(pdf: Buffer, lineas: string[]): Promise<Buffer> {
  if (lineas.length === 0) return pdf;

  try {
    const doc = await PDFDocument.load(pdf, { ignoreEncryption: true });
    const font = await doc.embedFont(StandardFonts.Helvetica);

    const textoDiagonal = lineas[0];
    const pie = lineas.join("  ·  ");

    for (const page of doc.getPages()) {
      const { width, height } = page.getSize();

      // ── Diagonal repetida (tenue) ──────────────────────────────
      const sizeDiag = 22;
      const anchoDiag = font.widthOfTextAtSize(textoDiagonal, sizeDiag);
      const paso = anchoDiag + 120;
      for (let y = -height; y < height * 2; y += 150) {
        for (let x = -width; x < width * 2; x += paso) {
          page.drawText(textoDiagonal, {
            x,
            y,
            size: sizeDiag,
            font,
            color: GRIS,
            opacity: 0.07,
            rotate: degrees(45),
          });
        }
      }

      // ── Línea de auditoría al pie ──────────────────────────────
      const sizePie = 7;
      let piePintado = pie;
      let anchoPie = font.widthOfTextAtSize(piePintado, sizePie);
      // Recorta si no cabe en el ancho de página.
      while (anchoPie > width - 24 && piePintado.length > 8) {
        piePintado = `${piePintado.slice(0, -4)}…`;
        anchoPie = font.widthOfTextAtSize(piePintado, sizePie);
      }
      page.drawText(piePintado, {
        x: (width - anchoPie) / 2,
        y: 12,
        size: sizePie,
        font,
        color: GRIS,
        opacity: 0.55,
      });
    }

    const bytes = await doc.save();
    return Buffer.from(bytes);
  } catch (error) {
    console.error("No se pudo estampar la marca de agua, se sirve el PDF original:", error);
    return pdf;
  }
}

const CARGO_POR_ROL: Record<string, string> = {
  ADMIN: "Administrador",
  ANALISTA: "Analista",
  GESTOR: "Gestor",
  SUPERVISOR: "Supervisor",
  ENCARGADO_PROMOCION: "Encargado de Promoción",
  ENCARGADO_FINANCIAMIENTO: "Encargado de Financiamiento",
  MESA_CONTROL: "Mesa de Control",
  SOPORTE: "Soporte",
  CLIENTE: "Cliente",
};

const formatearFechaHora = (fecha: Date): string =>
  fecha.toLocaleString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

/**
 * Resuelve el folio + nombre/rol de quien consulta y estampa la marca.
 * Es la variante que usan los controllers.
 */
export async function estamparMarcaAguaConsulta(
  pdf: Buffer,
  args: { folio: string; usuarioId: string; fecha?: Date }
): Promise<Buffer> {
  const fecha = args.fecha ?? new Date();

  let quien = "Usuario del sistema";
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: args.usuarioId },
      select: {
        nombre: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        personal: { select: { rol: true } },
      },
    });
    if (usuario) {
      const nombre = `${usuario.nombre} ${usuario.apellidoPaterno} ${usuario.apellidoMaterno}`.trim();
      const cargo = usuario.personal?.rol
        ? CARGO_POR_ROL[usuario.personal.rol] ?? usuario.personal.rol
        : "Cliente";
      quien = `${nombre} (${cargo})`;
    }
  } catch (error) {
    console.error("No se pudo resolver el consultante para la marca de agua:", error);
  }

  return aplicarMarcaAgua(pdf, [
    `Folio ${args.folio}`,
    `Consultado por ${quien}`,
    formatearFechaHora(fecha),
  ]);
}
