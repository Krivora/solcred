'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as gruposApi from '@/features/settings/api/grupos.api'
import { grupoKeys } from '@/features/settings/lib/settings.keys'
import type {
    CrearGrupoDto,
    ActualizarGrupoDto,
} from '@/features/settings/types/grupos.types'
import { grupoToast } from '@/shared/lib/toaster'

export function useGrupos() {
    const qc = useQueryClient()

    const {
        data: grupos = [],
        isLoading: cargando,
        isError,
        error: queryError,
    } = useQuery({
        queryKey: grupoKeys.list(),
        queryFn: gruposApi.listarGrupos,
    })

    const invalidar = () => qc.invalidateQueries({ queryKey: grupoKeys.all })

    const crearMut = useMutation({
        mutationFn: (dto: CrearGrupoDto) => gruposApi.crearGrupo(dto),
        onSuccess: () => {
            grupoToast.creado()
            invalidar()
        },
        onError: (err: unknown) => grupoToast.crearError((err as Error)?.message),
    })

    const actualizarMut = useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: ActualizarGrupoDto }) =>
            gruposApi.actualizarGrupo(id, dto),
        onSuccess: () => {
            grupoToast.actualizado()
            invalidar()
        },
        onError: (err: unknown) => grupoToast.actualizarError((err as Error)?.message),
    })

    const eliminarMut = useMutation({
        mutationFn: (id: string) => gruposApi.eliminarGrupo(id),
        onSuccess: () => {
            grupoToast.desactivado()
            invalidar()
        },
        onError: (err: unknown) => grupoToast.eliminarError((err as Error)?.message),
    })

    const crear = async (dto: CrearGrupoDto): Promise<boolean> => {
        try {
            await crearMut.mutateAsync(dto)
            return true
        } catch {
            return false
        }
    }

    const actualizar = async (id: string, dto: ActualizarGrupoDto): Promise<boolean> => {
        try {
            await actualizarMut.mutateAsync({ id, dto })
            return true
        } catch {
            return false
        }
    }

    const eliminar = async (id: string): Promise<boolean> => {
        try {
            await eliminarMut.mutateAsync(id)
            return true
        } catch {
            return false
        }
    }

    return {
        grupos,
        cargando,
        error: isError ? ((queryError as Error)?.message ?? 'Error al cargar grupos') : null,
        recargar: invalidar,
        crear,
        actualizar,
        eliminar,
    }
}
