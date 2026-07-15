interface BaseLayoutParams {
  folio: string;
  lugar: string;
  fechaEnvio: string;
  contenido: string;
  nombreSolicitante: string;
}

const TOKENS = `
  --ink: oklch(0.18 0.02 258);
  --bar: oklch(0.25 0.03 258);
  --bar-foreground: oklch(0.98 0 0);
  --muted-foreground: oklch(0.42 0 0);
  --border: oklch(0.82 0 0);
  --border-strong: oklch(0.25 0.03 258);
  --row-alt: oklch(0.965 0 0);
`;

export function baseLayout({ folio, lugar, fechaEnvio, contenido, nombreSolicitante }: BaseLayoutParams): string {
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
    font-size: 9px;
    line-height: 1.35;
    margin: 0;
  }

  .page { padding: 26px 34px 24px 34px; }

  /* ---------- ENCABEZADO ---------- */
  .top-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 2.5px solid var(--border-strong);
    padding-bottom: 10px;
    margin-bottom: 12px;
  }

  .brand-name {
    font-size: 19px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--ink);
  }
  .brand-tagline {
    font-size: 7.5px;
    color: var(--muted-foreground);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-top: 1px;
  }

  .title-block { text-align: right; }
  .title-main {
    font-size: 13px;
    font-weight: 700;
    color: var(--ink);
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  .title-sub { font-size: 8.5px; color: var(--muted-foreground); margin-top: 1px; }

  /* ---------- BARRA DE SECCIÓN ---------- */
  .block { break-inside: avoid; margin-bottom: 8px; }

  .bar {
    background: var(--bar);
    color: var(--bar-foreground);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 4px 10px;
  }

  .section-body {
    border: 1px solid var(--border);
    border-top: none;
    padding: 6px 10px 7px 10px;
  }

  /* ---------- FILAS DE CAMPOS ---------- */
  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 2px 18px;
    padding: 2px 0;
    border-bottom: 1px solid var(--row-alt);
  }
  .row:last-child { border-bottom: none; }

  .f {
    display: inline-flex;
    align-items: baseline;
    gap: 4px;
    white-space: nowrap;
  }
  .f.w-half { flex-basis: calc(50% - 9px); white-space: normal; }
  .f.w-third { flex-basis: calc(33.333% - 12px); white-space: normal; }
  .f.w-quarter { flex-basis: calc(25% - 13.5px); white-space: normal; }
  .f.w-full { flex-basis: 100%; white-space: normal; }

  .f-label {
    font-weight: 700;
    color: var(--ink);
    font-size: 8.5px;
  }
  .f-value { color: var(--ink); font-size: 8.5px; }
  .f-value.empty { color: var(--muted-foreground); }

  /* ---------- TABLAS ---------- */
  table.data-table { width: 100%; border-collapse: collapse; margin-top: 2px; }
  table.data-table th {
    background: var(--row-alt);
    text-align: left;
    font-size: 7.5px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--muted-foreground);
    font-weight: 700;
    padding: 4px 7px;
    border: 1px solid var(--border);
  }
  table.data-table td {
    font-size: 8.5px;
    padding: 4px 7px;
    border: 1px solid var(--border);
  }
  table.data-table td.numeric { text-align: right; font-variant-numeric: tabular-nums; }
  table.data-table tfoot td { font-weight: 700; background: var(--row-alt); }

  /* ---------- FIRMA ÚNICA ---------- */
  .firma {
    break-inside: avoid;
    margin-top: 30px;
    display: flex;
    justify-content: center;
  }
  .firma-box { text-align: center; width: 260px; }
  .firma-linea { border-top: 1px solid var(--ink); padding-top: 4px; }
  .firma-nombre { font-size: 9px; font-weight: 700; }
  .firma-label { font-size: 8px; color: var(--muted-foreground); margin-top: 2px; }
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
        <div class="title-main">Solicitud de Financiamiento</div>
        <div class="title-sub">${lugar}</div>
      </div>
    </div>

    ${contenido}

    <div class="firma">
      <div class="firma-box">
        <div class="firma-linea">
          <div class="firma-nombre">${nombreSolicitante}</div>
          <div class="firma-label">Firma del Solicitante</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

// ---------- HELPERS ----------

export function bar(titulo: string): string {
  return `<div class="bar">${titulo}</div>`;
}

export function f(label: string, value: string | number | null | undefined, ancho: 'auto' | 'half' | 'third' | 'quarter' | 'full' = 'auto', sufijo = ''): string {
  const vacio = value === null || value === undefined || value === '';
  const claseAncho = ancho === 'auto' ? '' : `w-${ancho}`;
  return `
    <span class="f ${claseAncho}">
      <span class="f-label">${label}:</span>
      <span class="f-value ${vacio ? 'empty' : ''}">${vacio ? '—' : `${value}${sufijo}`}</span>
    </span>
  `;
}

export function row(...campos: string[]): string {
  return `<div class="row">${campos.join('')}</div>`;
}

export function block(barHtml: string, bodyHtml: string): string {
  return `<div class="block">${barHtml}<div class="section-body">${bodyHtml}</div></div>`;
}

export function formatoMoneda(valor: number): string {
  return valor.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}