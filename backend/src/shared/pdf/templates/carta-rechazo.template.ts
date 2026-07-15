import { CartaRechazoPDFData } from '../pdf.types';

const TOKENS = `
  --ink: oklch(0.18 0.02 258);
  --bar: oklch(0.25 0.03 258);
  --bar-foreground: oklch(0.98 0 0);
  --muted-foreground: oklch(0.42 0 0);
  --border-strong: oklch(0.25 0.03 258);
`;

export function cartaRechazoTemplate(data: CartaRechazoPDFData): string {
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

  .atencion { font-weight: 700; margin-bottom: 16px; }

  .cuerpo { text-align: justify; }
  .cuerpo p { margin: 0 0 14px 0; }

  .motivo-box {
    border-left: 3px solid var(--bar);
    background: oklch(0.97 0 0);
    padding: 10px 14px;
    margin: 4px 0 16px 0;
    font-style: italic;
  }

  .fundamento { font-size: 9.5px; color: var(--muted-foreground); }

  .firma {
    margin-top: 46px;
    text-align: center;
  }
  .firma-nombre { font-weight: 700; text-transform: uppercase; font-size: 10.5px; }
  .firma-cargo { font-size: 9.5px; margin-top: 2px; }

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
        <div class="title-main">Notificación de Rechazo</div>
      </div>
    </div>

    <div class="fecha-lugar">${data.lugarFecha}</div>

    <div class="asunto">Asunto: Notificación de rechazo de solicitud de crédito.</div>

    <div class="destinatario">
      <div class="destinatario-nombre">${data.nombreDestinatario}</div>
      <div class="destinatario-linea">${data.domicilioDestinatario}</div>
    </div>

    <div class="atencion">ATN: C. ${data.nombreDestinatario}</div>

    <div class="cuerpo">
      <p>
        En atención a su solicitud de crédito con folio <strong>${data.folio}</strong> correspondiente
        al programa "<strong>${data.programa}</strong>", por un importe de <strong>${data.monto}</strong>
        presentada ante este Organismo el pasado <strong>${data.fechaSolicitud}</strong>, le informo que,
        tras la revisión efectuada conforme a los requisitos de valuación establecidos por el área
        correspondiente, se ha determinado el rechazo de su solicitud.
      </p>

      <p>La negativa de su solicitud de crédito se debe a que:</p>

      <div class="motivo-box">${data.motivoRechazo}</div>

      <p class="fundamento">
        Con fundamento en: ${data.fundamentoLegal}
      </p>

      <p>
        No obstante lo anterior, le reiteramos nuestra disposición para atenderle en futuras ocasiones.
        Actualmente, nuestro proceso de solicitud es más ágil y sencillo, por lo que le invitamos a
        considerar nuevamente nuestras opciones de financiamiento, diseñadas para impulsar su
        emprendimiento y fortalecer su negocio con tasas preferenciales.
      </p>

      <p>
        Agradecemos su interés en nuestros programas y quedamos a su disposición para cualquier
        aclaración o trámite futuro.
      </p>

      <p>Atentamente.</p>
    </div>

    <div class="firma">
      <div class="firma-nombre">C. ${data.firmanteNombre}</div>
      <div class="firma-cargo">${data.firmanteCargo}</div>
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