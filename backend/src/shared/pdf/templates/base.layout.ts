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
  /* ---------- TIMELINE ---------- */
  .timeline { padding: 4px 4px 0 4px; }
  .tl-item { display: flex; gap: 10px; }
  .tl-marker-col { display: flex; flex-direction: column; align-items: center; width: 10px; }
  .tl-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--bar); margin-top: 3px; flex-shrink: 0; }
  .tl-line { flex: 1; width: 1px; background: var(--border); margin-top: 2px; }
  .tl-content { padding-bottom: 10px; flex: 1; }
  .tl-fecha { font-size: 7.5px; color: var(--muted-foreground); text-transform: uppercase; letter-spacing: 0.03em; }
  .tl-titulo { font-size: 9px; font-weight: 700; margin-top: 1px; }
  .tl-detalle { font-size: 8.5px; color: var(--muted-foreground); margin-top: 1px; }

  /* ---------- STATS (documentos) ---------- */
  .stats-row { display: flex; gap: 8px; margin-bottom: 8px; }
  .stat-box {
    flex: 1; text-align: center; border: 1px solid var(--border); border-radius: 4px; padding: 6px 4px;
  }
  .stat-valor { font-size: 15px; font-weight: 800; color: var(--ink); }
  .stat-label { font-size: 7px; color: var(--muted-foreground); text-transform: uppercase; letter-spacing: 0.03em; margin-top: 1px; }

  /* ---------- PROGRESS BAR ---------- */
  .progress-track { width: 100%; height: 6px; background: var(--row-alt); border-radius: 3px; overflow: hidden; margin-top: 4px; }
  .progress-fill { height: 100%; background: var(--bar); }
  .progress-label { font-size: 8px; color: var(--muted-foreground); margin-top: 3px; text-align: right; }

  /* ---------- BADGE ESTATUS ---------- */
  .estatus-badge {
    display: inline-block;
    padding: 3px 12px;
    border-radius: 4px;
    background: var(--bar);
    color: var(--bar-foreground);
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.03em;
    text-transform: uppercase;
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

export function timelineItem(fecha: string, titulo: string, detalle: string | null, esUltimo: boolean): string {
  return `
    <div class="tl-item">
      <div class="tl-marker-col">
        <div class="tl-dot"></div>
        ${esUltimo ? '' : '<div class="tl-line"></div>'}
      </div>
      <div class="tl-content">
        <div class="tl-fecha">${fecha}</div>
        <div class="tl-titulo">${titulo}</div>
        ${detalle ? `<div class="tl-detalle">${detalle}</div>` : ''}
      </div>
    </div>
  `;
}

export function progressBar(porcentaje: number): string {
  return `
    <div class="progress-track">
      <div class="progress-fill" style="width:${porcentaje}%;"></div>
    </div>
    <div class="progress-label">${porcentaje}% del expediente integrado</div>
  `;
}

export function statBox(label: string, valor: number | string): string {
  return `
    <div class="stat-box">
      <div class="stat-valor">${valor}</div>
      <div class="stat-label">${label}</div>
    </div>
  `;
}