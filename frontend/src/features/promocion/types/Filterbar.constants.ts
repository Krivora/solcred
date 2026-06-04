// ─────────────────────────────────────────────────────────────────────────────
// filter-bar.constants.ts
//
// Campos reutilizables entre distintos componentes de filtros.
// Importa solo los que necesites y compón el array FIELDS localmente.
// ─────────────────────────────────────────────────────────────────────────────

import type { FilterField as FilterFieldConfig } from './Filterbar.types'

export const SEARCH_SOLICITANTE_FIELD: FilterFieldConfig = {
  type: 'search',
  key: 'busqueda',
  placeholder: 'Nombre o RFC...',
}

export const TIPO_PERSONA_FIELD: FilterFieldConfig = {
  type: 'select',
  key: 'tipoPersona',
  placeholder: 'Tipo persona',
  options: [
    { value: 'FISICA', label: 'Persona Física' },
    { value: 'MORAL',  label: 'Persona Moral'  },
  ],
}

export const SECTOR_FIELD: FilterFieldConfig = {
  type: 'select',
  key: 'sector',
  placeholder: 'Sector',
  allLabel: 'Todos los sectores',
  options: [
    { value: 'AGROPECUARIO', label: 'Agropecuario' },
    { value: 'INDUSTRIAL',   label: 'Industrial'   },
    { value: 'COMERCIAL',    label: 'Comercial'    },
    { value: 'SERVICIOS',    label: 'Servicios'    },
    { value: 'TECNOLOGIA',   label: 'Tecnología'   },
    { value: 'OTRO',         label: 'Otro'         },
  ],
}

export const TAMANO_EMPRESA_FIELD: FilterFieldConfig = {
  type: 'select',
  key: 'tamanoEmpresa',
  placeholder: 'Tamaño',
  allLabel: 'Tamaño empresa',
  minWidth: 'min-w-30',
  options: [
    { value: 'MICRO',   label: 'Micro'   },
    { value: 'PEQUENA', label: 'Pequeña' },
    { value: 'MEDIANA', label: 'Mediana' },
    { value: 'GRANDE',  label: 'Grande'  },
  ],
}

export const PERIODO_FIELD: FilterFieldConfig = {
  type: 'daterange',
  fromKey: 'fechaDesde',
  toKey: 'fechaHasta',
  label: 'Período:',
}