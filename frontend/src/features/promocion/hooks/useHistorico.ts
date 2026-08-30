'use client'

import { solicitudesApi } from '@/features/promocion/api/promocion.api'
import { promocionKeys } from '@/features/promocion/lib/promocion.keys'
import { useListadoPromocion } from '@/features/promocion/hooks/useListadoPromocion'
import type { FiltrosAprobacion } from '@/features/promocion/types/solicitud.types'

const FILTROS_INICIALES: FiltrosAprobacion = {
    page: 1,
    limit: 10,
    tipoPersona: '',
    sector: '',
    tamanoEmpresa: '',
    programaId: '',
    fechaDesde: '',
    fechaHasta: '',
    busqueda: '',
}

export function useHistorico(filtrosIniciales?: Partial<FiltrosAprobacion>) {
    return useListadoPromocion<FiltrosAprobacion>(
        {
            queryKey: promocionKeys.historico,
            queryFn: (f) => solicitudesApi.listarHistorico(f),
            filtrosIniciales: FILTROS_INICIALES,
            errorMsg: 'No se pudieron cargar las solicitudes en histórico.',
        },
        filtrosIniciales,
    )
}
