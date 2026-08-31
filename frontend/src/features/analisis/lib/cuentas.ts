/**
 * Catálogo de cuentas del Balance General y el Estado de Resultados.
 * Basado en la herramienta de referencia (`index.html`), con las cuentas de
 * efecto neto partidas en pares positivos ("Utilidad" / "Pérdida (-)") para
 * que ninguna celda acepte negativos.
 *
 * `FILAS_*` describe el render completo (secciones, cuentas y renglones de
 * total). Las fórmulas viven en `calculo-situacion-financiera.ts`.
 */

export type FilaBalance =
  | { tipo: 'seccion'; titulo: string }
  | { tipo: 'cuenta'; key: string; label: string; deduccion?: boolean }
  | { tipo: 'autocuenta'; key: 'utilEjercicio'; label: string } // fluye del Estado de Resultados
  | { tipo: 'total'; key: TotalBalanceKey; label: string; enfasis?: 'sub' | 'grand' | 'medio' }

export type FilaResultados =
  | { tipo: 'seccion'; titulo: string }
  | { tipo: 'cuenta'; key: string; label: string; deduccion?: boolean }
  | { tipo: 'total'; key: TotalResultadosKey; label: string; enfasis?: 'sub' | 'grand' | 'medio' }

export type TotalBalanceKey =
  | 'totActCirc' | 'totActNoCirc' | 'sumaActivo'
  | 'totPasCirc' | 'totPasNoCirc' | 'sumaPasivo'
  | 'totCapital' | 'sumaPasivoCapital'

export type TotalResultadosKey =
  | 'totIngresos' | 'totCostos' | 'utilBruta'
  | 'totGastosAdm' | 'totGastosVta' | 'ebit'
  | 'totRif' | 'utilAntesImp' | 'totImpuestos' | 'utilNeta'

// ─────────────────────────────────────────────────────────────────────────────
// BALANCE GENERAL
// ─────────────────────────────────────────────────────────────────────────────

export const FILAS_BALANCE: FilaBalance[] = [
  { tipo: 'seccion', titulo: 'Activo Circulante' },
  { tipo: 'cuenta', key: 'caja', label: 'Caja' },
  { tipo: 'cuenta', key: 'bancos', label: 'Bancos' },
  { tipo: 'cuenta', key: 'invTemp', label: 'Inversiones Temporales' },
  { tipo: 'cuenta', key: 'clientes', label: 'Clientes' },
  { tipo: 'cuenta', key: 'estIncobrables', label: 'Estimación para Cuentas Incobrables', deduccion: true },
  { tipo: 'cuenta', key: 'docCobrar', label: 'Documentos por Cobrar' },
  { tipo: 'cuenta', key: 'deudores', label: 'Deudores Diversos' },
  { tipo: 'cuenta', key: 'ivaAcred', label: 'IVA Acreditable' },
  { tipo: 'cuenta', key: 'impFavor', label: 'Impuestos a Favor' },
  { tipo: 'cuenta', key: 'inventarios', label: 'Inventarios' },
  { tipo: 'cuenta', key: 'antProv', label: 'Anticipo a Proveedores' },
  { tipo: 'cuenta', key: 'pagAnt', label: 'Pagos Anticipados' },
  { tipo: 'cuenta', key: 'otrosActCirc', label: 'Otros Activos Circulantes' },
  { tipo: 'total', key: 'totActCirc', label: 'Total Activo Circulante', enfasis: 'sub' },

  { tipo: 'seccion', titulo: 'Activo No Circulante' },
  { tipo: 'cuenta', key: 'terrenos', label: 'Terrenos' },
  { tipo: 'cuenta', key: 'edificios', label: 'Edificios' },
  { tipo: 'cuenta', key: 'depEdificios', label: 'Depreciación Acumulada de Edificios', deduccion: true },
  { tipo: 'cuenta', key: 'maquinaria', label: 'Maquinaria y Equipo' },
  { tipo: 'cuenta', key: 'depMaquinaria', label: 'Depreciación Acumulada de Maquinaria', deduccion: true },
  { tipo: 'cuenta', key: 'transporte', label: 'Equipo de Transporte' },
  { tipo: 'cuenta', key: 'depTransporte', label: 'Depreciación Acum. Equipo de Transporte', deduccion: true },
  { tipo: 'cuenta', key: 'mobiliario', label: 'Mobiliario y Equipo de Oficina' },
  { tipo: 'cuenta', key: 'depMobiliario', label: 'Depreciación Acumulada de Mobiliario', deduccion: true },
  { tipo: 'cuenta', key: 'computo', label: 'Equipo de Cómputo' },
  { tipo: 'cuenta', key: 'depComputo', label: 'Depreciación Acum. Equipo de Cómputo', deduccion: true },
  { tipo: 'cuenta', key: 'intangibles', label: 'Activos Intangibles' },
  { tipo: 'cuenta', key: 'amortIntangibles', label: 'Amortización Acumulada de Intangibles', deduccion: true },
  { tipo: 'cuenta', key: 'depGarantia', label: 'Depósitos en Garantía' },
  { tipo: 'cuenta', key: 'otrosActNoCirc', label: 'Otros Activos No Circulantes' },
  { tipo: 'total', key: 'totActNoCirc', label: 'Total Activo No Circulante', enfasis: 'sub' },

  { tipo: 'total', key: 'sumaActivo', label: 'Suma del Activo', enfasis: 'grand' },

  { tipo: 'seccion', titulo: 'Pasivo Circulante' },
  { tipo: 'cuenta', key: 'proveedores', label: 'Proveedores' },
  { tipo: 'cuenta', key: 'docPagar', label: 'Documentos por Pagar' },
  { tipo: 'cuenta', key: 'acreedores', label: 'Acreedores Diversos' },
  { tipo: 'cuenta', key: 'prestBancarios', label: 'Préstamos Bancarios' },
  { tipo: 'cuenta', key: 'antClientes', label: 'Anticipo de Clientes' },
  { tipo: 'cuenta', key: 'impPagar', label: 'Impuestos por Pagar' },
  { tipo: 'cuenta', key: 'nominaPagar', label: 'Nómina por Pagar' },
  { tipo: 'cuenta', key: 'divPagar', label: 'Dividendos por Pagar' },
  { tipo: 'cuenta', key: 'otrosPasCirc', label: 'Otros Pasivos Circulantes' },
  { tipo: 'total', key: 'totPasCirc', label: 'Total Pasivo Circulante', enfasis: 'sub' },

  { tipo: 'seccion', titulo: 'Pasivo No Circulante' },
  { tipo: 'cuenta', key: 'prestLP', label: 'Préstamos Bancarios a Largo Plazo' },
  { tipo: 'cuenta', key: 'hipotecas', label: 'Hipotecas por Pagar' },
  { tipo: 'cuenta', key: 'arrendamientos', label: 'Arrendamientos por Pagar' },
  { tipo: 'cuenta', key: 'impDiferidos', label: 'Impuestos Diferidos Pasivos' },
  { tipo: 'cuenta', key: 'otrosPasNoCirc', label: 'Otros Pasivos No Circulantes' },
  { tipo: 'total', key: 'totPasNoCirc', label: 'Total Pasivo No Circulante', enfasis: 'sub' },

  { tipo: 'total', key: 'sumaPasivo', label: 'Suma del Pasivo', enfasis: 'medio' },

  { tipo: 'seccion', titulo: 'Capital Contribuido' },
  { tipo: 'cuenta', key: 'capSocial', label: 'Capital Social' },
  { tipo: 'cuenta', key: 'primaVenta', label: 'Prima en Venta de Acciones' },
  { tipo: 'cuenta', key: 'aportacionesFut', label: 'Aportaciones para Futuros Aumentos de Capital' },
  { tipo: 'cuenta', key: 'otrosContrib', label: 'Otros Componentes del Capital Contribuido' },

  { tipo: 'seccion', titulo: 'Capital Ganado' },
  { tipo: 'cuenta', key: 'utilRetenidas', label: 'Utilidades Retenidas' },
  { tipo: 'cuenta', key: 'perdAcumuladas', label: 'Pérdidas Acumuladas', deduccion: true },
  { tipo: 'autocuenta', key: 'utilEjercicio', label: 'Utilidad o Pérdida del Ejercicio (del Estado de Resultados)' },
  { tipo: 'cuenta', key: 'reservaLegal', label: 'Reserva Legal' },
  { tipo: 'cuenta', key: 'otrosGanado', label: 'Otros Componentes del Capital Ganado' },
  { tipo: 'total', key: 'totCapital', label: 'Total Capital Contable', enfasis: 'sub' },

  { tipo: 'total', key: 'sumaPasivoCapital', label: 'Suma Pasivo + Capital', enfasis: 'grand' },
]

// ─────────────────────────────────────────────────────────────────────────────
// ESTADO DE RESULTADOS
// ─────────────────────────────────────────────────────────────────────────────

export const FILAS_RESULTADOS: FilaResultados[] = [
  { tipo: 'seccion', titulo: 'Ingresos Operativos' },
  { tipo: 'cuenta', key: 'ventas', label: 'Ventas / Ingresos' },
  { tipo: 'cuenta', key: 'descDevoluciones', label: 'Descuentos y Devoluciones sobre Ventas', deduccion: true },
  { tipo: 'cuenta', key: 'otrosIngOper', label: 'Otros Ingresos Operativos' },
  { tipo: 'total', key: 'totIngresos', label: 'Total Ingresos Operativos Netos', enfasis: 'sub' },

  { tipo: 'seccion', titulo: 'Costos Operativos' },
  { tipo: 'cuenta', key: 'costoVentas', label: 'Costo de Ventas' },
  { tipo: 'cuenta', key: 'compras', label: 'Compras de Mercancías' },
  { tipo: 'cuenta', key: 'fletesCompras', label: 'Fletes sobre Compras' },
  { tipo: 'cuenta', key: 'manoObra', label: 'Mano de Obra Directa' },
  { tipo: 'cuenta', key: 'otrosCostos', label: 'Otros Costos Operativos' },
  { tipo: 'total', key: 'totCostos', label: 'Total Costos Operativos', enfasis: 'sub' },

  { tipo: 'total', key: 'utilBruta', label: 'Utilidad Bruta', enfasis: 'medio' },

  { tipo: 'seccion', titulo: 'Gastos de Administración' },
  { tipo: 'cuenta', key: 'sueldosAdm', label: 'Sueldos de Administración' },
  { tipo: 'cuenta', key: 'rentaOficina', label: 'Rentas de Oficina' },
  { tipo: 'cuenta', key: 'servPublicos', label: 'Servicios Públicos' },
  { tipo: 'cuenta', key: 'mantenimiento', label: 'Mantenimiento' },
  { tipo: 'cuenta', key: 'depreciaciones', label: 'Depreciaciones y Amortizaciones' },
  { tipo: 'cuenta', key: 'honorarios', label: 'Honorarios Profesionales' },
  { tipo: 'cuenta', key: 'segurosLic', label: 'Seguros y Licencias' },
  { tipo: 'cuenta', key: 'papeleria', label: 'Papelería y Útiles' },
  { tipo: 'cuenta', key: 'otrosAdm', label: 'Otros Gastos de Administración' },
  { tipo: 'total', key: 'totGastosAdm', label: 'Total Gastos de Administración', enfasis: 'sub' },

  { tipo: 'seccion', titulo: 'Gastos de Ventas' },
  { tipo: 'cuenta', key: 'comisiones', label: 'Comisiones sobre Ventas' },
  { tipo: 'cuenta', key: 'publicidad', label: 'Publicidad y Marketing' },
  { tipo: 'cuenta', key: 'fletesEnvios', label: 'Fletes y Envíos' },
  { tipo: 'cuenta', key: 'sueldosVta', label: 'Sueldos de Ventas' },
  { tipo: 'cuenta', key: 'empaques', label: 'Empaques y Embalajes' },
  { tipo: 'cuenta', key: 'viaticos', label: 'Viáticos Comerciales' },
  { tipo: 'cuenta', key: 'otrosVta', label: 'Otros Gastos de Ventas' },
  { tipo: 'total', key: 'totGastosVta', label: 'Total Gastos de Ventas', enfasis: 'sub' },

  { tipo: 'total', key: 'ebit', label: 'Utilidad de Operación (EBIT)', enfasis: 'medio' },

  { tipo: 'seccion', titulo: 'Resultado Integral de Financiamiento' },
  { tipo: 'cuenta', key: 'interesesGanados', label: 'Intereses Ganados' },
  { tipo: 'cuenta', key: 'interesesPagados', label: 'Intereses Pagados', deduccion: true },
  { tipo: 'cuenta', key: 'comisionesBanc', label: 'Comisiones Bancarias', deduccion: true },
  { tipo: 'cuenta', key: 'utilCambiaria', label: 'Utilidad Cambiaria' },
  { tipo: 'cuenta', key: 'perdCambiaria', label: 'Pérdida Cambiaria', deduccion: true },
  { tipo: 'cuenta', key: 'prodFinancieros', label: 'Otros Productos Financieros' },
  { tipo: 'cuenta', key: 'gastosFinancieros', label: 'Otros Gastos Financieros', deduccion: true },
  { tipo: 'total', key: 'totRif', label: 'Total RIF Neto', enfasis: 'sub' },

  { tipo: 'seccion', titulo: 'Otros Ingresos y Gastos' },
  { tipo: 'cuenta', key: 'utilVentaActivos', label: 'Utilidad en Venta de Activos' },
  { tipo: 'cuenta', key: 'perdVentaActivos', label: 'Pérdida en Venta de Activos', deduccion: true },
  { tipo: 'cuenta', key: 'subsidios', label: 'Subsidios y Donaciones' },
  { tipo: 'cuenta', key: 'otrosIngNoOper', label: 'Otros Ingresos No Operativos' },
  { tipo: 'cuenta', key: 'otrosGastosNoOper', label: 'Otros Gastos No Operativos', deduccion: true },
  { tipo: 'total', key: 'utilAntesImp', label: 'Utilidad antes de Impuestos', enfasis: 'sub' },

  { tipo: 'seccion', titulo: 'Impuestos a la Utilidad' },
  { tipo: 'cuenta', key: 'isrCorriente', label: 'ISR Corriente' },
  { tipo: 'cuenta', key: 'isrDiferido', label: 'ISR Diferido' },
  { tipo: 'cuenta', key: 'otrosImpuestos', label: 'Otros Impuestos a la Utilidad' },

  { tipo: 'total', key: 'utilNeta', label: 'Utilidad Neta Final', enfasis: 'grand' },
]

/** Keys de todas las cuentas capturables de cada estado (para inicializar / iterar). */
export const CUENTAS_BALANCE: string[] = FILAS_BALANCE.filter((f) => f.tipo === 'cuenta').map((f) => f.key)
export const CUENTAS_RESULTADOS: string[] = FILAS_RESULTADOS.filter((f) => f.tipo === 'cuenta').map((f) => f.key)
