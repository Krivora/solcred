'use client'

import { useSolicitudForm } from '@/features/solicitudes/hooks/useSolicitudForm'
import { EditarSolicitudSidebar } from './EditarSolicitudSidebar'
import { StepGeneral } from '@/features/solicitudes/components/form/StepGeneral'
import { PersonaForm } from '@/features/solicitudes/components/form/PersonaForm'
import { StepCredito } from '@/features/solicitudes/components/form/StepCredito'
import { GarantiaForm } from '@/features/solicitudes/components/form/GarantiaForm'
import { NegocioForm } from '@/features/solicitudes/components/form/NegocioForm'
import { MercadoForm } from '@/features/solicitudes/components/form/MercadoForm'
import { BancariosForm } from '@/features/solicitudes/components/form/BancariosForm'
import { StepResumen } from '@/features/solicitudes/components/form/StepResumen'
import { useRouter } from 'next/navigation'
import { Check, User, Users } from 'lucide-react'
import { PageHeader } from '@/shared/components/common/PageHeader'

interface Props {
    solicitudId: string
}

export function EditarSolicitudForm({ solicitudId }: Props) {
    const router = useRouter()
    const {
        currentStep,
        pasosActivos,
        pasoOmitible,
        omitirPaso,
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
    } = useSolicitudForm({ solicitudIdExistente: solicitudId })

    async function handleEnviar() {
        await enviarSolicitud()
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
        <div className="space-y-6">
            <PageHeader
                title={`Editar solicitud — Folio ${solicitud.folio}`}
                description="Los cambios se guardan por sección, de forma independiente."
                backHref="/dashboard/usuarios/solicitudes"
            >
                {guardadoOk && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                        <Check className="size-3.5" />
                        Guardado
                    </span>
                )}
            </PageHeader>

            <div className="flex gap-6">
                <EditarSolicitudSidebar
                    currentStep={currentStep}
                    pasosActivos={pasosActivos}
                    onSelect={goTo}
                    solicitud={solicitud}
                />

                <div className="flex-1 bg-card rounded-xl border border-border p-6 shadow-sm">
                  <div key={currentStep} className="animate-step-in">
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
                            icon={User}
                            title="Datos del solicitante"
                            subtitle="Información personal de quien solicita el crédito"
                            defaultValues={solicitud.datosSolicitante}
                            onSubmit={guardarSolicitante}
                            onBack={goBack}
                            loading={loading}
                            error={error}
                            skipLabel={pasoOmitible ? 'Omitir solicitante' : undefined}
                            onSkip={pasoOmitible ? omitirPaso : undefined}
                        />
                    )}

                    {currentStep === 'aval' && (
                        <PersonaForm
                            icon={Users}
                            title="Datos del aval"
                            subtitle="Información de la persona que respalda la solicitud"
                            defaultValues={solicitud.datosAval}
                            onSubmit={guardarAval}
                            onBack={goBack}
                            loading={loading}
                            error={error}
                            skipLabel={pasoOmitible ? 'Omitir aval' : undefined}
                            onSkip={pasoOmitible ? omitirPaso : undefined}
                        />
                    )}

                    {currentStep === 'credito' && (
                        <StepCredito
                            defaultValues={solicitud.datosCredito}
                            onSubmit={guardarCredito}
                            onBack={goBack}
                            loading={loading}
                            error={error}
                            skipLabel={pasoOmitible ? 'Omitir crédito' : undefined}
                            onSkip={pasoOmitible ? omitirPaso : undefined}
                        />
                    )}

                    {currentStep === 'garantia' && (
                        <GarantiaForm
                            defaultValues={solicitud.datosGarantia}
                            onSubmit={guardarGarantia}
                            onBack={goBack}
                            loading={loading}
                            skipLabel={pasoOmitible ? 'Omitir garantía' : undefined}
                            onSkip={pasoOmitible ? omitirPaso : undefined}
                        />
                    )}

                    {currentStep === 'negocio' && (
                        <NegocioForm
                            defaultValues={solicitud.datosNegocio}
                            onSubmit={guardarNegocio}
                            onBack={goBack}
                            loading={loading}
                            skipLabel={pasoOmitible ? 'Omitir negocio' : undefined}
                            onSkip={pasoOmitible ? omitirPaso : undefined}
                        />
                    )}

                    {currentStep === 'mercado' && (
                        <MercadoForm
                            defaultValues={solicitud.datosMercado}
                            onSubmit={guardarMercado}
                            onBack={goBack}
                            loading={loading}
                            skipLabel={pasoOmitible ? 'Omitir mercado' : undefined}
                            onSkip={pasoOmitible ? omitirPaso : undefined}
                        />
                    )}

                    {currentStep === 'bancarios' && (
                        <BancariosForm
                            defaultValues={solicitud.datosBancarios}
                            onSubmit={guardarBancarios}
                            onBack={goBack}
                            loading={loading}
                            skipLabel={pasoOmitible ? 'Omitir bancarios' : undefined}
                            onSkip={pasoOmitible ? omitirPaso : undefined}
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
        </div>
    )
}