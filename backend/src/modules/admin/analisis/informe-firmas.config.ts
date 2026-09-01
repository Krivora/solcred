/**
 * Firmantes del bloque de autorización del Informe Ejecutivo de Crédito.
 *
 * Es configuración editable a mano: ajusta esta lista según el comité vigente.
 * El orden es el de impresión (rejilla de 2 columnas). No hay lógica de negocio
 * detrás — solo son las líneas de firma que se imprimen al pie del informe.
 */
export interface FirmanteInforme {
  nombre: string;
  cargo: string;
}

export const TITULO_AUTORIZACION = "Autorización del Comité Interno de Crédito";

export const FIRMANTES_INFORME_EJECUTIVO: FirmanteInforme[] = [
  { nombre: "Lic. Néstor Paredes Lugo", cargo: "Director General de Normatividad y Cartera" },
  { nombre: "Mtro. Héctor Iván Almada Acosta", cargo: "Coordinador Ejecutivo" },
  { nombre: "C.P. Jorge Hernández Ciscomani", cargo: "Director General de Administración y Financiamiento" },
  { nombre: "C.P. José Othón Ramos Rodríguez", cargo: "Director General de Desarrollo Regional" },
  { nombre: "Dr. Diego Alberto Avilés Quintanar", cargo: "Coordinador Ejecutivo" },
  { nombre: "Lic. Paulina Anallely Sánchez Romero", cargo: "Directora General de Desarrollo Sostenible" },
];
