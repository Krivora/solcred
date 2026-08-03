import { SolicitudPDFData, GarantiaPDF } from '../pdf.types';
import { baseLayout, bar, f, row, block, formatoMoneda } from './base.layout';

export function solicitudTemplate(data: SolicitudPDFData): string {
  const contenido = [
    seccionGeneral(data),
    data.datosSolicitante ? seccionPersona('Datos del Solicitante', data.datosSolicitante) : '',
    data.datosAval ? seccionPersona('Datos del Aval', data.datosAval) : '',
    data.datosNegocio ? seccionNegocio(data.datosNegocio) : '',
    data.datosCredito ? seccionCredito(data.datosCredito) : '',
    data.datosGarantia && data.datosGarantia.length > 0 ? seccionGarantias(data.datosGarantia) : '',
    data.datosMercado ? seccionMercado(data.datosMercado) : '',
    data.datosBancarios ? seccionBancarios(data.datosBancarios) : '',
    data.documentos && data.documentos.length > 0 ? seccionDocumentos(data.documentos) : '',
  ]
    .filter(Boolean)
    .join('\n');

  return baseLayout({
    folio: data.folio,
    lugar: 'Hermosillo, Sonora, México',
    fechaEnvio: data.fechaSolicitud,
    contenido,
    nombreSolicitante: data.datosSolicitante?.nombreCompleto ?? '',
  });
}

function seccionGeneral(data: SolicitudPDFData): string {
  return block(
    bar('Datos Generales'),
    row(
      f('Folio', data.folio, 'quarter'),
      f('Programa', data.programa, 'half'),
      f('Fecha de envío', data.fechaSolicitud, 'quarter'),
    ) +
    row(
      f('Sector', data.sector, 'third'),
      f('Tipo de persona', data.tipoPersona, 'third'),
      f('Tamaño de empresa', data.tamanoEmpresa, 'third')
    )
  );
}

function seccionPersona(titulo: string, p: NonNullable<SolicitudPDFData['datosSolicitante']>): string {
  return block(
    bar(titulo),
    row(
      f('Nombre completo', p.nombreCompleto, 'half'),
      f('CURP', p.curp, 'quarter'),
      f('RFC', p.rfc, 'quarter')
    ) +
    row(
      f('No. INE', p.numeroINE, 'quarter'),
      f('Estado civil', p.estadoCivil, 'quarter'),
      f('Nivel de estudio', p.nivelEstudio, 'quarter'),
      f('Universidad', p.universidad, 'quarter')
    ) +
    row(
      f('Domicilio', p.domicilio, 'full')
    ) +
    row(
      f('Correo', p.correo, 'third'),
      f('Teléfono', p.telefono, 'third'),
      f('Celular', p.celular, 'third')
    ) +
    row(
      f('Tipo de vivienda', p.tipoVivienda, 'quarter'),
      f('Años dom. actual', p.aniosDomicilioActual, 'quarter', ' años'),
      f('Años dom. anterior', p.aniosDomicilioAnterior, 'quarter', ' años'),
      f('Nombre del cónyuge', p.nombreConyuge, 'quarter')
    )
  );
}

function seccionNegocio(n: NonNullable<SolicitudPDFData['datosNegocio']>): string {
  return block(
    bar('Datos del Negocio'),
    row(
      f('Razón social', n.razonSocial, 'half'),
      f('RFC', n.rfcNegocio, 'quarter'),
      f('Tipo de local', n.tipoLocal, 'quarter')
    ) +
    row(
      f('Nombre comercial', n.nombreNegocio, 'half'),
      f('Domicilio del negocio', n.domicilioNegocio, 'half')
    ) +
    row(
      f('Actividad', n.actividadNegocio, 'quarter'),
      f('Área', n.areaNegocio, 'quarter'),
      f('Antigüedad', n.antiguedadNegocio, 'quarter', ' años'),
      f('Inicio de operaciones', n.fechaInicioOperaciones, 'quarter')
    ) +
    row(
      f('Empleos conservados', n.empleosConservados, 'quarter'),
      f('Empleos nuevos', n.empleosNuevos, 'quarter'),
      f('Exp. en la actividad', n.experienciaActividadSolicitante, 'quarter', ' años'),
      f('Exp. como empresario', n.experienciaEmpresarioSolicitante, 'quarter', ' años')
    ) +
    row(
      f('Exporta actualmente', n.actualExporta === null ? null : n.actualExporta ? 'Sí' : 'No', 'quarter'),
      f('Tel. de recados', n.telefonoRecadosNegocio, 'quarter'),
      f('Tel. fijo', n.telefonoFijoNegocio, 'quarter')
    )
  );
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

  return block(
    bar('Datos del Crédito'),
    row(
      f('Plazo', c.plazoMeses, 'quarter', ' meses'),
      f('Meses de gracia', c.mesesGracia, 'quarter'),
      f('Monto total', formatoMoneda(c.montoTotal), 'quarter')
    ) +
    `<table class="data-table">
      <thead><tr><th>Categoría</th><th>Concepto</th><th style="text-align:right;">Monto</th></tr></thead>
      <tbody>${filas}</tbody>
      <tfoot><tr><td colspan="2">Total</td><td class="numeric">${formatoMoneda(c.montoTotal)}</td></tr></tfoot>
    </table>`
  );
}

function seccionGarantias(garantias: GarantiaPDF[]): string {
  const bloques = garantias
    .map((g, i) => {
      const especificos =
        g.tipo === 'PRENDARIA'
          ? row(
              f('Marca', g.marca, 'quarter'),
              f('Modelo', g.modelo, 'quarter'),
              f('Año', g.anio, 'quarter'),
              f('No. de serie', g.numeroSerie, 'quarter')
            )
          : row(
              f('Domicilio', g.domicilio, 'half'),
              f('No. escritura', g.numeroEscritura, 'quarter'),
              f('Folio real', g.folioReal, 'quarter')
            );

      return (
        row(
          f(`Garantía ${i + 1} — Tipo`, g.tipo, 'quarter'),
          f('Propietario', g.nombrePropietario, 'quarter'),
          f('Valor', formatoMoneda(g.valor), 'quarter'),
          f('Descripción', g.descripcion, 'quarter')
        ) + especificos
      );
    })
    .join('');

  return block(bar('Garantías'), bloques);
}

function seccionMercado(m: NonNullable<SolicitudPDFData['datosMercado']>): string {
  return block(
    bar('Datos de Mercado'),
    row(f('Principales productos', m.principalesProductos, 'full')) +
    row(...m.distribucionClientes.map((d) => f(d.label, d.valor, 'quarter', d.valor === null ? '' : '%'))) +
    row(...m.coberturaGeografica.map((c) => f(c.label, c.valor, 'quarter', c.valor === null ? '' : '%')))
  );
}

function seccionBancarios(b: NonNullable<SolicitudPDFData['datosBancarios']>): string {
  return block(
    bar('Datos Bancarios'),
    row(
      f('Banco', b.banco, 'third'),
      f('Número de cuenta', b.numeroCuenta, 'third'),
      f('CLABE', b.clabe, 'third')
    )
  );
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

  return block(
    bar('Documentos Anexos'),
    `<table class="data-table">
      <thead><tr><th>Tipo</th><th>Archivo</th><th>Estatus</th><th>Fecha</th></tr></thead>
      <tbody>${filas}</tbody>
    </table>`
  );
}