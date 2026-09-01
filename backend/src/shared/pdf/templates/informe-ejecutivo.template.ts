import { InformeEjecutivoPDFData, PeriodoSituacionPDF } from '../pdf.types';
import { formatoMoneda } from './base.layout';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const esc = (v: string | null | undefined): string =>
    (v ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

const money = (n: number | null | undefined): string =>
    n === null || n === undefined ? '—' : formatoMoneda(n);

const val = (v: string | number | null | undefined): string => {
    if (v === null || v === undefined || v === '') return '—';
    return esc(String(v));
};

/** Banda de título de sección (ancho completo). */
const banda = (t: string): string => `<div class="sec-band">${esc(t)}</div>`;

/** Rejilla de campos etiqueta/valor en 2 columnas (label + value, label + value). */
function grid(pares: [string, string][]): string {
    const filas: string[] = [];
    for (let i = 0; i < pares.length; i += 2) {
        const a = pares[i];
        const b = pares[i + 1];
        filas.push(
            `<tr>
        <td class="lbl">${esc(a[0])}</td><td class="val">${a[1]}</td>
        ${b ? `<td class="lbl">${esc(b[0])}</td><td class="val">${b[1]}</td>` : '<td class="lbl"></td><td class="val"></td>'}
      </tr>`,
        );
    }
    return `<table class="grid">${filas.join('')}</table>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Documento
// ─────────────────────────────────────────────────────────────────────────────

export function informeEjecutivoTemplate(d: InformeEjecutivoPDFData): string {
    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  @page { size: letter; margin: 0; }
  * { box-sizing: border-box; }
  :root {
    --ink: #111827;
    --muted: #4b5563;
    --band: #1f2937;
    --band-ink: #ffffff;
    --lbl-bg: #e8edf3;
    --line: #6b7280;
    --line-soft: #9ca3af;
    --head-bg: #dfe5ec;
  }
  body {
    margin: 0;
    font-family: 'Geist', 'Helvetica Neue', Arial, sans-serif;
    color: var(--ink);
    font-size: 8px;
    line-height: 1.32;
  }
  .page { padding: 26px 30px 34px 30px; }

  .form-title {
    text-align: center; font-size: 12.5px; font-weight: 800; letter-spacing: 0.04em;
    text-transform: uppercase; border: 1.5px solid var(--band); padding: 6px 0; margin-bottom: 0;
  }

  table { border-collapse: collapse; width: 100%; }

  /* Banda de datos del encabezado */
  table.band td { border: 1px solid var(--line); padding: 3px 7px; font-size: 8px; vertical-align: middle; }
  table.band td.k {
    background: var(--band); color: var(--band-ink); font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.03em; width: 15%; white-space: nowrap;
  }
  table.band td.v { font-weight: 600; }

  /* Banda de sección */
  .sec-band {
    background: var(--band); color: var(--band-ink); font-size: 8px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.05em; padding: 3px 8px;
    margin-top: 9px; border: 1px solid var(--band);
  }

  /* Rejilla etiqueta/valor */
  table.grid { border: 1px solid var(--line); border-top: none; }
  table.grid td { border: 1px solid var(--line-soft); padding: 3px 7px; font-size: 8px; }
  table.grid td.lbl {
    background: var(--lbl-bg); font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.02em; width: 21%; color: var(--muted); vertical-align: top;
  }
  table.grid td.val { width: 29%; font-weight: 600; }

  /* Tablas de datos */
  table.dt { border: 1px solid var(--line); border-top: none; }
  table.dt th {
    background: var(--head-bg); text-align: left; font-size: 7.2px; text-transform: uppercase;
    letter-spacing: 0.03em; font-weight: 800; padding: 4px 7px; border: 1px solid var(--line-soft);
  }
  table.dt td { font-size: 8px; padding: 3.5px 7px; border: 1px solid var(--line-soft); }
  table.dt td.num, table.dt th.num { text-align: right; font-variant-numeric: tabular-nums; }
  table.dt tr.total td, table.dt tfoot td { font-weight: 800; background: var(--head-bg); }
  table.dt tr.destacar td { font-weight: 800; }

  .nota { font-size: 6.9px; color: var(--muted); font-style: italic; margin: 2px 0 0 1px; }

  /* Comentarios */
  .coment {
    border: 1px solid var(--line); border-top: none; padding: 6px 8px;
  }
  .coment p { margin: 0 0 4px 0; font-size: 8px; text-align: justify; }
  .coment p:last-child { margin-bottom: 0; }
  .coment b { text-transform: uppercase; letter-spacing: 0.02em; }

  /* Firmas */
  .firmas-wrap { break-inside: avoid; }
  table.firmas { border: none; margin-top: 4px; }
  table.firmas tr { break-inside: avoid; }
  table.firmas td {
    width: 33.333%; text-align: center; vertical-align: bottom; padding: 24px 10px 0 10px; border: none;
  }
  table.firmas .linea { border-top: 1px solid var(--ink); padding-top: 3px; }
  table.firmas .f-n { font-size: 7.6px; font-weight: 700; }
  table.firmas .f-c { font-size: 6.6px; color: var(--muted); }

  .foot {
    margin-top: 12px; font-size: 6.6px; color: var(--muted);
    display: flex; justify-content: space-between; border-top: 1px solid var(--line-soft); padding-top: 3px;
  }
</style>
</head>
<body>
  <div class="page">
    <div class="form-title">Informe Ejecutivo de Crédito</div>

    <table class="band">
      <tr>
        <td class="k">Programa</td>
        <td class="v">${esc(d.programa)} · Folio ${esc(d.folio)}</td>
        <td class="k">Fecha</td>
        <td class="v">${esc(d.fecha)}</td>
      </tr>
      <tr>
        <td class="k">Asesor</td>
        <td class="v">${val(d.identificacion.asesor)}</td>
        <td class="k">Analista</td>
        <td class="v">${val(d.identificacion.analista)}</td>
      </tr>
    </table>

    ${banda('Identificación del Solicitante y Proyecto')}
    ${grid([
        ['Nombre / Razón social', val(d.identificacion.solicitante)],
        ['Antigüedad del negocio', val(d.identificacion.antiguedadNegocio)],
        ['Nombre comercial', val(d.identificacion.nombreComercial)],
        ['Experiencia', val(d.identificacion.experiencia)],
        ['Actividad', val(d.identificacion.actividad)],
        ['Ubicación del proyecto', val(d.identificacion.ubicacion)],
        ['RFC', val(d.identificacion.rfc)],
        ['Tipo de persona', val(d.identificacion.tipoPersona)],
    ])}

    ${banda('Términos y Condiciones del Financiamiento')}
    ${grid([
        ['Monto solicitado', money(d.objetivo.montoSolicitado)],
        ['Monto ajustado', money(d.objetivo.montoAjustado)],
        ['Destino del crédito', val(d.objetivo.destino)],
        ['Objetivo del crédito', val(d.objetivo.objetivoPrograma)],
        ['Plazo', `${d.condiciones.plazoMeses} meses`],
        ['Periodo de gracia', `${d.condiciones.mesesGracia} meses`],
        ['Tasa anual', `${d.condiciones.tasaAnual}%`],
        ['Tasa ordinaria (programa)', `${d.condiciones.tasaOrdinaria}%`],
        ['Tasa moratoria (programa)', `${d.condiciones.tasaMoratoria}%`],
        ['Forma de cobro', 'Periódica mensual'],
        ['Pago mensual (cap + int)', money(d.condiciones.pagoMensual)],
        ['Total a pagar', money(d.condiciones.totalPagar)],
        ['Antecedentes de crédito', d.identificacion.conAntecedentes ? 'Sí' : 'No'],
        ['Aval', d.aval.tiene ? `Sí — ${esc(d.aval.nombre ?? 'registrado')}` : 'No'],
    ])}
    <div class="nota">El área jurídica definirá el tipo de contrato definitivo.</div>

    ${banda('Programa de Inversión')}
    ${seccionInversion(d)}

    ${banda('Situación Financiera Mensual')}
    ${seccionSituacion(d)}

    ${banda('Garantía')}
    ${seccionGarantia(d)}

    ${banda('Comentarios')}
    ${seccionComentarios(d)}

    <div class="firmas-wrap">
      ${banda('Autorización — Comité Interno de Crédito')}
      ${seccionFirmas(d)}
    </div>

    <div class="foot">
      <span>SolCred · Informe generado el ${esc(d.fecha)}</span>
      <span>Folio ${esc(d.folio)} · ${esc(d.estatus.replace(/_/g, ' '))}</span>
    </div>
  </div>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────

function seccionInversion(d: InformeEjecutivoPDFData): string {
    const filas =
        d.programaInversion.filas
            .map(
                (r) => `<tr>
        <td>${esc(r.categoria)}</td>
        <td>${esc(r.concepto)}</td>
        <td class="num">${formatoMoneda(r.monto)}</td>
        <td class="num">${r.participacion.toFixed(1)}%</td>
      </tr>`,
            )
            .join('') || '<tr><td colspan="4">Sin conceptos capturados</td></tr>';

    return `<table class="dt">
    <thead><tr><th>Categoría</th><th>Concepto</th><th class="num">Monto</th><th class="num">Participación</th></tr></thead>
    <tbody>${filas}</tbody>
    <tfoot><tr><td colspan="2">Total</td><td class="num">${formatoMoneda(d.programaInversion.total)}</td><td class="num">100.0%</td></tr></tfoot>
  </table>`;
}

function seccionSituacion(d: InformeEjecutivoPDFData): string {
    const { ejecutivo: e, proyectado: p } = d.situacion;
    const pago = d.condiciones.pagoMensual;

    if (!e && !p) {
        return `<div class="coment"><p>El analista aún no captura la situación financiera.</p></div>`;
    }

    const col = (
        get: (x: PeriodoSituacionPDF) => number | null,
        fmt: (n: number) => string = formatoMoneda,
    ): string => {
        const c1 = e ? (get(e) === null ? '—' : fmt(get(e) as number)) : '—';
        const c2 = p ? (get(p) === null ? '—' : fmt(get(p) as number)) : '—';
        return `<td class="num">${c1}</td><td class="num">${c2}</td>`;
    };

    const empActuales = d.identificacion.empleosActuales;
    const empNuevos = d.identificacion.empleosNuevos;
    const filaEmpleos =
        empActuales !== null || empNuevos !== null
            ? `<tr><td>Empleos</td><td class="num">${empActuales ?? '—'} actuales</td><td class="num">${
                  (empActuales ?? 0) + (empNuevos ?? 0)
              } proyectados</td></tr>`
            : '';

    return `<table class="dt">
    <thead><tr><th>Concepto</th><th class="num">${esc(e?.etiqueta ?? 'Actual')}</th><th class="num">${esc(p?.etiqueta ?? 'Proyectado')}</th></tr></thead>
    <tbody>
      <tr><td>Ventas</td>${col((x) => x.ventas)}</tr>
      <tr><td>Costo de venta</td>${col((x) => x.costos)}</tr>
      <tr><td>Gastos mensuales</td>${col((x) => x.gastosOperativos)}</tr>
      <tr class="destacar"><td>Utilidad</td>${col((x) => x.ebit)}</tr>
      <tr><td>Amortización (cap + int)</td><td class="num">${money(pago)}</td><td class="num">${money(pago)}</td></tr>
      <tr class="destacar"><td>Capacidad de pago</td>${col((x) => x.capacidadPago, (n) => `${n.toFixed(2)}×`)}</tr>
      ${filaEmpleos}
    </tbody>
  </table>
  <div class="nota">Cifras mensuales. Capacidad de pago = utilidad ÷ amortización mensual.</div>`;
}

function seccionGarantia(d: InformeEjecutivoPDFData): string {
    if (!d.garantia.requiere) {
        return `<div class="coment"><p>${esc(d.garantia.nota)}</p></div>`;
    }

    const cobertura =
        d.garantia.cobertura === null ? '—' : `${d.garantia.cobertura.toFixed(1)}×`;

    const filas = d.garantia.filas
        .map(
            (g) => `<tr>
        <td>${esc(g.tipo)}</td>
        <td>${esc(g.propietario)}</td>
        <td class="num">${formatoMoneda(g.valor)}</td>
        <td>${esc([g.descripcion, g.detalle].filter(Boolean).join(' · ')) || '—'}</td>
      </tr>`,
        )
        .join('');

    return `<table class="dt">
    <thead><tr><th>Tipo</th><th>Propiedad de</th><th class="num">Valor</th><th>Descripción</th></tr></thead>
    <tbody>${filas}</tbody>
    <tfoot><tr><td colspan="2">Valor total · cobertura ${cobertura}</td><td class="num">${formatoMoneda(d.garantia.valorTotal)}</td><td></td></tr></tfoot>
  </table>`;
}

function seccionComentarios(d: InformeEjecutivoPDFData): string {
    const c = d.comentarios;
    const items: [string, string | null][] = [
        ['Antecedentes', c.antecedentes],
        ['Buró de crédito', c.buroCredito],
        ['Situación financiera', c.situacionFinanciera],
        ['Visita', c.visita],
        ['Comentarios del analista', c.opinionAnalista],
    ];
    const cuerpo = items
        .filter(([, t]) => t && t.trim())
        .map(([h, t]) => `<p><b>${esc(h)}:</b> ${esc(t)}</p>`)
        .join('');

    return `<div class="coment">${cuerpo || '<p>Sin comentarios capturados.</p>'}</div>`;
}

function seccionFirmas(d: InformeEjecutivoPDFData): string {
    if (d.firmas.length === 0) {
        return `<div class="coment"><p>Sin firmantes configurados.</p></div>`;
    }
    const celdas: string[] = [];
    for (let i = 0; i < d.firmas.length; i += 3) {
        const grupo = d.firmas.slice(i, i + 3);
        const tds = grupo
            .map(
                (fm) => `<td>
        <div class="linea">
          <div class="f-n">${esc(fm.nombre)}</div>
          <div class="f-c">${esc(fm.cargo)}</div>
        </div>
      </td>`,
            )
            .join('');
        const relleno = '<td></td>'.repeat(3 - grupo.length);
        celdas.push(`<tr>${tds}${relleno}</tr>`);
    }
    return `<table class="firmas">${celdas.join('')}</table>`;
}
