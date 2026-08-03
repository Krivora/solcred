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

export interface CartaRechazoPDFData {
    folio: string;
    programa: string;
    monto: string;
    fechaSolicitud: string;
    fechaRechazo: string;
    lugarFecha: string;
    nombreDestinatario: string;
    domicilioDestinatario: string;
    motivoRechazo: string;
}

export interface TarjetaInformativaPDFData {
    folio: string;
    solicitanteNombre: string;
    programa: string;
    fechaRegistro: string;
    montoSolicitado: string | null;
    municipio: string | null;
    sector: string | null;
    tamanoEmpresa: string | null;
    tipoPersona: string | null;
    estatusActual: string;

    gestorActual: { nombre: string; grupo: string; fechaAsignacion: string } | null;
    historialAsignaciones: {
        gestor: string;
        grupo: string;
        fechaAsignacion: string;
        fechaReasignacion: string | null;
        motivoReasignacion: string | null;
        asignadoPor: string | null;
    }[];

    historialEstatus: {
        estatusAnterior: string;
        estatusNuevo: string;
        fecha: string;
        usuario: string;
        motivo: string | null;
    }[];

    timeline: { fecha: string; titulo: string; detalle: string | null; tipo: 'estatus' | 'asignacion' }[];

    documentos: {
        totalRequeridos: number;
        totalSubidos: number;
        aprobados: number;
        rechazados: number;
        pendientes: number;
        porcentajeAvance: number;
        detalle: { nombre: string; estatus: string; version: number; motivoRechazo: string | null }[];
    };

    observaciones: string[];
}
export interface AcuseEntregaExpedientePDFData {
    folio: string;
    lugar: string;
    fecha: string;
    solicitanteNombre: string;
    programa: string;
    monto: string;
    documentos: string[];
    comentarios: string | null;
    entrega: { nombre: string; cargo: string };
    reviso: { nombre: string; cargo: string };
}