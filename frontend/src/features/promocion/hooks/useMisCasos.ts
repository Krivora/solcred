'use client'

import { solicitudesApi } from '@/features/promocion/api/promocion.api'
import { promocionKeys } from '@/features/promocion/lib/promocion.keys'
import { useListadoPromocion } from '@/features/promocion/hooks/useListadoPromocion'
import type { FiltrosMisCasos } from '@/features/promocion/types/solicitud.types'

const FILTROS_INICIALES: FiltrosMisCasos = {
    page: 1,
    limit: 10,
    estatus: '',
    tipoPersona: '',
    sector: '',
    tamanoEmpresa: '',
    programaId: '',
    fechaDesde: '',
    fechaHasta: '',
    busqueda: '',
}

export function useMisCasos(filtrosIniciales?: Partial<FiltrosMisCasos>) {
    return useListadoPromocion<FiltrosMisCasos>(
        {
            queryKey: promocionKeys.misCasos,
            queryFn: (f) => solicitudesApi.listarMisCasos(f),
            filtrosIniciales: FILTROS_INICIALES,
            errorMsg: 'No se pudieron cargar los casos asignados.',
        },
        filtrosIniciales,
    )
}
