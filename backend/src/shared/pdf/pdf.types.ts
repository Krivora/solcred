export interface SolicitudPDFData {
    folio: string;
    estatus: string;
    programa: string;
    fechaSolicitud: string;
    tipoPersona: string | null;
    sector: string | null;
    tamanoEmpresa: string | null;

    datosSolicitante: DatosPersonaPDF | null;
    datosAval: DatosPersonaPDF | null;
    datosNegocio: DatosNegocioPDF | null;
    datosCredito: DatosCreditoPDF | null;
    datosGarantia: GarantiaPDF[] | null;
    datosMercado: DatosMercadoPDF | null;
    datosBancarios: DatosBancariosPDF | null;
    documentos: DocumentoPDF[] | null;
}

export interface DatosPersonaPDF {
    nombreCompleto: string;
    curp: string | null;
    rfc: string | null;
    telefono: string | null;
    celular: string | null;
    correo: string | null;
    domicilio: string;
    nivelEstudio: string | null;
    universidad: string | null;
    estadoCivil: string | null;
    nombreConyuge: string | null;
    numeroINE: string | null;
    tipoVivienda: string | null;
    aniosDomicilioActual: number | null;
    aniosDomicilioAnterior: number | null;
}

export interface DatosNegocioPDF {
    razonSocial: string | null;
    rfcNegocio: string | null;
    nombreNegocio: string | null;
    domicilioNegocio: string;
    actividadNegocio: string | null;
    areaNegocio: string | null;
    empleosConservados: number | null;
    empleosNuevos: number | null;
    fechaInicioOperaciones: string | null;
    antiguedadNegocio: number | null;
    tipoLocal: string | null;
    experienciaActividadSolicitante: number | null;
    experienciaEmpresarioSolicitante: number | null;
    actualExporta: boolean | null;
    telefonoRecadosNegocio: string | null;
    telefonoFijoNegocio: string | null;
}

export interface DatosCreditoPDF {
    plazoMeses: number;
    mesesGracia: number;
    montoTotal: number;
    conceptos: ConceptoCreditoPDF[];
}

export interface ConceptoCreditoPDF {
    categoria: string;
    concepto: string;
    monto: number;
}

export interface GarantiaPDF {
    tipo: string;
    nombrePropietario: string;
    valor: number;
    descripcion: string | null;
    // Prendaria
    marca: string | null;
    modelo: string | null;
    anio: number | null;
    numeroSerie: string | null;
    // Hipotecaria
    domicilio: string | null;
    numeroEscritura: string | null;
    folioReal: string | null;
}

export interface DatosMercadoPDF {
    principalesProductos: string | null;
    distribucionClientes: { label: string; valor: number | null }[];
    coberturaGeografica: { label: string; valor: number | null }[];
}

export interface DatosBancariosPDF {
    banco: string;
    numeroCuenta: string | null;
    clabe: string;
}

export interface DocumentoPDF {
    nombreArchivo: string;
    tipoDocumento: string;
    estatus: string;
    fechaCarga: string;
}