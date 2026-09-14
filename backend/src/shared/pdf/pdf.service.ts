import puppeteer, { Browser, Page } from 'puppeteer';

/**
 * Navegador compartido entre peticiones: arrancar Chromium es caro, así que se
 * reutiliza una sola instancia y cada PDF abre/cierra su propia pestaña.
 *
 * El detalle importante: si Chromium se cae (crash, suspensión del equipo,
 * OOM…), la promesa cacheada apunta a un navegador muerto y TODA generación de
 * PDF falla con 500 hasta reiniciar el backend. Por eso:
 *  - se escucha `disconnected` para invalidar la caché,
 *  - un arranque fallido no se cachea,
 *  - `generarPDFDesdeHTML` recicla el navegador y reintenta una vez.
 */
let browserPromise: Promise<Browser> | null = null;

async function lanzarBrowser(): Promise<Browser> {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    browser.on('disconnected', () => {
        if (browserPromise) browserPromise = null;
    });
    return browser;
}

function getBrowser(): Promise<Browser> {
    if (!browserPromise) {
        browserPromise = lanzarBrowser().catch((err) => {
            browserPromise = null; // no cachees un arranque fallido
            throw err;
        });
    }
    return browserPromise;
}

async function reciclarBrowser(browser: Browser): Promise<void> {
    browserPromise = null;
    try {
        await browser.close();
    } catch {
        /* el navegador ya estaba caído */
    }
}

// Alto de una hoja carta a 96dpi (11in). Junto con los márgenes de abajo,
// define cuánto contenido cabe por página para el cálculo del espaciador de firma.
const ALTO_PAGINA_PX = 1056;
const ANCHO_PAGINA_PX = 816;
const MARGEN_INFERIOR_PX = 40;
// Debe coincidir con el padding-bottom de `.page` en base.layout.ts: ese espacio
// queda DESPUÉS de la firma, así que hay que restarlo del hueco disponible en la
// última hoja o la firma quedaría empujada a una hoja extra casi vacía.
const PADDING_INFERIOR_PAGINA_PX = 24;

export async function generarPDFDesdeHTML(html: string): Promise<Buffer> {
    let ultimoError: unknown;

    // Los documentos generados con base.layout.ts (solicitud, tarjeta informativa)
    // incluyen este marcador: necesitan margen superior + firma clavada al fondo
    // de la última hoja. El resto de plantillas conserva el comportamiento previo.
    const requiereFirmaAlPie = html.includes('class="firma-spacer"');
    const margenSuperiorPx = requiereFirmaAlPie ? 20 : 0;
    const altoUtilPorPagina = ALTO_PAGINA_PX - margenSuperiorPx - MARGEN_INFERIOR_PX;

    for (let intento = 1; intento <= 2; intento++) {
        let browser: Browser;
        try {
            browser = await getBrowser();
        } catch (err) {
            ultimoError = err;
            continue;
        }

        let page: Page;
        try {
            page = await browser.newPage();
        } catch (err) {
            ultimoError = err;
            await reciclarBrowser(browser); // navegador zombi: recíclalo y reintenta
            continue;
        }

        try {
            if (requiereFirmaAlPie) {
                // Iguala el ancho de layout al de la hoja impresa para que la medición
                // de alturas (más abajo) coincida con la paginación real de Chromium.
                await page.setViewport({ width: ANCHO_PAGINA_PX, height: ALTO_PAGINA_PX });
            }

            await page.setContent(html, { waitUntil: 'load' });

            if (requiereFirmaAlPie) {
                // No basta con dividir la altura total entre el alto útil de página:
                // los bloques con `break-inside: avoid` que no caben se difieren
                // completos a la siguiente hoja (dejando hueco en la actual), así que
                // simulamos ese mismo empaquetado bloque por bloque para saber cuánto
                // espacio le queda realmente libre a la última hoja.
                await page.evaluate((altoUtil: number, paddingInferiorPagina: number) => {
                    const pageEl = document.querySelector<HTMLElement>('.page');
                    const spacer = document.querySelector<HTMLElement>('.firma-spacer');
                    const firma = document.querySelector<HTMLElement>('.firma');
                    if (!pageEl || !spacer || !firma) return;

                    spacer.style.height = '0px';
                    const altoFirma = firma.getBoundingClientRect().height;

                    const hijos = Array.from(pageEl.children).filter(
                        (el) => el !== spacer && el !== firma
                    ) as HTMLElement[];

                    let usadoEnPagina = 0;
                    for (const el of hijos) {
                        const estilo = getComputedStyle(el);
                        const alto =
                            el.getBoundingClientRect().height +
                            parseFloat(estilo.marginTop) +
                            parseFloat(estilo.marginBottom);

                        if (usadoEnPagina + alto <= altoUtil) {
                            usadoEnPagina += alto;
                        } else {
                            // No cupo completo: se difiere a una hoja nueva (igual que
                            // hace Chromium con break-inside: avoid).
                            usadoEnPagina = Math.min(alto, altoUtil);
                        }
                    }

                    const separacionMinima = 24;
                    const restanteEnPagina = altoUtil - usadoEnPagina;

                    let alturaSpacer: number;
                    if (restanteEnPagina - paddingInferiorPagina >= altoFirma + separacionMinima) {
                        // Cabe en lo que queda de la última hoja: se queda pegada al fondo de esa hoja.
                        alturaSpacer = restanteEnPagina - paddingInferiorPagina - altoFirma;
                    } else {
                        // No cabe: se rellena el resto de la hoja actual + toda la
                        // siguiente hasta su fondo (igual que break-inside: avoid).
                        alturaSpacer = restanteEnPagina + (altoUtil - paddingInferiorPagina - altoFirma);
                    }

                    spacer.style.height = `${Math.max(0, alturaSpacer)}px`;
                }, altoUtilPorPagina, PADDING_INFERIOR_PAGINA_PX);
            }

            const pdfBuffer = await page.pdf({
                format: 'letter',
                printBackground: true,
                margin: { top: `${margenSuperiorPx}px`, bottom: `${MARGEN_INFERIOR_PX}px`, left: '0px', right: '0px' },
            });
            await page.close().catch(() => { /* noop */ });
            return Buffer.from(pdfBuffer);
        } catch (err) {
            ultimoError = err;
            await page.close().catch(() => { /* noop */ });
            await reciclarBrowser(browser);
        }
    }

    throw ultimoError instanceof Error
        ? ultimoError
        : new Error('No se pudo generar el PDF tras reintentar');
}

export async function cerrarBrowserPDF(): Promise<void> {
    if (browserPromise) {
        const browser = await browserPromise;
        await browser.close();
        browserPromise = null;
    }
}
