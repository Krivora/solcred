interface BaseLayoutParams {
    folio: string;
    estatus: string;
    titulo: string;
    subtitulo: string;
    contenido: string;
}

const TOKENS = `
  --background: oklch(0.9851 0 0);
  --foreground: oklch(0 0 0);
  --card: oklch(1 0 267.51);
  --card-foreground: oklch(0.2103 0 267.51);
  --primary: oklch(0.5144 0.1605 267.44);
  --primary-foreground: oklch(0.97 0.014 254.604);
  --secondary: oklch(0.94 0 0);
  --secondary-foreground: oklch(0.25 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.44 0 0);
  --accent: oklch(0.9214 0.0248 257.65);
  --accent-foreground: oklch(0.2571 0.1161 272.24);
  --destructive: oklch(0.58 0.22 27);
  --border: oklch(0.92 0 0);
  --chart-4: oklch(0.5144 0.1605 267.44);
  --chart-5: oklch(0.2571 0.1161 272.24);
`;

const ESTATUS_COLOR: Record<string, string> = {
    BORRADOR: 'var(--muted-foreground)',
    EN_REVISION: 'var(--chart-4)',
    APROBADA: 'oklch(0.55 0.15 145)',
    RECHAZADA: 'var(--destructive)',
    ENVIADA: 'var(--chart-4)',
};

function colorEstatus(estatus: string): string {
    return ESTATUS_COLOR[estatus] ?? 'var(--chart-4)';
}

export function baseLayout({ folio, estatus, titulo, subtitulo, contenido }: BaseLayoutParams): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  :root { ${TOKENS} }

  * { box-sizing: border-box; }

  @page {
    size: letter;
    margin: 0;
  }

  body {
    font-family: 'Geist', 'Helvetica Neue', Arial, sans-serif;
    color: var(--foreground);
    background: var(--background);
    font-size: 10.5px;
    line-height: 1.5;
    margin: 0;
  }

  .page-padding {
    padding: 36px 42px 60px 42px;
  }

  /* ---------- HEADER ---------- */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2.5px solid var(--primary);
    padding-bottom: 16px;
    margin-bottom: 22px;
  }

  .header-left { display: flex; flex-direction: column; gap: 4px; }

  .header-brand {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: var(--primary);
    text-transform: uppercase;
  }

  .header-title { font-size: 19px; font-weight: 700; color: var(--card-foreground); margin: 2px 0 0 0; }
  .header-subtitle { font-size: 11px; color: var(--muted-foreground); margin: 0; }

  .header-right { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }

  .folio-tag {
    font-size: 13px;
    font-weight: 700;
    color: var(--card-foreground);
    font-variant-numeric: tabular-nums;
  }

  .badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    background: var(--accent);
    color: ${colorEstatus(estatus)};
    border: 1px solid ${colorEstatus(estatus)};
  }

  /* ---------- SECTIONS ---------- */
  .section { margin-bottom: 18px; break-inside: avoid; }

  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  .section-icon {
    width: 6px;
    height: 6px;
    border-radius: 2px;
    background: var(--primary);
  }

  .section-title {
    font-size: 12.5px;
    font-weight: 700;
    color: var(--primary);
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 14px 16px;
  }

  /* ---------- FIELD GRID ---------- */
  .field-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 24px;
  }

  .field-grid.cols-3 { grid-template-columns: 1fr 1fr 1fr; }
  .field-grid.cols-1 { grid-template-columns: 1fr; }

  .field { display: flex; flex-direction: column; gap: 2px; }
  .field-label {
    font-size: 8.5px;
    color: var(--muted-foreground);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-weight: 600;
  }
  .field-value { font-size: 10.5px; color: var(--card-foreground); font-weight: 500; }
  .field-value.empty { color: var(--muted-foreground); font-style: italic; font-weight: 400; }

  /* ---------- TABLE ---------- */
  table.data-table { width: 100%; border-collapse: collapse; margin-top: 4px; }
  table.data-table th {
    text-align: left;
    font-size: 8.5px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--muted-foreground);
    font-weight: 600;
    padding: 6px 8px;
    border-bottom: 1.5px solid var(--border);
  }
  table.data-table td {
    font-size: 10px;
    padding: 7px 8px;
    border-bottom: 1px solid var(--border);
    color: var(--card-foreground);
  }
  table.data-table tr:last-child td { border-bottom: none; }
  table.data-table td.numeric { text-align: right; font-variant-numeric: tabular-nums; }
  table.data-table tfoot td {
    font-weight: 700;
    border-top: 1.5px solid var(--primary);
    border-bottom: none;
    padding-top: 8px;
  }

  /* ---------- SUBBLOCK (para garantías, conceptos individuales) ---------- */
  .subblock {
    border-left: 2.5px solid var(--accent);
    padding-left: 12px;
    margin-bottom: 12px;
  }
  .subblock:last-child { margin-bottom: 0; }
  .subblock-title { font-size: 10px; font-weight: 700; color: var(--card-foreground); margin-bottom: 6px; }

  /* ---------- FOOTER / FIRMAS ---------- */
  .firmas {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    margin-top: 40px;
    padding-top: 20px;
  }
  .firma-box { text-align: center; }
  .firma-linea { border-top: 1px solid var(--foreground); margin-bottom: 6px; padding-top: 30px; }
  .firma-label { font-size: 9.5px; color: var(--muted-foreground); }

  .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 10px 42px;
    font-size: 8px;
    color: var(--muted-foreground);
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
  }
</style>
</head>
<body>
  <div class="page-padding">
    <div class="header">
      <div class="header-left">
        <span class="header-brand">SolCred</span>
        <h1 class="header-title">${titulo}</h1>
        <p class="header-subtitle">${subtitulo}</p>
      </div>
      <div class="header-right">
        <span class="folio-tag">Folio ${folio}</span>
        <span class="badge">${estatus.replace(/_/g, ' ')}</span>
      </div>
    </div>

    ${contenido}
  </div>

  <div class="footer">
    <span>Documento generado por SolCred · ${new Date().toLocaleString('es-MX')}</span>
    <span>Folio ${folio}</span>
  </div>
</body>
</html>
`;
}

// ---------- HELPERS REUTILIZABLES PARA TEMPLATES ----------

export function field(label: string, value: string | number | null | undefined, sufijo = ''): string {
    const vacio = value === null || value === undefined || value === '';
    return `
    <div class="field">
      <span class="field-label">${label}</span>
      <span class="field-value ${vacio ? 'empty' : ''}">${vacio ? 'No especificado' : `${value}${sufijo}`}</span>
    </div>
  `;
}

export function sectionHeader(titulo: string): string {
    return `
    <div class="section-header">
      <span class="section-icon"></span>
      <span class="section-title">${titulo}</span>
    </div>
  `;
}

export function formatoMoneda(valor: number): string {
    return valor.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}