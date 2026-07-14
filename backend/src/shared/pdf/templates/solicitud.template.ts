import { SolicitudPDFData, GarantiaPDF } from '../pdf.types';
import { baseLayout, field, sectionHeader, formatoMoneda } from './base.layout';

export function solicitudTemplate(data: SolicitudPDFData): string {
    const secciones = [
        seccionGeneral(data),
        data.datosSolicitante ? seccionPersona('Datos del Solicitante', data.datosSolicitante) : '',
        data.datosAval ? seccionPersona('Datos del Aval', data.datosAval) : '',
        data.datosNegocio ? seccionNegocio(data.datosNegocio) : '',
        data.datosCredito ? seccionCredito(data.datosCredito) : '',
        data.datosGarantia && data.datosGarantia.length > 0 ? seccionGarantias(data.datosGarantia) : '',
        data.datosMercado ? seccionMercado(data.datosMercado) : '',
        data.datosBancarios ? seccionBancarios(data.datosBancarios) : '',
        data.documentos && data.documentos.length > 0 ? seccionDocumentos(data.documentos) : '',
        seccionFirmas(),
    ]
        .filter(Boolean)
        .join('\n');

    return baseLayout({
        folio: data.folio,
        estatus: data.estatus,
        titulo: 'Solicitud de Financiamiento',
        subtitulo: data.programa,
        contenido: secciones,
    });
}

function seccionGeneral(data: SolicitudPDFData): string {
    return `
    <div class="section">
      ${sectionHeader('Información General')}
      <div class="card">
        <div class="field-grid cols-3">
          ${field('Programa', data.programa)}
          ${field('Fecha de solicitud', data.fechaSolicitud)}
          ${field('Tipo de persona', data.tipoPersona)}
          ${field('Sector', data.sector)}
          ${field('Tamaño de empresa', data.tamanoEmpresa)}
        </div>
      </div>
    </div>
  `;
}

function seccionPersona(titulo: string, p: NonNullable<SolicitudPDFData['datosSolicitante']>): string {
    return `
    <div class="section">
      ${sectionHeader(titulo)}
      <div class="card">
        <div class="field-grid">
          ${field('Nombre completo', p.nombreCompleto)}
          ${field('CURP', p.curp)}
          ${field('RFC', p.rfc)}
          ${field('Correo', p.correo)}
          ${field('Teléfono', p.telefono)}
          ${field('Celular', p.celular)}
          ${field('Domicilio', p.domicilio)}
          ${field('Nivel de estudio', p.nivelEstudio)}
          ${field('Universidad', p.universidad)}
          ${field('Estado civil', p.estadoCivil)}
          ${field('Nombre del cónyuge', p.nombreConyuge)}
          ${field('Número INE', p.numeroINE)}
          ${field('Tipo de vivienda', p.tipoVivienda)}
          ${field('Antigüedad domicilio actual', p.aniosDomicilioActual, ' años')}
          ${field('Antigüedad domicilio anterior', p.aniosDomicilioAnterior, ' años')}
        </div>
      </div>
    </div>
  `;
}

function seccionNegocio(n: NonNullable<SolicitudPDFData['datosNegocio']>): string {
    return `
    <div class="section">
      ${sectionHeader('Datos del Negocio')}
      <div class="card">
        <div class="field-grid">
          ${field('Razón social', n.razonSocial)}
          ${field('RFC del negocio', n.rfcNegocio)}
          ${field('Nombre comercial', n.nombreNegocio)}
          ${field('Domicilio del negocio', n.domicilioNegocio)}
          ${field('Actividad', n.actividadNegocio)}
          ${field('Área', n.areaNegocio)}
          ${field('Tipo de local', n.tipoLocal)}
          ${field('Fecha inicio de operaciones', n.fechaInicioOperaciones)}
          ${field('Antigüedad del negocio', n.antiguedadNegocio, ' años')}
          ${field('Empleos conservados', n.empleosConservados)}
          ${field('Empleos nuevos', n.empleosNuevos)}
          ${field('Experiencia en la actividad', n.experienciaActividadSolicitante, ' años')}
          ${field('Experiencia como empresario', n.experienciaEmpresarioSolicitante, ' años')}
          ${field('Actualmente exporta', n.actualExporta === null ? null : n.actualExporta ? 'Sí' : 'No')}
          ${field('Teléfono de recados', n.telefonoRecadosNegocio)}
          ${field('Teléfono fijo', n.telefonoFijoNegocio)}
        </div>
      </div>
    </div>
  `;
}

function seccionCredito(c: NonNullable<SolicitudPDFData['datosCredito']>): string {
    const filas = c.conceptos
        .map(
            (item) => `
      <tr>
        <td>${item.categoria.replace(/_/g, ' ')}</td>
        <td>${item.concepto}</td>
        <td class="numeric">${formatoMoneda(item.monto)}</td>
      </tr>`
        )
        .join('');

    return `
    <div class="section">
      ${sectionHeader('Datos del Crédito')}
      <div class="card">
        <div class="field-grid cols-3">
          ${field('Plazo', c.plazoMeses, ' meses')}
          ${field('Meses de gracia', c.mesesGracia)}
          ${field('Monto total solicitado', formatoMoneda(c.montoTotal))}
        </div>
        <table class="data-table" style="margin-top: 12px;">
          <thead>
            <tr><th>Categoría</th><th>Concepto</th><th style="text-align:right;">Monto</th></tr>
          </thead>
          <tbody>${filas}</tbody>
          <tfoot>
            <tr><td colspan="2">Total</td><td class="numeric">${formatoMoneda(c.montoTotal)}</td></tr>
          </tfoot>
        </table>
      </div>
    </div>
  `;
}

function seccionGarantias(garantias: GarantiaPDF[]): string {
    const bloques = garantias
        .map((g, i) => {
            const camposEspecificos =
                g.tipo === 'PRENDARIA'
                    ? `${field('Marca', g.marca)}${field('Modelo', g.modelo)}${field('Año', g.anio)}${field('No. de serie', g.numeroSerie)}`
                    : `${field('Domicilio', g.domicilio)}${field('No. de escritura', g.numeroEscritura)}${field('Folio real', g.folioReal)}`;

            return `
        <div class="subblock">
          <div class="subblock-title">Garantía ${i + 1} — ${g.tipo}</div>
          <div class="field-grid cols-3">
            ${field('Propietario', g.nombrePropietario)}
            ${field('Valor', formatoMoneda(g.valor))}
            ${field('Descripción', g.descripcion)}
            ${camposEspecificos}
          </div>
        </div>
      `;
        })
        .join('');

    return `
    <div class="section">
      ${sectionHeader('Garantías')}
      <div class="card">${bloques}</div>
    </div>
  `;
}

function seccionMercado(m: NonNullable<SolicitudPDFData['datosMercado']>): string {
    const distribucion = m.distribucionClientes
        .map((d) => field(d.label, d.valor === null ? null : d.valor, '%'))
        .join('');
    const cobertura = m.coberturaGeografica
        .map((c) => field(c.label, c.valor === null ? null : c.valor, '%'))
        .join('');

    return `
    <div class="section">
      ${sectionHeader('Datos de Mercado')}
      <div class="card">
        <div class="field-grid cols-1">${field('Principales productos', m.principalesProductos)}</div>
        <div class="subblock" style="margin-top:12px;">
          <div class="subblock-title">Distribución por tipo de cliente</div>
          <div class="field-grid cols-3">${distribucion}</div>
        </div>
        <div class="subblock">
          <div class="subblock-title">Cobertura geográfica</div>
          <div class="field-grid cols-3">${cobertura}</div>
        </div>
      </div>
    </div>
  `;
}

function seccionBancarios(b: NonNullable<SolicitudPDFData['datosBancarios']>): string {
    return `
    <div class="section">
      ${sectionHeader('Datos Bancarios')}
      <div class="card">
        <div class="field-grid cols-3">
          ${field('Banco', b.banco)}
          ${field('Número de cuenta', b.numeroCuenta)}
          ${field('CLABE', b.clabe)}
        </div>
      </div>
    </div>
  `;
}

function seccionDocumentos(docs: NonNullable<SolicitudPDFData['documentos']>): string {
    const filas = docs
        .map(
            (d) => `
      <tr>
        <td>${d.tipoDocumento}</td>
        <td>${d.nombreArchivo}</td>
        <td>${d.estatus}</td>
        <td>${d.fechaCarga}</td>
      </tr>`
        )
        .join('');

    return `
    <div class="section">
      ${sectionHeader('Documentos Anexos')}
      <div class="card">
        <table class="data-table">
          <thead><tr><th>Tipo</th><th>Archivo</th><th>Estatus</th><th>Fecha</th></tr></thead>
          <tbody>${filas}</tbody>
        </table>
      </div>
    </div>
  `;
}

function seccionFirmas(): string {
    return `
    <div class="firmas">
      <div class="firma-box">
        <div class="firma-linea"></div>
        <div class="firma-label">Firma del Solicitante</div>
      </div>
      <div class="firma-box">
        <div class="firma-linea"></div>
        <div class="firma-label">Firma del Gestor / Autoriza</div>
      </div>
    </div>
  `;
}