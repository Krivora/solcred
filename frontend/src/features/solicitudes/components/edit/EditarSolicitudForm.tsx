// EditarSolicitudForm.tsx
'use client'

import { useSolicitudForm } from '../../hooks/useSolicitudForm'
import { EditarSolicitudSidebar } from './EditarSolicitudSidebar'
import { StepGeneral } from '../form/StepGeneral'
import { PersonaForm } from '../form/PersonaForm'
import { StepCredito } from '../form/StepCredito'
import { GarantiaForm } from '../form/GarantiaForm'
import { NegocioForm } from '../form/NegocioForm'
import { MercadoForm } from '../form/MercadoForm'
import { BancariosForm } from '../form/BancariosForm'
import { StepResumen } from '../form/StepResumen'
import { useRouter } from 'next/navigation'
import { toast } from '@/shared/lib/utils/toast'
import { Check } from 'lucide-react'

interface Props {
    solicitudId: string
}

export function EditarSolicitudForm({ solicitudId }: Props) {
    const router = useRouter()
    const {
        currentStep,
        solicitud,
        loading,
        error,
        guardadoOk,
        goBack,
        goTo,
        guardarGenerales,
        guardarSolicitante,
        guardarAval,
        guardarCredito,
        guardarGarantia,
        guardarNegocio,
        guardarMercado,
        guardarBancarios,
        enviarSolicitud,
        skipAval,
    } = useSolicitudForm({ solicitudIdExistente: solicitudId })

    async function handleEnviar() {
        await enviarSolicitud()
        toast.success('Solicitud enviada correctamente')
        router.push('/dashboard/usuarios/solicitudes')
    }

    if (loading && !solicitud) {
        return (
            <div className="flex items-center justify-center py-24">
                <span className="size-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            </div>
        )
    }

    if (!solicitud) {
        return (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
                {error ?? 'No se pudo cargar la solicitud.'}
            </div>
        )
    }

    return (
        <div className="max-w-8xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold text-foreground">
                        Editar solicitud — Folio {solicitud.folio}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Los cambios se guardan por sección, de forma independiente.
                    </p>
                </div>
                {guardadoOk && (
                    <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        <Check className="size-3.5" />
                        Guardado
                    </div>
                )}
            </div>

            <div className="flex gap-6">
                <EditarSolicitudSidebar
                    currentStep={currentStep}
                    onSelect={goTo}
                    solicitud={solicitud}
                    />

                <div className="flex-1 bg-card rounded-xl border border-border p-6 shadow-sm">
                    {currentStep === 'general' && (
                        <StepGeneral
                            solicitud={solicitud}
                            onSubmit={guardarGenerales}
                            onBack={goBack}
                            loading={loading}
                            error={error}
                        />
                    )}

                    {currentStep === 'solicitante' && (
                        <PersonaForm
                            title="Datos del solicitante"
                            subtitle="Información personal de quien solicita el crédito"
                            defaultValues={solicitud.datosSolicitante}
                            onSubmit={guardarSolicitante}
                            onBack={goBack}
                            loading={loading}
                            error={error}
                        />
                    )}

                    {currentStep === 'aval' && (
                        <PersonaForm
                            title="Datos del aval"
                            subtitle="Información de la persona que respalda la solicitud"
                            defaultValues={solicitud.datosAval}
                            onSubmit={guardarAval}
                            onBack={goBack}
                            loading={loading}
                            error={error}
                            skipLabel="Omitir aval"
                            onSkip={skipAval}
                        />
                    )}

                    {currentStep === 'credito' && (
                        <StepCredito
                            defaultValues={solicitud.datosCredito}
                            onSubmit={guardarCredito}
                            onBack={goBack}
                            loading={loading}
                            error={error}
                        />
                    )}

                    {currentStep === 'garantia' && (
                        <GarantiaForm
                            defaultValues={solicitud.datosGarantia}
                            onSubmit={guardarGarantia}
                            onBack={goBack}
                            loading={loading}
                        />
                    )}

                    {currentStep === 'negocio' && (
                        <NegocioForm
                            defaultValues={solicitud.datosNegocio}
                            onSubmit={guardarNegocio}
                            onBack={goBack}
                            loading={loading}
                        />
                    )}

                    {currentStep === 'mercado' && (
                        <MercadoForm
                            defaultValues={solicitud.datosMercado}
                            onSubmit={guardarMercado}
                            onBack={goBack}
                            loading={loading}
                        />
                    )}

                    {currentStep === 'bancarios' && (
                        <BancariosForm
                            defaultValues={solicitud.datosBancarios}
                            onSubmit={guardarBancarios}
                            onBack={goBack}
                            loading={loading}
                        />
                    )}

                    {currentStep === 'resumen' && (
                        <StepResumen
                            solicitud={solicitud}
                            onEnviar={handleEnviar}
                            onBack={goBack}
                            loading={loading}
                            error={error}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}