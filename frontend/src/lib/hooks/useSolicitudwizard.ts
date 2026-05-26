'use client';

import { useState, useCallback } from 'react';
import {
    crearSolicitud,
    actualizarDatosSolicitante,
    actualizarDatosAval,
    enviarSolicitud,
} from '@/lib/api/solicitudes';
import {
    WizardState,
    CrearSolicitudPayload,
    DatosPersona,
    ProgramaResumen,
} from '@/lib/types/solicitud.types';

const INITIAL_STATE: WizardState = {
    solicitudId: null,
    currentStep: 1,
    datosGenerales: {},
    datosSolicitante: {},
    datosAval: {},
    programa: null,
};

export function useSolicitudWizard() {
    const [state, setState] = useState<WizardState>(INITIAL_STATE);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const setPrograma = useCallback((programa: ProgramaResumen) => {
        setState((prev) => ({ ...prev, programa }));
    }, []);

    // ─── Step 1: crear solicitud ─────────────────────────────────────────────────

    const submitDatosGenerales = useCallback(
        async (payload: CrearSolicitudPayload) => {
            setLoading(true);
            setError(null);
            try {
                const solicitud = await crearSolicitud(payload);
                setState((prev) => ({
                    ...prev,
                    solicitudId: solicitud.id,
                    datosGenerales: payload,
                    currentStep: 2,
                }));
                return solicitud;
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Error al crear solicitud');
                throw e;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    // ─── Step 2: datos del solicitante ───────────────────────────────────────────

    const submitDatosSolicitante = useCallback(
        async (datos: DatosPersona) => {
            if (!state.solicitudId) return;
            setLoading(true);
            setError(null);
            try {
                await actualizarDatosSolicitante(state.solicitudId, datos);
                // Determinar siguiente step según requerimiento del aval
                const avalRequerimiento = state.programa?.aval ?? 'NO_REQUIERE';
                const nextStep = avalRequerimiento !== 'NO_REQUIERE' ? 3 : 4; // 4 = confirmación
                setState((prev) => ({
                    ...prev,
                    datosSolicitante: datos,
                    currentStep: nextStep,
                }));
            } catch (e) {
                setError(
                    e instanceof Error ? e.message : 'Error al guardar datos del solicitante'
                );
                throw e;
            } finally {
                setLoading(false);
            }
        },
        [state.solicitudId, state.programa]
    );

    // ─── Step 3: datos del aval ──────────────────────────────────────────────────

    const submitDatosAval = useCallback(
        async (datos: DatosPersona) => {
            if (!state.solicitudId) return;
            setLoading(true);
            setError(null);
            try {
                await actualizarDatosAval(state.solicitudId, datos);
                setState((prev) => ({
                    ...prev,
                    datosAval: datos,
                    currentStep: 4, // confirmación
                }));
            } catch (e) {
                setError(
                    e instanceof Error ? e.message : 'Error al guardar datos del aval'
                );
                throw e;
            } finally {
                setLoading(false);
            }
        },
        [state.solicitudId]
    );

    // ─── Enviar solicitud ────────────────────────────────────────────────────────

    const submitEnviar = useCallback(async () => {
        if (!state.solicitudId) return;
        setLoading(true);
        setError(null);
        try {
            const solicitud = await enviarSolicitud(state.solicitudId);
            setState((prev) => ({ ...prev, currentStep: 5 })); // éxito
            return solicitud;
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al enviar solicitud');
            throw e;
        } finally {
            setLoading(false);
        }
    }, [state.solicitudId]);

    const goToStep = useCallback((step: number) => {
        setState((prev) => ({ ...prev, currentStep: step }));
    }, []);

    const reset = useCallback(() => {
        setState(INITIAL_STATE);
        setError(null);
    }, []);

    return {
        state,
        loading,
        error,
        setPrograma,
        submitDatosGenerales,
        submitDatosSolicitante,
        submitDatosAval,
        submitEnviar,
        goToStep,
        reset,
    };
}