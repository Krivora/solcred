import { CartaRechazoPDFData } from '../pdf.types';

const TOKENS = `
  --ink: oklch(0.18 0.02 258);
  --bar: oklch(0.25 0.03 258);
  --bar-foreground: oklch(0.98 0 0);
  --muted-foreground: oklch(0.42 0 0);
  --border-strong: oklch(0.25 0.03 258);
`;

const FIRMANTE_NOMBRE = "ALDO PAUL AVALOS GARCIA";
const FIRMANTE_CARGO = "DIRECCIÓN DE PROMOCIÓN";
const FUNDAMENTO_LEGAL_ESTANDAR =
    "los artículos 18, fracción II, y 34, fracción I del apartado B del Reglamento Interior de SolCred, " +
    "así como el apartado 4.2 del Manual de Normas y Políticas de Crédito de SolCred y el numeral 12 " +
    "de las Reglas de Operación del Programa de Financiamiento correspondiente.";

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
        Por medio de la presente, hacemos referencia a su solicitud de crédito con folio
        <strong>${data.folio}</strong>, correspondiente al programa "<strong>${data.programa}</strong>",
        por un importe de <strong>${data.monto}</strong>, presentada ante este Organismo el
        <strong>${data.fechaSolicitud}</strong>.
      </p>

      <p>
        Le informamos que, una vez concluido el proceso de revisión y evaluación conforme a los
        requisitos y políticas de crédito vigentes, no fue posible autorizar su solicitud.
      </p>

      <p>El motivo de esta decisión es el siguiente:</p>

      <div class="motivo-box">${data.motivoRechazo}</div>

      <p class="fundamento">
        Lo anterior con fundamento en ${FUNDAMENTO_LEGAL_ESTANDAR}
      </p>

      <p>
        Le invitamos a no considerar esta respuesta como definitiva para futuras gestiones. Nuestro
        proceso de solicitud es continuo y contamos con distintas opciones de financiamiento
        diseñadas para impulsar su emprendimiento, por lo que quedamos atentos para acompañarle en
        una próxima oportunidad.
      </p>

      <p>
        Agradecemos el interés mostrado en nuestros programas y quedamos a sus órdenes para
        cualquier duda o aclaración al respecto.
      </p>

      <p>Atentamente.</p>
    </div>

    <div class="firma">
      <div class="firma-nombre">C. ${FIRMANTE_NOMBRE}</div>
      <div class="firma-cargo">${FIRMANTE_CARGO}</div>
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