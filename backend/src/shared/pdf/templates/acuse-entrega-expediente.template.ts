import { AcuseEntregaExpedientePDFData } from '../pdf.types';

const TOKENS = `
  --ink: oklch(0.18 0.02 258);
  --bar: oklch(0.25 0.03 258);
  --bar-foreground: oklch(0.98 0 0);
  --muted-foreground: oklch(0.42 0 0);
  --border-strong: oklch(0.25 0.03 258);
`;

const DESTINATARIO_NOMBRE = "C.P. JORGE HERNÁNDEZ CISCOMANI";
const DESTINATARIO_CARGO = "DIRECCIÓN GENERAL DE ADMINISTRACIÓN Y FINANCIAMIENTO";
const ENTIDAD_NOMBRE = "Financiera para el Desarrollo Económico de Sonora";
const RECIBE_NOMBRE = "MESA DE CONTROL";
const RECIBE_CARGO = "";

export function acuseEntregaExpedienteTemplate(data: AcuseEntregaExpedientePDFData): string {
    const documentosHtml = data.documentos.map((doc) => `<li>${doc}</li>`).join('');

    return `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  :root { ${TOKENS} }
  * { box-sizing: border-box; }
  @page { size: letter; margin: 0; }

  body {
    font-family: 'Geist', 'Helvetica Neue', Arial, sans-serif;
    color: var(--ink);
    font-size: 10.5px;
    line-height: 1.7;
    margin: 0;
  }

  .page { padding: 32px 46px 30px 46px; min-height: 100vh; display: flex; flex-direction: column; }

  .top-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 2.5px solid var(--border-strong);
    padding-bottom: 10px;
    margin-bottom: 26px;
  }

  .brand-name { font-size: 19px; font-weight: 800; letter-spacing: -0.02em; color: var(--ink); }
  .brand-tagline { font-size: 7.5px; color: var(--muted-foreground); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 1px; }

  .title-block { text-align: right; }
  .title-main { font-size: 12px; font-weight: 700; color: var(--ink); letter-spacing: 0.02em; text-transform: uppercase; }

  .fecha-lugar { text-align: right; font-size: 10px; margin-bottom: 24px; }

  .asunto { font-weight: 700; margin-bottom: 22px; }

  .destinatario { margin-bottom: 22px; }
  .destinatario-nombre { font-weight: 700; text-transform: uppercase; }
  .destinatario-linea { margin-top: 1px; }

  .cuerpo { text-align: justify; }
  .cuerpo p { margin: 0 0 14px 0; }

  ul.doc-list { margin: 4px 0 16px 0; padding-left: 20px; }
  ul.doc-list li { margin-bottom: 4px; }

  .comentarios { margin-bottom: 16px; }
  .comentarios .titulo { font-weight: 700; }

  .firmas-fila {
    display: flex;
    justify-content: space-between;
    margin-top: 46px;
  }
  .firma-col { text-align: center; width: 42%; }
  .firma-linea { border-top: 1.5px solid var(--ink); margin-bottom: 6px; }
  .firma-nombre { font-weight: 700; text-transform: uppercase; font-size: 10px; }
  .firma-cargo { font-size: 9px; text-transform: uppercase; color: var(--muted-foreground); margin-top: 2px; }

  .firma-centrada { display: flex; justify-content: center; margin-top: 40px; }
  .firma-centrada .firma-col { width: 42%; }

  .footer-institucional {
    margin-top: auto;
    padding-top: 16px;
    border-top: 1px solid var(--border-strong);
    text-align: center;
    font-size: 7.5px;
    color: var(--muted-foreground);
    line-height: 1.5;
  }
</style>
</head>
<body>
  <div class="page">
    <div class="top-header">
      <div>
        <div class="brand-name">SolCred</div>
        <div class="brand-tagline">Sistema de Gestión de Solicitudes</div>
      </div>
      <div class="title-block">
        <div class="title-main">Acuse de Entrega de Expediente</div>
      </div>
    </div>

    <div class="fecha-lugar">${data.lugar} a ${data.fecha}<br/>${ENTIDAD_NOMBRE}</div>

    <div class="asunto">Asunto: Acuse de Entrega de Expediente</div>

    <div class="destinatario">
      <div class="destinatario-nombre">${DESTINATARIO_NOMBRE}</div>
      <div class="destinatario-linea">${DESTINATARIO_CARGO}</div>
    </div>

    <div class="cuerpo">
      <p>
        Por medio de este conducto y anexo el presente envío a usted el expediente
        <strong>${data.folio}</strong> a nombre de <strong>${data.solicitanteNombre}</strong>
        del programa "<strong>${data.programa}</strong>" por un importe de
        <strong>${data.monto}</strong>, el cuál ha sido revisado en la cantidad y calidad de
        los documentos que integran el mismo, los cuales fueron obtenidos del solicitante como
        a continuación se detalla:
      </p>

      <ul class="doc-list">
        ${documentosHtml}
      </ul>

      <div class="comentarios">
        <span class="titulo">Comentarios:</span> ${data.comentarios ?? '.'}
      </div>

      <p>
        Sin más por el momento, quedo a su disposición para cualquier aclaración o consulta adicional.
      </p>
    </div>

    <div class="firmas-fila">
      <div class="firma-col">
        <div class="firma-linea"></div>
        <div class="firma-nombre">ENTREGA:</div>
        <div class="firma-nombre">C. ${data.entrega.nombre}</div>
        <div class="firma-cargo">${data.entrega.cargo}</div>
      </div>
      <div class="firma-col">
        <div class="firma-linea"></div>
        <div class="firma-nombre">RECIBE:</div>
        <div class="firma-nombre">${RECIBE_NOMBRE}</div>
        <div class="firma-cargo">${RECIBE_CARGO}</div>
      </div>
    </div>

    <div class="firma-centrada">
      <div class="firma-col">
        <div class="firma-linea"></div>
        <div class="firma-nombre">REVISÓ:</div>
        <div class="firma-nombre">C. ${data.reviso.nombre}</div>
        <div class="firma-cargo">${data.reviso.cargo}</div>
      </div>
    </div>

    <div class="footer-institucional">
      Documento generado por SolCred — Folio ${data.folio}<br/>
      Este documento es enviado de manera automática, favor de no responder.
    </div>
  </div>
</body>
</html>
`;
}