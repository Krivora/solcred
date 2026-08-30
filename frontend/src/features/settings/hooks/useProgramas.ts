'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as programasApi from '@/features/settings/api/programas.api'
import { programaKeys, tipoDocumentoKeys } from '@/features/settings/lib/settings.keys'
import type {
    Programa,
    ProgramaFormData,
    TipoDocumento,
} from '@/features/settings/types/programa.types'
import { programaToast } from '@/shared/lib/toaster'

export function useProgramas() {
    const qc = useQueryClient()

    const {
        data: programas = [],
        isLoading: cargando,
        isError,
        error: queryError,
    } = useQuery({
        queryKey: programaKeys.list(),
        queryFn: programasApi.getProgramas,
    })

    const invalidar = () => qc.invalidateQueries({ queryKey: programaKeys.all })

    const crearMut = useMutation({
        mutationFn: (data: ProgramaFormData) => programasApi.crearPrograma(data),
        onSuccess: (nuevo) => {
            programaToast.creado(nuevo.nombre)
            invalidar()
        },
        onError: (err: unknown) => programaToast.crearError((err as Error)?.message),
    })

    const actualizarMut = useMutation({
        mutationFn: ({ id, data }: { id: string; data: ProgramaFormData }) =>
            programasApi.actualizarPrograma(id, data),
        onSuccess: (actualizado) => {
            programaToast.actualizado(actualizado.nombre)
            invalidar()
        },
        onError: (err: unknown) => programaToast.actualizarError((err as Error)?.message),
    })

    const activarMut = useMutation({
        mutationFn: (id: string) => programasApi.activarPrograma(id),
        onSuccess: () => {
            programaToast.activado()
            invalidar()
        },
        onError: (err: unknown) => programaToast.cambiarEstadoError((err as Error)?.message),
    })

    const desactivarMut = useMutation({
        mutationFn: (id: string) => programasApi.desactivarPrograma(id),
        onSuccess: () => {
            programaToast.desactivado()
            invalidar()
        },
        onError: (err: unknown) => programaToast.cambiarEstadoError((err as Error)?.message),
    })

    const crear = async (data: ProgramaFormData): Promise<Programa | null> => {
        try {
            return await crearMut.mutateAsync(data)
        } catch {
            return null
        }
    }

    const actualizar = async (id: string, data: ProgramaFormData): Promise<Programa | null> => {
        try {
            return await actualizarMut.mutateAsync({ id, data })
        } catch {
            return null
        }
    }

    const activar = async (id: string): Promise<boolean> => {
        try {
            await activarMut.mutateAsync(id)
            return true
        } catch {
            return false
        }
    }

    const desactivar = async (id: string): Promise<boolean> => {
        try {
            await desactivarMut.mutateAsync(id)
            return true
        } catch {
            return false
        }
    }

    return {
        programas,
        cargando,
        error: isError ? ((queryError as Error)?.message ?? 'Error al cargar programas') : null,
        recargar: invalidar,
        crear,
        actualizar,
        activar,
        desactivar,
    }
}

// ── Un programa por id ──────────────────────────────────────────────────────
export function usePrograma(id: string) {
    const qc = useQueryClient()

    const {
        data: programa = null,
        isLoading: loading,
        isError,
    } = useQuery({
        queryKey: programaKeys.detail(id),
        queryFn: () => programasApi.getPrograma(id),
        enabled: !!id,
    })

    const toggleMut = useMutation({
        mutationFn: () =>
            programa?.activo
                ? programasApi.desactivarPrograma(id)
                : programasApi.activarPrograma(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: programaKeys.all })
        },
        onError: (err: unknown) => programaToast.cambiarEstadoError((err as Error)?.message),
    })

    return {
        programa,
        loading,
        isError,
        toggling: toggleMut.isPending,
        toggle: () => toggleMut.mutateAsync(),
        recargar: () => qc.invalidateQueries({ queryKey: programaKeys.detail(id) }),
    }
}

// ── Hook independiente para tipos de documento ──────────────────────────────
export function useTiposDocumento() {
    const qc = useQueryClient()

    const { data: tipos = [], isLoading: cargando } = useQuery({
        queryKey: tipoDocumentoKeys.list(),
        queryFn: programasApi.getTiposDocumento,
    })

    const crearMut = useMutation({
        mutationFn: (data: { nombre: string; descripcion?: string }) =>
            programasApi.crearTipoDocumento(data),
        onSuccess: () => {
            programaToast.tipoDocumentoCreado()
            qc.invalidateQueries({ queryKey: tipoDocumentoKeys.all })
        },
        onError: (err: unknown) => programaToast.tipoDocumentoError((err as Error)?.message),
    })

    const actualizarMut = useMutation({
        mutationFn: ({ id, data }: { id: string; data: { nombre?: string; descripcion?: string | null } }) =>
            programasApi.actualizarTipoDocumento(id, data),
        onSuccess: () => {
            programaToast.tipoDocumentoActualizado()
            qc.invalidateQueries({ queryKey: tipoDocumentoKeys.all })
        },
        onError: (err: unknown) => programaToast.tipoDocumentoError((err as Error)?.message),
    })

    const eliminarMut = useMutation({
        mutationFn: (id: string) => programasApi.eliminarTipoDocumento(id),
        onSuccess: () => {
            programaToast.tipoDocumentoEliminado()
            qc.invalidateQueries({ queryKey: tipoDocumentoKeys.all })
        },
        onError: (err: unknown) => programaToast.tipoDocumentoError((err as Error)?.message),
    })

    const crear = async (data: {
        nombre: string
        descripcion?: string
    }): Promise<TipoDocumento | null> => {
        try {
            return await crearMut.mutateAsync(data)
        } catch {
            return null
        }
    }

    const actualizar = async (
        id: string,
        data: { nombre?: string; descripcion?: string | null },
    ): Promise<boolean> => {
        try {
            await actualizarMut.mutateAsync({ id, data })
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
        tipos,
        cargando,
        recargar: () => qc.invalidateQueries({ queryKey: tipoDocumentoKeys.all }),
        crear,
        actualizar,
        eliminar,
        guardando: actualizarMut.isPending,
        eliminando: eliminarMut.isPending,
    }
}

// ── Documentos por programa ──────────────────────────────────────────────────
export function useDocumentosPrograma(programaId: string) {
    const qc = useQueryClient()

    const invalidarPrograma = () => {
        qc.invalidateQueries({ queryKey: programaKeys.detail(programaId) })
        qc.invalidateQueries({ queryKey: programaKeys.lists() })
    }

    const agregarMut = useMutation({
        mutationFn: (data: {
            tipoDocumentoId: string
            esObligatorio: boolean
            aplicaA?: 'FISICA' | 'MORAL' | 'AMBOS'
        }) => programasApi.agregarDocumento(programaId, data),
        onSuccess: () => {
            programaToast.documentoAgregado()
            invalidarPrograma()
        },
        onError: (err: unknown) => programaToast.documentoAgregarError((err as Error)?.message),
    })

    const quitarMut = useMutation({
        mutationFn: (tipoDocumentoId: string) =>
            programasApi.quitarDocumento(programaId, tipoDocumentoId),
        onSuccess: () => {
            programaToast.documentoQuitado()
            invalidarPrograma()
        },
        onError: (err: unknown) => programaToast.documentoQuitarError((err as Error)?.message),
    })

    const agregar = async (
        data: { tipoDocumentoId: string; esObligatorio: boolean; aplicaA?: 'FISICA' | 'MORAL' | 'AMBOS' },
        onSuccess?: () => void,
    ): Promise<boolean> => {
        try {
            await agregarMut.mutateAsync(data)
            onSuccess?.()
            return true
        } catch {
            return false
        }
    }

    const quitar = async (
        tipoDocumentoId: string,
        onSuccess?: () => void,
    ): Promise<boolean> => {
        try {
            await quitarMut.mutateAsync(tipoDocumentoId)
            onSuccess?.()
            return true
        } catch {
            return false
        }
    }

    return {
        procesando: agregarMut.isPending || quitarMut.isPending,
        agregar,
        quitar,
    }
}
