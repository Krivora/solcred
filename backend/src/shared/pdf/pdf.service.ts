import puppeteer, { Browser } from 'puppeteer';

let browserPromise: Promise<Browser> | null = null;

function getBrowser(): Promise<Browser> {
    if (!browserPromise) {
        browserPromise = puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
    }
    return browserPromise;
}

export async function generarPDFDesdeHTML(html: string): Promise<Buffer> {
    const browser = await getBrowser();
    const page = await browser.newPage();
    try {
        await page.setContent(html, { waitUntil: 'load' });
        const pdfBuffer = await page.pdf({
            format: 'letter',
            printBackground: true,
            margin: { top: '0px', bottom: '40px', left: '0px', right: '0px' },
        });
        return Buffer.from(pdfBuffer);
    } finally {
        await page.close();
    }
}

export async function cerrarBrowserPDF(): Promise<void> {
    if (browserPromise) {
        const browser = await browserPromise;
        await browser.close();
        browserPromise = null;
    }
}