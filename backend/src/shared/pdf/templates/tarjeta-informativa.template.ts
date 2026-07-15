import { TarjetaInformativaPDFData } from '../pdf.types';
import { baseLayout, bar, f, row, block, statBox, progressBar, timelineItem } from './base.layout';

export function tarjetaInformativaTemplate(data: TarjetaInformativaPDFData): string {
    const contenido = [
        seccionGeneral(data),
        seccionGestor(data),
        seccionDocumentos(data),
        seccionTimeline(data),
        seccionHistorialEstatus(data),
        data.historialAsignaciones.length > 0 ? seccionHistorialAsignaciones(data) : '',
        data.observaciones.length > 0 ? seccionObservaciones(data) : '',
    ]
        .filter(Boolean)
        .join('\n');

    return baseLayoutTarjeta({
        folio: data.folio,
        contenido,
    });
}

// Layout propio (no usa firma, es documento interno de consulta)
function baseLayoutTarjeta({ folio, contenido }: { folio: string; contenido: string }): string {
    return baseLayout({
        folio,
        lugar: 'Hermosillo, Sonora, México',
        fechaEnvio: '',
        contenido,
        nombreSolicitante: '',
    }).replace(/<div class="firma">[\s\S]*?<\/div>\s*<\/div>\s*<\/body>/, '</div></body>')
        .replace('SOLICITUD DE FINANCIAMIENTO', 'TARJETA INFORMATIVA')
        .replace('Solicitud de Financiamiento', 'Tarjeta Informativa');
}

function seccionGeneral(data: TarjetaInformativaPDFData): string {
    return block(
        bar('Datos Generales'),
        row(
            f('Folio', data.folio, 'quarter'),
            f('Fecha de registro', data.fechaRegistro, 'quarter'),
            f('Programa', data.programa, 'half')
        ) +
        row(
            f('Solicitante', data.solicitanteNombre, 'half'),
            f('Monto solicitado', data.montoSolicitado, 'quarter'),
            f('Municipio', data.municipio, 'quarter')
        ) +
        row(
            f('Sector', data.sector, 'third'),
            f('Tipo de persona', data.tipoPersona, 'third'),
            f('Tamaño de empresa', data.tamanoEmpresa, 'third')
        ) +
        `<div style="margin-top:6px;"><span class="estatus-badge">${data.estatusActual.replace(/_/g, ' ')}</span></div>`
    );
}

function seccionGestor(data: TarjetaInformativaPDFData): string {
    if (!data.gestorActual) {
        return block(bar('Gestor Asignado'), `<p style="color:var(--muted-foreground); font-style:italic; margin:0;">Sin gestor asignado actualmente</p>`);
    }
    return block(
        bar('Gestor Asignado'),
        row(
            f('Gestor', data.gestorActual.nombre, 'third'),
            f('Grupo de gestión', data.gestorActual.grupo, 'third'),
            f('Fecha de asignación', data.gestorActual.fechaAsignacion, 'third')
        )
    );
}

function seccionDocumentos(data: TarjetaInformativaPDFData): string {
    const d = data.documentos;
    const filas = d.detalle
        .map(
            (doc) => `
      <tr>
        <td>${doc.nombre}</td>
        <td>v${doc.version}</td>
        <td>${doc.estatus}</td>
        <td>${doc.motivoRechazo ?? '—'}</td>
      </tr>`
        )
        .join('');

    return block(
        bar('Seguimiento de Documentos'),
        `<div class="stats-row">
      ${statBox('Requeridos', d.totalRequeridos)}
      ${statBox('Subidos', d.totalSubidos)}
      ${statBox('Aprobados', d.aprobados)}
      ${statBox('Pendientes', d.pendientes)}
      ${statBox('Rechazados', d.rechazados)}
    </div>
    ${progressBar(d.porcentajeAvance)}
    ${d.detalle.length > 0
            ? `<table class="data-table" style="margin-top:8px;">
            <thead><tr><th>Documento</th><th>Versión</th><th>Estatus</th><th>Observación</th></tr></thead>
            <tbody>${filas}</tbody>
          </table>`
            : ''
        }`
    );
}

function seccionTimeline(data: TarjetaInformativaPDFData): string {
    const items = data.timeline
        .map((ev, i) => timelineItem(ev.fecha, ev.titulo, ev.detalle, i === data.timeline.length - 1))
        .join('');

    return block(bar('Resumen del Proceso'), `<div class="timeline">${items}</div>`);
}

function seccionHistorialEstatus(data: TarjetaInformativaPDFData): string {
    const filas = data.historialEstatus
        .map(
            (h) => `
      <tr>
        <td>${h.estatusAnterior.replace(/_/g, ' ')}</td>
        <td>${h.estatusNuevo.replace(/_/g, ' ')}</td>
        <td>${h.fecha}</td>
        <td>${h.usuario}</td>
        <td>${h.motivo ?? '—'}</td>
      </tr>`
        )
        .join('');

    return block(
        bar('Historial de Cambios de Estatus'),
        `<table class="data-table">
      <thead><tr><th>Estatus anterior</th><th>Estatus nuevo</th><th>Fecha</th><th>Usuario</th><th>Motivo</th></tr></thead>
      <tbody>${filas}</tbody>
    </table>`
    );
}

function seccionHistorialAsignaciones(data: TarjetaInformativaPDFData): string {
    const filas = data.historialAsignaciones
        .map(
            (a) => `
      <tr>
        <td>${a.gestor}</td>
        <td>${a.grupo}</td>
        <td>${a.fechaAsignacion}</td>
        <td>${a.fechaReasignacion ?? 'Vigente'}</td>
        <td>${a.asignadoPor ?? '—'}</td>
        <td>${a.motivoReasignacion ?? '—'}</td>
      </tr>`
        )
        .join('');

    return block(
        bar('Historial de Asignaciones'),
        `<table class="data-table">
      <thead><tr><th>Gestor</th><th>Grupo</th><th>Asignado</th><th>Reasignado</th><th>Asignado por</th><th>Motivo</th></tr></thead>
      <tbody>${filas}</tbody>
    </table>`
    );
}

function seccionObservaciones(data: TarjetaInformativaPDFData): string {
    const items = data.observaciones.map((obs) => `<li style="margin-bottom:4px;">${obs}</li>`).join('');
    return block(bar('Observaciones Relevantes'), `<ul style="margin:0; padding-left:16px;">${items}</ul>`);
}